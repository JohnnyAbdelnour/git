// Lightweight loader that replaces hard-coded arrays with JSON from /data.
// Include this BEFORE your existing script.js in every HTML page.
(function(){
  function base() {
    const p = window.location.pathname;
    return p.includes('/zan-municipality') ? '/zan-municipality' : '';
  }
  async function loadJSON(file){
    const res = await fetch(`${base()}/data/${file}?v=${Date.now()}`);
    if(!res.ok) throw new Error('Failed to load '+file);
    return res.json();
  }
  window.__loadAllData = async function(){
    try {
      const [news, anns, projs, gallery] = await Promise.all([
        loadJSON('news.json'),
        loadJSON('announcements.json'),
        loadJSON('projects.json'),
        loadJSON('gallery.json')
      ]);
      // Normalize to arrays used in your current script.js
      window.newsData = (news.items||[]);
      window.announcementsData = (anns.items||[]);
      window.projectsData = (projs.items||[]);
      window.galleryData = (gallery.albums||[]);

      // Notify that data is ready; your script can listen to this.
      document.dispatchEvent(new CustomEvent('ZAN_DATA_READY'));
    } catch (e){
      console.error('Data load error', e);
    }
  };
  // Auto-run on DOMContentLoaded (before your script listeners if possible)
  document.addEventListener('DOMContentLoaded', function(){ window.__loadAllData(); }, { once: true });
})();
