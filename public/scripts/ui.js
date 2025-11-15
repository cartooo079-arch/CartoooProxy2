(function(){
  // Minimal modern tabbed UI + integration points for UV
  let tabCounter = 1;
  const tabsEl = document.getElementById('tabs');
  const addBtn = document.getElementById('addTab');
  const urlInput = document.getElementById('url');
  const goBtn = document.getElementById('go');
  const main = document.getElementById('main');

  function createTab(title){
    tabCounter++;
    const id = 'tab' + tabCounter;
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.dataset.id = id;
    tab.textContent = title || 'New Tab';
    const close = document.createElement('button');
    close.className = 'close';
    close.textContent = '✕';
    close.onclick = (e)=>{ e.stopPropagation(); closeTab(id); };
    tab.appendChild(close);
    tab.onclick = ()=>{ switchToTab(id); };
    tabsEl.insertBefore(tab, addBtn);
    // create iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'frame-' + id;
    iframe.className = 'browser-frame';
    iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-modals allow-popups';
    iframe.src = 'about:blank';
    main.appendChild(iframe);
    switchToTab(id);
  }

  function switchToTab(id){
    // deactivate tabs
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    const tab = Array.from(document.querySelectorAll('.tab')).find(t=>t.dataset.id===id);
    if(tab) tab.classList.add('active');
    document.querySelectorAll('.browser-frame').forEach(f=>f.classList.remove('active'));
    const f = document.getElementById('frame-' + id);
    if(f) f.classList.add('active');
  }

  function closeTab(id){
    const tab = Array.from(document.querySelectorAll('.tab')).find(t=>t.dataset.id===id);
    const frame = document.getElementById('frame-' + id);
    if(tab) tab.remove();
    if(frame) frame.remove();
    // switch to last tab
    const remaining = document.querySelectorAll('.tab');
    if(remaining.length) {
      const last = remaining[remaining.length-2] || remaining[0];
      if(last) switchToTab(last.dataset.id);
    } else {
      // create a new one
      addBtn.click();
    }
  }

  addBtn.addEventListener('click', ()=>{ createTab('New Tab'); });

  goBtn.addEventListener('click', ()=>{
    const url = urlInput.value.trim();
    if(!url) return;
    let dest = url;
    if(!/^https?:\/\//i.test(dest)) dest = 'https://' + dest;
    const activeTab = document.querySelector('.tab.active');
    const id = activeTab ? activeTab.dataset.id : 'tab1';
    const iframe = document.getElementById('frame-' + id);
    if(iframe){
      // if uvNavigate is available inside iframe content, prefer it
      try{
        const win = iframe.contentWindow;
        if(win && typeof win.uvNavigate === 'function'){
          win.uvNavigate(dest);
        } else {
          iframe.src = 'load.html?url=' + encodeURIComponent(dest);
        }
      }catch(e){
        iframe.src = 'load.html?url=' + encodeURIComponent(dest);
      }
    }
  });

  // init default tab
  document.addEventListener('DOMContentLoaded', ()=>{
    addBtn.click();
  });
})();