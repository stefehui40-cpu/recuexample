import {REGISTRARS,CASHIERS,RATES,parseIdentity,parsePeriod,dateLabel,amount,receiptData} from './core.js';
import {generatePdf} from './pdf.js';
const $=id=>document.getElementById(id),form=$('receipt-form');
let file=null,pdfUrl=null;
for(let age=12;age<=70;age++) $('age').add(new Option(`${age} ans`,age));
for(const [id,names] of [['registrar',REGISTRARS],['cashier',CASHIERS]]) {
  for(const name of [...names,'Autre nom…']) {
    const button=document.createElement('button');button.type='button';button.className='secondary wide';button.textContent=name;
    button.addEventListener('click',()=>{$(id).value=name==='Autre nom…'?'':name;$(`${id}-picker`).open=false;$(id).focus();});
    $(`${id}-choice`).append(button);
  }
}
let autoPeriod='';
function syncInlinePeriod(){
  let data;try{data=identity();}catch{}
  if(data?.period){
    $('start').value=data.period.start;$('end').value=data.period.end;
    autoPeriod=`${dateLabel(data.period.start)} au ${dateLabel(data.period.end)}`;$('period').value=autoPeriod;
  }else if(autoPeriod){
    if($('period').value===autoPeriod){$('period').value='';$('start').value='';$('end').value='';}
    autoPeriod='';
  }
}
function fail(error) {$('error').textContent=error.message||String(error);$('error').hidden=false;}
function identity(){const data=parseIdentity($('quick').value);if($('age').value)data.age=Number($('age').value);return data;}
function updateSummary(){
  let data=null,period=null;try{data=identity();}catch{}try{period=parsePeriod($('period').value);}catch{}
  const unit=data?RATES[data.category]:0;
  const days=period?(Date.parse(period.end)-Date.parse(period.start))/86400000:0;
  $('summary-name').textContent=data?.name||'Patient à renseigner';$('summary-receipt').textContent=`N° de reçu ${data?.receipt||'—'}`;
  $('summary-category').textContent=data?`CAT${data.category}`:'—';$('summary-unit').textContent=unit?`${amount(unit)} FCFA`:'—';$('summary-days').textContent=days?`${days} jour${days>1?'s':''}`:'—';
  const total=days&&unit?`${amount(days*unit)} FCFA`:'— FCFA';$('summary-total').textContent=total;$('mobile-total').textContent=total;
}
for(const id of ['start','end']) $(id).addEventListener('input',()=>{
  if($('start').value&&$('end').value)$('period').value=`${dateLabel($('start').value)} au ${dateLabel($('end').value)}`;
  updateSummary();
});
$('period').addEventListener('input',()=>{try{const p=parsePeriod($('period').value);$('start').value=p.start;$('end').value=p.end;}catch{}});
$('quick').addEventListener('input',()=>{$('age').value='';syncInlinePeriod();});
form.addEventListener('input',updateSummary);form.addEventListener('change',updateSummary);
function discard(){if(pdfUrl)URL.revokeObjectURL(pdfUrl);pdfUrl=null;file=null;$('result').hidden=true;$('download').removeAttribute('href');$('open-pdf').removeAttribute('href');$('result-label').textContent='';}
form.addEventListener('submit',async event=>{
  event.preventDefault();$('error').hidden=true;
  try {
    const input={...identity(),...parsePeriod($('period').value),sex:$('sex').value,registrar:$('registrar').value,cashier:$('cashier').value};
    const data=receiptData(input);$('generate').disabled=true;$('generate').textContent='Création du PDF…';
    const bytes=await generatePdf(data);
    discard();file=new File([bytes],`Recu_${data.receipt}.pdf`,{type:'application/pdf'});pdfUrl=URL.createObjectURL(file);
    $('download').href=pdfUrl;$('download').download=file.name;$('open-pdf').href=pdfUrl;
    $('result-label').textContent=`Reçu ${data.receipt} · ${amount(data.total)} FCFA · 2 exemplaires`;
    $('share-status').textContent='';$('result').hidden=false;
    form.reset();autoPeriod='';for(const details of form.querySelectorAll('details'))details.open=false;updateSummary();
    $('result').scrollIntoView({behavior:'smooth',block:'center'});$('result').focus({preventScroll:true});
  }catch(error){fail(error);$('error').scrollIntoView({behavior:'smooth',block:'center'});}
  finally{$('generate').disabled=false;$('generate').innerHTML='Générer le reçu PDF <span aria-hidden="true">↗</span>';}
});
$('share').addEventListener('click',async()=>{
  if(!file)return;
  try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'Reçu PDF'});$('share-status').textContent='';}
    else{$('share-status').textContent='Téléchargez ou ouvrez le PDF, puis utilisez le partage de votre appareil.';}}
  catch(error){if(error.name!=='AbortError')$('share-status').textContent='Le partage n’a pas abouti. Vous pouvez télécharger le PDF.';}
});
$('discard').addEventListener('click',discard);
window.addEventListener('pagehide',()=>{form.reset();discard();});
window.addEventListener('pageshow',()=>updateSummary());
if('serviceWorker' in navigator){
  navigator.serviceWorker.register(new URL('./sw.js',import.meta.url)).then(()=>navigator.serviceWorker.ready).then(()=>{$('offline').textContent='Disponible hors connexion';}).catch(()=>{$('offline').textContent='Connexion requise';});
}
updateSummary();
