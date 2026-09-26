const CACHE='recu-mobile-v10';
const FILES=['./','./index.html','./style.css','./app.js','./core.js','./pdf.js','./manifest.webmanifest','./template.png','./ReceiptSans.ttf','./icon.svg','./icon-192.png','./icon-512.png','./pdf-lib.min.js','./fontkit.umd.min.js','./qrcode.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(path=>new Request(path,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('recu-mobile-')&&key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()])));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;
  // Cache only the application files, never a generated PDF or patient data.
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});


