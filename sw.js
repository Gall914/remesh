const CACHE='retromesh-v1';
const ASSETS=['/'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>
    Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  // Только GET, только наш origin
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  // Firebase, Google Fonts — не кешируем
  if(url.hostname.includes('firebase')||
     url.hostname.includes('gstatic')||
     url.hostname.includes('googleapis')||
     url.hostname.includes('emailjs')||
     url.hostname.includes('cloudflare')) return;

  e.respondWith(
    fetch(e.request)
      .then(res=>{
        const clone=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone));
        return res;
      })
      .catch(()=>caches.match(e.request))
  );
});
