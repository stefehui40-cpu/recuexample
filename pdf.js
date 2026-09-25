import {dateLabel,amount} from './core.js';
let assets;
async function loadAssets() {
  if(!assets) assets=Promise.all(['template.png','ReceiptSans.ttf'].map(async name=>{
    const response=await fetch(new URL(`./${name}`,import.meta.url));
    if(!response.ok) throw Error('Le modèle PDF n’est pas disponible. Ouvrez l’application une première fois avec une connexion.');
    return new Uint8Array(await response.arrayBuffer());
  })).catch(error=>{assets=null;throw error;});
  return assets;
}
export async function generatePdf(data) {
  const {PDFDocument,rgb}=globalThis.PDFLib;
  if(!PDFDocument||!globalThis.fontkit||!globalThis.qrcode) throw Error('Le générateur n’est pas chargé. Rechargez l’application avec une connexion.');
  const [background,fontBytes]=await loadAssets(), doc=await PDFDocument.create();
  doc.registerFontkit(globalThis.fontkit);
  const font=await doc.embedFont(fontBytes,{subset:true}), image=await doc.embedPng(background),page=doc.addPage([595,842]);
  page.drawImage(image,{x:0,y:0,width:595,height:842});
  const black=rgb(0,0,0),slate=rgb(76/255,89/255,107/255);
  function text(value,x,baseline,size=8.925,maxWidth=Infinity,color=black) {
    value=String(value);
    for(const ch of value) if(!font.getCharacterSet().includes(ch.codePointAt(0))) throw Error(`Le caractère « ${ch} » n’est pas pris en charge dans le reçu.`);
    const actualWidth=font.widthOfTextAtSize(value,size);
    const adjusted=actualWidth>maxWidth?size*maxWidth/actualWidth:size;
    if(adjusted<6.4) throw Error('Un texte est trop long pour le modèle. Abrégez le nom ou le numéro concerné.');
    page.drawText(value,{x,y:842-baseline,size:adjusted,font,color});
  }
  text(data.issued.short,24.5,21,8,140);
  const qr=globalThis.qrcode(0,'M');qr.addData(data.receipt,'Numeric');qr.make();
  function drawQr(top) {
    const count=qr.getModuleCount(),size=60,cell=size/(count+8),x=448.5;
    page.drawRectangle({x,y:842-top-size,width:size,height:size,color:rgb(1,1,1)});
    for(let row=0;row<count;row++) for(let col=0;col<count;col++) if(qr.isDark(row,col)) page.drawRectangle({x:x+(col+4)*cell,y:842-top-(row+5)*cell,width:cell+.005,height:cell+.005,color:black});
  }
  for(const [dy,info,table] of [[0,205.5,261.5],[317,530,586]]) {
    // Replace the static heading so the French spelling is visible as “REÇU”.
    page.drawRectangle({x:304,y:799-dy,width:43,height:18,color:rgb(1,1,1)});
    page.drawText('REÇU',{x:306,y:801.8-dy,size:13.7,font,color:black});
    page.drawText('REÇU',{x:306.25,y:801.8-dy,size:13.7,font,color:black});
    text(data.receipt,327.4,48+dy,8.715,150,slate);drawQr(24.4+dy);
    const lines=[`Mode de paiement : Espèces`,`Date de paiement : ${data.paid.date} , ${data.paid.time}`,`Date d’émission ${data.issued.date} , ${data.issued.time}`,`Montant total : ${amount(data.total)} FCFA`,`Montant reçu : ${amount(data.total)} FCFA`,`Monnaie : 0 FCFA`];
