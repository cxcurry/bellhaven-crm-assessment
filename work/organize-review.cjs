const fs=require('fs');
const p='outputs/Bellhaven-CRM-Review.html';let h=fs.readFileSync(p,'utf8');
const d=JSON.parse(fs.readFileSync('work/reconciliation.json'));
const held=['Bellhaven of Ashtabula','Bellhaven of Portsmouth'];
const approved=d.locations.filter(r=>r.classification==='matched'&&!held.includes(r.website.name)).map(r=>r.website.source.split('/').pop());
const setup=`
const confirmedMatches=${JSON.stringify(approved)};
for(const r of data.locations){if(${JSON.stringify(held)}.includes(r.website.name))r.classification='address discrepancy';if(r.website.name==='Amberly Manor')r.classification='identity conflict';}
for(const id of confirmedMatches){decisions[id]={status:'approve',note:'User authorized bulk approval of matching accounts. Name, normalized address, parent and care category align. No CRM update required.',at:new Date().toISOString()};}
try{localStorage.setItem('bellhaven-review-v1',JSON.stringify(decisions))}catch(e){}
data.locations.sort((a,b)=>Number(confirmedMatches.includes(a.website.source.split('/').pop()))-Number(confirmedMatches.includes(b.website.source.split('/').pop())));
`;
h=h.replace('const esc=v=>',setup+'\nconst esc=v=>');
h=h.replace('<option>matched</option>','<option>matched</option><option>address discrepancy</option><option>identity conflict</option>');
h=h.replace("if(c==='missing')", "if(c==='identity conflict')return 'HOLD: same name but different city and state. Do not re-parent this candidate. Identify the correct facility first.';if(c==='address discrepancy')return 'HOLD: facility name matches, but the CRM street or ZIP conflicts with the website. Verify the exact address correction before approval.';if(c==='missing')");
h=h.replace('<div class="stats" id="stats">','<section class="card"><h2>Review queue: unresolved first</h2><p><b>12 matching locations approved as reviewed.</b> They appear at the bottom and need no ownership/name correction. <b>23 locations still need review</b>, plus 5 unlisted CRM accounts in the second tab. Ashtabula and Portsmouth have address conflicts; Amberly Manor has an identity conflict.</p><p>To see only approved records, choose <b>approve</b> in the decision filter. No CRM writes have been made.</p></section><div class="stats" id="stats">');
fs.writeFileSync(p,h);fs.writeFileSync('outputs/Approved-matching-accounts.json',JSON.stringify({authorizedBy:'User request to approve matching accounts',crmWrites:false,approved,held},null,2));console.log('Approved matching records:',approved.length);
