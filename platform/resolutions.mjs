import {fingerprint,norm,executePlan,updateVerifiedSnapshot} from './engine.mjs';
export async function runResolutions(groups,{api,accounts,journals,save,snapshot}){
 const results=[];for(const g of groups){for(let i=0;i<g.operations.length;i++){const op=g.operations[i],key=fingerprint({group:g.id,operation:op}),j=journals[key]||={};
  try{
   if(j.status==='verified'){results.push({group:g.title,status:'Skipped — already verified',account_id:j.after?.account_id});continue}
   if(op.type==='patch'){
    const now=await api('/accounts/'+op.account_id);if(Object.entries(op.changes).every(([k,v])=>now[k]===v)){j.after=now;j.status='verified';j.verifiedAt=new Date().toISOString();await save();}
    else await executePlan({type:'patch',account_id:op.account_id,before:op.before,patch:op.changes},api,j,save);
    updateVerifiedSnapshot(snapshot,j);
   }else{
    if(j.status==='creating')throw Error('A create request has an uncertain result. Investigate before retrying.');
    if(!j.newId){const fresh=await accounts();const match=fresh.find(a=>!a.duplicate_of_account&&!a.chow_current_account&&['billing_street','billing_city','billing_state','billing_zip'].every(k=>norm(a[k])===norm(op.account[k])));if(match)throw Error('A facility already exists at this address. Refresh and review; no duplicate created.');j.status='creating';await save();const created=await api('/accounts','POST',op.account);if(!created.account_id)throw Error('Create result missing ID');j.newId=created.account_id;j.status='created';await save();}
    const after=await api('/accounts/'+j.newId);for(const[k,v]of Object.entries(op.account))if(after[k]!==v)throw Error('New account verification failed: '+k);j.after=after;j.status='verified';j.verifiedAt=new Date().toISOString();updateVerifiedSnapshot(snapshot,j);await save();
   }
   await save();results.push({group:g.title,status:'Updated and verified',account_id:j.after?.account_id,at:j.verifiedAt});
  }catch(e){results.push({group:g.title,status:'Needs attention',error:e.message});await save();return results}
 }}return results;
}
