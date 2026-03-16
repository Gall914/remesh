const CACHE='retromesh-v2';

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/'])));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>
    Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.hostname.includes('firebase')||url.hostname.includes('gstatic')||
     url.hostname.includes('googleapis')||url.hostname.includes('emailjs')||
     url.hostname.includes('cloudflare')) return;
  e.respondWith(
    fetch(e.request)
      .then(res=>{ caches.open(CACHE).then(c=>c.put(e.request,res.clone())); return res; })
      .catch(()=>caches.match(e.request))
  );
});

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window'}).then(list=>{
      for(const c of list) if('focus' in c) return c.focus();
      if(clients.openWindow) return clients.openWindow('/');
    })
  );
});
