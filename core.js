export const REGISTRARS = ['ALLEGBE ARDON RUBEN BORIS JOSE','BOH KANGRO','AGRE OHIE JEAN FERLUS','KOUAME AFFOUE SABINE','KPAZAI ROCK FELLER'];
export const CASHIERS = ['AKA OI AKA LAURENT','KOFFI FRANCOISE AMLAN'];
export const RATES = {1:30000,2:20000,3:10000};
export function parseIdentity(text,now=new Date()) {
  const match=text.trim().replace(/\s+/g,' ').match(/^(.+?)\s+(\d{1,24})\s+CAT\s*([123])\s+(?:du\s+(\d{1,2})\s+au\s+(\d{1,2})\s+)?(\d{1,2})\s*(?:ans?)?\s+(\d{1,24})$/iu);
  if(!match) throw Error('Respectez cet ordre : nom et prénom, ISN, CAT1/2/3, âge, numéro de reçu.');
  const [,name,isn,category,entryDay,exitDay,age,receipt]=match;
  if(+age<12||+age>70) throw Error('L’âge doit être compris entre 12 et 70 ans.');
  let period;
  if(entryDay){
    const [,month,year]=timestamp(now).date.split('/');
    period={start:`${year}-${month}-${entryDay.padStart(2,'0')}`,end:`${year}-${month}-${exitDay.padStart(2,'0')}`};
    stayDays(period.start,period.end);
  }
  return {name:name.toLocaleUpperCase('fr'),receipt,category:+category,age:+age,isn,...(period?{period}:{})};
}
export function dayNumber(value) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw Error('Renseignez les deux dates d’hospitalisation.');
  const [y,m,d]=value.split('-').map(Number), ms=Date.UTC(y,m-1,d), date=new Date(ms);
  if(y<1900||y>2199||date.getUTCFullYear()!==y||date.getUTCMonth()!==m-1||date.getUTCDate()!==d) throw Error('Date invalide.');
  return ms/86400000;
}
export function stayDays(start,end) {
  const days=dayNumber(end)-dayNumber(start);
  if(days<=0) throw Error('La sortie doit être après l’entrée (au moins un jour).');
  return days;
}
export function parsePeriod(text) {
  const m=text.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})\s+au\s+(\d{2})\/(\d{2})\/(\d{4})$/i);
  if(!m) throw Error('Saisissez la période au format 20/09/2026 au 23/09/2026.');
  const start=`${m[3]}-${m[2]}-${m[1]}`,end=`${m[6]}-${m[5]}-${m[4]}`;
  stayDays(start,end); return {start,end};
}
export function dateLabel(iso) { return iso.split('-').reverse().join('/'); }
export function amount(value) { return new Intl.NumberFormat('fr-FR').format(value).replace(/[\u202f\u00a0]/g,' '); }
export function timestamp(date) {
  const parts=Object.fromEntries(new Intl.DateTimeFormat('fr-FR',{timeZone:'Africa/Abidjan',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date).map(p=>[p.type,p.value]));
  return {date:`${parts.day}/${parts.month}/${parts.year}`,time:`${parts.hour}:${parts.minute}:${parts.second}`,short:`${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`};
}
export function receiptData(input,now=new Date()) {
  const name=String(input.name||'').trim().toLocaleUpperCase('fr'), receipt=String(input.receipt||'').trim(),isn=String(input.isn||'').trim();
  if(!name||name.length>90) throw Error('Indiquez un nom de 1 à 90 caractères.');
  if(!/^\d{1,24}$/.test(receipt)||!/^\d{1,24}$/.test(isn)) throw Error('Le numéro de reçu et l’ISN doivent contenir de 1 à 24 chiffres.');
  const age=Number(input.age),category=Number(input.category);
  if(!Number.isInteger(age)||age<12||age>70||!RATES[category]) throw Error('Vérifiez l’âge et la catégorie.');
  if(!['F','M'].includes(input.sex)) throw Error('Choisissez le sexe.');
  for(const key of ['registrar','cashier']) if(!String(input[key]||'').trim()||input[key].trim().length>70) throw Error('Renseignez les deux agents (70 caractères maximum).');
  const days=stayDays(input.start,input.end),unit=RATES[category],total=days*unit;
  if(!Number.isSafeInteger(total)||total>999999999) throw Error('Vérifiez la durée d’hospitalisation.');
  return {...input,name,receipt,isn,age,category,days,unit,total,registrar:input.registrar.trim().toLocaleUpperCase('fr'),cashier:input.cashier.trim().toLocaleUpperCase('fr'),issued:timestamp(now),paid:timestamp(new Date(now.getTime()-40000))};
}
