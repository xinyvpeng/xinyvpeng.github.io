(function() {
  'use strict';

  var CACHE_KEY = 'forest_busuanzi_cache';
  var CACHE_EXPIRY = 24 * 60 * 60 * 1000;
  var CANDIDATES = [
    'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js',
    'https://cdn.jsdelivr.net/gh/soxft/cdn@master/busuanzi/busuanzi.pure.mini.js',
    'https://busuanzi.liugev587.workers.dev/busuanzi/2.3/busuanzi.pure.mini.js'
  ];

  var PAGE_KEY = 'busuanzi_pages_visited';

  function getCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function setCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  function showContainer(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = '';
  }

  function applyCachedValues() {
    var cache = getCache();
    var hasValue = false;
    if (cache.uv != null) {
      document.querySelectorAll('#busuanzi_value_site_uv').forEach(function(el) { el.textContent = cache.uv; });
      showContainer('busuanzi_container_site_uv');
      hasValue = true;
    }
    if (cache.pv != null) {
      document.querySelectorAll('#busuanzi_value_site_pv').forEach(function(el) { el.textContent = cache.pv; });
      showContainer('busuanzi_container_site_pv');
      hasValue = true;
    }
    if (cache.pagePv != null) {
      document.querySelectorAll('#busuanzi_value_page_pv').forEach(function(el) { el.textContent = cache.pagePv; });
      showContainer('busuanzi_container_page_pv');
      hasValue = true;
    }
    return hasValue;
  }

  function captureValues() {
    var uvEl = document.querySelector('#busuanzi_value_site_uv');
    var pvEl = document.querySelector('#busuanzi_value_site_pv');
    var ppvEl = document.querySelector('#busuanzi_value_page_pv');
    var uv = uvEl && uvEl.textContent ? uvEl.textContent.trim() : null;
    var pv = pvEl && pvEl.textContent ? pvEl.textContent.trim() : null;
    var pagePv = ppvEl && ppvEl.textContent ? ppvEl.textContent.trim() : null;
    if (uv || pv || pagePv) {
      var cache = getCache();
      if (uv) cache.uv = uv;
      if (pv) cache.pv = pv;
      if (pagePv) cache.pagePv = pagePv;
      cache.timestamp = Date.now();
      setCache(cache);
    }
  }

  function markPageVisited() {
    try {
      var visited = JSON.parse(localStorage.getItem(PAGE_KEY) || '{}');
      var path = window.location.pathname;
      if (!visited[path]) {
        visited[path] = true;
        localStorage.setItem(PAGE_KEY, JSON.stringify(visited));
      }
    } catch (_) {}
  }

  function loadScript(url) {
    return new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.async = true;
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function tryLoadCandidates(index) {
    if (index >= CANDIDATES.length) {
      console.warn('[Forest Busuanzi] All CDN sources failed.');
      return false;
    }
    try {
      await loadScript(CANDIDATES[index]);
      return true;
    } catch (_) {
      console.warn('[Forest Busuanzi] CDN source failed: ' + CANDIDATES[index]);
      return tryLoadCandidates(index + 1);
    }
  }

  function observeBusuanzi() {
    var checkInterval = setInterval(function() {
      var uvEl = document.querySelector('#busuanzi_value_site_uv');
      var pvEl = document.querySelector('#busuanzi_value_site_pv');
      if ((uvEl && uvEl.textContent) || (pvEl && pvEl.textContent)) {
        captureValues();
        clearInterval(checkInterval);
      }
    }, 500);
    setTimeout(function() {
      clearInterval(checkInterval);
    }, 15000);
  }

  applyCachedValues();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      markPageVisited();
      tryLoadCandidates(0).then(function(success) {
        if (success) observeBusuanzi();
      });
    });
  } else {
    markPageVisited();
    tryLoadCandidates(0).then(function(success) {
      if (success) observeBusuanzi();
    });
  }

  document.addEventListener('pjax:success', function() {
    applyCachedValues();
    tryLoadCandidates(0).then(function(success) {
      if (success) observeBusuanzi();
    });
  });
})();
