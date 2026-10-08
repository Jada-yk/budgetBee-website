(function () {
  'use strict';

  var AVATAR_SRC = '/images/bee_logo.png';
  var LOADING_TEXT = 'loading content';
  var DOT_COUNT = 8;
  var MIN_DISPLAY_MS = 500;
  var CLICK_LOADER_TIMEOUT_MS = 15000; // safety net if navigation stalls/fails

  var shownAt = Date.now();
  var clickTimeoutId = null;

  function buildLoader() {
    var existing = document.getElementById('bb-loader');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'bb-loader';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');

    var bee = document.createElement('img');
    bee.className = 'bb-loader-bee';
    bee.src = AVATAR_SRC;
    bee.alt = '';
    bee.addEventListener('error', function () {
      bee.src = 'https://placehold.co/90x90/f4c95d/12233f?text=Bee';
    });

    var text = document.createElement('p');
    text.className = 'bb-loader-text';
    text.textContent = LOADING_TEXT;

    var dotsWrap = document.createElement('div');
    dotsWrap.className = 'bb-loader-dots';

    for (var i = 0; i < DOT_COUNT; i++) {
      var dot = document.createElement('span');
      dot.className = 'bb-loader-dot';
      var angle = (360 / DOT_COUNT) * i;
      dot.style.transform = 'rotate(' + angle + 'deg) translate(20px)';
      dot.style.animationDelay = (i * (1 / DOT_COUNT)).toFixed(2) + 's';
      dotsWrap.appendChild(dot);
    }

    overlay.appendChild(bee);
    overlay.appendChild(text);
    overlay.appendChild(dotsWrap);

    // Prepend so it sits on top of everything already in <body>
    // without disturbing existing markup order.
    document.body.insertBefore(overlay, document.body.firstChild);
    return overlay;
  }

  function removeLoaderImmediately(overlay) {
    if (!overlay) return;
    if (clickTimeoutId) {
      clearTimeout(clickTimeoutId);
      clickTimeoutId = null;
    }
    if (overlay.parentNode) overlay.remove();
  }

  function hideLoader(overlay) {
    var elapsed = Date.now() - shownAt;
    var wait = Math.max(MIN_DISPLAY_MS - elapsed, 0);

    setTimeout(function () {
      // Overlay may already be gone (e.g. removed by the bfcache
      // pageshow handler, or a subsequent buildLoader() call).
      if (!overlay || !overlay.parentNode) return;

      overlay.classList.add('bb-loader-hide');
      overlay.addEventListener('transitionend', function () {
        overlay.remove();
      }, { once: true });
      // Fallback in case transitionend doesn't fire (e.g. reduced motion)
      setTimeout(function () {
        if (overlay.parentNode) overlay.remove();
      }, 500);
    }, wait);
  }

  var loaderEl = buildLoader();

  function onPageReady() {
    hideLoader(loaderEl);
  }

  if (document.readyState === 'complete') {
    onPageReady();
  } else {
    window.addEventListener('load', onPageReady);
  }

  // Fix: bfcache restores replay the DOM exactly as it was before unload,
  // including an overlay left visible from a click just before navigating
  // away. No script re-runs on a bfcache restore, so without this the
  // overlay would stay stuck on screen after using Back/Forward.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      var stuck = document.getElementById('bb-loader');
      if (stuck) removeLoaderImmediately(stuck);
    }
  });

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;

    // Fix: modifier/middle clicks (Ctrl/Cmd/Shift/Alt or middle mouse
    // button) open the link in a new tab/window rather than navigating
    // the current page, so the current tab shouldn't show a full-page
    // loading overlay for a navigation it isn't actually performing.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var url;
    try {
      url = new URL(href, window.location.href);
    } catch (err) {
      return;
    }
    if (url.origin !== window.location.origin) return;

    shownAt = Date.now();
    loaderEl = buildLoader();

    if (clickTimeoutId) clearTimeout(clickTimeoutId);
    clickTimeoutId = setTimeout(function () {
      removeLoaderImmediately(loaderEl);
    }, CLICK_LOADER_TIMEOUT_MS);
  });
})();