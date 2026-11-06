import {createHash} from 'node:crypto';
export const fingerprint=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export const norm=s=>String(s||'').toLowerCase().replace(/\b(northwest|northeast|southwest|southeast|street|avenue|boulevard|road|drive|lane|north|south|east|west)\b/g,x=>({northwest:'nw',northeast:'ne',southwest:'sw',southeast:'se',street:'st',avenue:'ave',boulevard:'blvd',road:'rd',drive:'dr',lane:'ln',north:'n',south:'s',east:'e',west:'w'})[x]).replace(/[^a-z0-9]/g,'');
export const samePlace=(a,b)=>['billing_street','billing_city','billing_state','billing_zip'].every(k=>norm(a[k])===norm(b[k]));
export function reconcile(snapshot){
 const {accounts,locations,parent}=snapshot;let used=new Set();
 const rows=locations.map(w=>{
  const id=w.source.split('/').pop();
  let candidates=accounts.filter(a=>samePlace(a,w)&&!a.duplicate_of_account&&!a.chow_current_account);
  if(!candidates.length)candidates=accounts.filter(a=>norm(a.name)===norm(w.name)&&!a.duplicate_of_account&&!a.chow_current_account);
  if(!candidates.length)candidates=accounts.filter(a=>norm(a.billing_city)===norm(w.billing_city)&&norm(a.billing_state)===norm(w.billing_state)&&norm(a.billing_street)===norm(w.billing_street));
  candidates.forEach(a=>used.add(a.account_id));let kind='missing',recommendation='Needs verification',plan=null,reason='No reliable match. Check alternate names before approving creation.';
  if(candidates.length>1){kind='multiple candidates';reason='Choose a surviving account only after verifying identity. No duplicate changes are automatic.';}
  else if(candidates.length===1){let a=candidates[0];if(!samePlace(a,w)){kind='identity / address conflict';reason='Name or street matches, but the complete address conflicts. Hold this record for investigation.';}
   else {let patch={};if(a.parent_id!==parent.account_id)patch.parent_id=parent.account_id;if(a.name!==w.name)patch.name=w.name;
    kind=Object.keys(patch).length?(patch.parent_id?'ownership correction':'name correction'):'matched';recommendation='Approve';reason=kind==='matched'?'Name, full normalized address and parent match. No CRM write required.':'Full normalized address identifies this facility. Review the exact changes below.';
    if(patch.parent_id&&a.lifetime_revenue>0&&a.outstanding_ar>0){kind='CHOW protection';plan={type:'chow',account_id:a.account_id,newAccount:{name:w.name,parent_id:parent.account_id,billing_street:w.billing_street,billing_city:w.billing_city,billing_state:w.billing_state,billing_zip:w.billing_zip,care_type:a.care_type,status:'Active',lifetime_revenue:0,outstanding_ar:0},before:a};reason='Create a new Bellhaven account; preserve the old parent and balances. Only add its CHOW link.';}
    else if(Object.keys(patch).length)plan={type:'patch',account_id:a.account_id,patch,before:a};
   }
  }
  const row={id,website:w,candidates,kind,recommendation,reason,plan};row.fingerprint=fingerprint({website:w,candidates,plan});return row;
 });
 for(const a of accounts.filter(a=>a.parent_id===parent.account_id&&!used.has(a.account_id)&&!a.duplicate_of_account)){
  let row={id:a.account_id,website:null,candidates:[a],kind:'unlisted account',recommendation:'Needs verification',reason:'Not matched to a current website location. Absence alone does not establish closure.',plan:null};row.fingerprint=fingerprint(a);rows.push(row);
 }
 return rows;
}
export async function executePlan(plan,api,journal,save){
 if(journal.status==='verified')return;
 if(journal.status==='creating'||journal.status==='uncertain')throw Error('A previous request has an uncertain outcome. Verify CRM state before retrying.');
 if(!journal.status){const current=await api('/accounts/'+plan.account_id);if(fingerprint(current)!==fingerprint(plan.before))throw Error('CRM changed since approval. Refresh and review again.');}
 if(plan.type==='patch'){
  if(!journal.status){journal.status='updating';await save();await api('/accounts/'+plan.account_id,'PATCH',plan.patch);}
  const after=await api('/accounts/'+plan.account_id);for(const [k,v] of Object.entries(plan.patch))if(after[k]!==v)throw Error('Update not verified; refresh before retry.');journal.after=after;
 }else{
  if(!journal.newId){journal.status='creating';await save();const created=await api('/accounts','POST',plan.newAccount);if(!created.account_id)throw Error('Create response has no account ID');journal.newId=created.account_id;journal.status='created';await save();}
  const created=await api('/accounts/'+journal.newId);for(const[k,v]of Object.entries(plan.newAccount))if(created[k]!==v)throw Error('New CHOW account failed verification');
  const old=await api('/accounts/'+plan.account_id);for(const k of Object.keys(plan.before).filter(k=>!['updated_at','chow_current_account'].includes(k)))if(JSON.stringify(old[k])!==JSON.stringify(plan.before[k]))throw Error('Old billing account changed; stop for review');
  if(old.chow_current_account&&old.chow_current_account!==journal.newId)throw Error('Conflicting CHOW link');
  if(old.chow_current_account!==journal.newId)await api('/accounts/'+plan.account_id,'PATCH',{chow_current_account:journal.newId});
  const after=await api('/accounts/'+plan.account_id);if(after.chow_current_account!==journal.newId)throw Error('CHOW link not verified');for(const k of Object.keys(plan.before).filter(k=>!['updated_at','chow_current_account'].includes(k)))if(JSON.stringify(after[k])!==JSON.stringify(plan.before[k]))throw Error('Preservation check failed');journal.after=after;
 }
 journal.status='verified';journal.verifiedAt=new Date().toISOString();await save();
}
