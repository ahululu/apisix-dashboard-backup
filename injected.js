window.addEventListener('message', function(event) {
  if (event.source !== window) return;
  if (event.data.type !== 'getLocalStorage') return;
  
  const storage = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    storage[key] = localStorage.getItem(key);
  }
  
  window.postMessage({ 
    type: event.data.eventName,
    storage: storage 
  }, '*');
}); 