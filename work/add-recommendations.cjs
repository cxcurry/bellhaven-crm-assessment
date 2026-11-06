const fs=require('fs');const p='outputs/Bellhaven-CRM-Review.html';let h=fs.readFileSync(p,'utf8');
// Seed prior bulk approval only when no reviewer decision exists.
h=h.replace("for(const id of confirmedMatches){decisions[id]=", "for(const id of confirmedMatches){if(!decisions[id])decisions[id]=");
h=h.replace('function proposal(r){','function originalProposal(r){');
const addition=`
function proposal(r){
 let recommendation='Needs verification',reason='The available evidence does not yet establish an exact correction.';
 if(r.classification==='matched'){recommendation='Approve';reason='The facility identity and parent align. No ownership/name update is needed.';}
 if(r.classification==='name correction'){recommendation='Approve';reason='The physical address identifies the facility; use its current website name.';}
 if(r.classification==='wrong parent'){recommendation='Approve';reason=r.billingProtection?'The facility address matches. Approve a new Bellhaven account and CHOW link while preserving the old parent and billing history.':'The facility address matches the current Bellhaven listing. Approve re-parenting the existing account.';}
 if(r.classification==='multiple candidates')reason='Several accounts share the address. Confirm the surviving account and treatment of the other records before approving.';
 if(r.classification==='missing')reason='No candidate was found by the initial matching rules. Check alternate names and address variants before creating an account.';
 if(r.classification==='address discrepancy')reason='Name matches, but the street or ZIP conflicts. Verify the address correction first.';
 if(r.classification==='identity conflict'){recommendation='Reject';reason='Reject re-parenting this candidate: it has the same name but is in a different city and state. The website facility needs a separate match investigation.';}
 return '<strong>My recommendation: '+recommendation+'</strong><br>'+reason+'<br><br>'+originalProposal(r);
}
`;
h=h.replace('function render(){',addition+'\nfunction render(){');
h=h.replace('Absent from the 35 scraped website pages. Proposed:', '<b>My recommendation: Needs verification.</b> Absence alone does not prove closure or ownership change.<br>Absent from the 35 scraped website pages. Proposed:');
h=h.replace('Decision: ', 'Your decision: ');
fs.writeFileSync(p,h);
const script=h.match(/<script>([\s\S]*)<\/script>/)[1];fs.writeFileSync('work/dashboard-check.js',script);
