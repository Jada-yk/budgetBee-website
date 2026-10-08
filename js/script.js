
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    initBanner();
    initSearch();
    initScrollReveal();
  });

  // ---------- Mobile nav toggle ----------
  function initNavToggle() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    const backdrop = document.getElementById('navBackdrop');
    if (!toggle || !links || !backdrop) return;

    function openNav() {
      links.classList.add('open');
      backdrop.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    function closeNav() {
      links.classList.remove('open');
      backdrop.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', () => {
      links.classList.contains('open') ? closeNav() : openNav();
    });

    backdrop.addEventListener('click', closeNav);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && links.classList.contains('open')) closeNav();
    });

    // Close the mobile menu after tapping a link
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeNav);
    });
  }

  // ---------- Collapsible welcome banner ----------
  function initBanner() {
    const banner = document.getElementById('banner');
    const toggle = document.getElementById('bannerToggle');
    if (!banner || !toggle) return;

    toggle.addEventListener('click', () => {
      const collapsed = banner.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded', String(!collapsed));
      const icon = toggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-chevron-up', !collapsed);
        icon.classList.toggle('fa-chevron-down', collapsed);
      }
    });
  }

  // ---------- Learning-card keyword search ----------
  function initSearch() {
    const form = document.getElementById('searchForm');
    const input = document.getElementById('searchInput');
    if (!form || !input) return;

    const cards = document.querySelectorAll('.lc-card');
    const noResults = document.getElementById('lcNoResults');
    const cardSection = document.querySelector('.lc-section');

    // Pages with no learning cards (e.g. budgetting-basics.html) can't
    // filter anything locally — send the query to the homepage instead,
    // where the block below picks it up from the URL and filters there.
    if (!cards.length) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = input.value.trim();
        const url = query ? `/index.html?q=${encodeURIComponent(query)}` : '/index.html';
        window.location.href = url;
      });
      return;
    }

    function applyFilter(scrollToResults) {
      const query = input.value.trim().toLowerCase();
      let anyVisible = false;
      let firstMatch = null;

      cards.forEach(card => {
        const keywords = (card.dataset.keywords || '').toLowerCase();
        const matches = query === '' || keywords.includes(query);

        card.classList.toggle('lc-hidden', !matches);

        if (matches && query !== '') {
          if (!firstMatch) firstMatch = card;
          card.classList.add('lc-highlight');
          card.addEventListener('animationend', () => {
            card.classList.remove('lc-highlight');
          }, { once: true });
        }

        if (matches) anyVisible = true;
      });

      if (noResults) noResults.hidden = anyVisible;

      // Jump the user down to the results so filtering is actually visible,
      // rather than silently changing something below the fold.
      if (scrollToResults && cardSection) {
        cardSection.classList.add('is-visible'); // in case scroll-reveal hasn't fired yet
        cardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      applyFilter(true);
    });

    input.addEventListener('input', () => applyFilter(false));

    // If we arrived here via a search submitted from another page
    // (?q=...), run that search automatically on load.
    const params = new URLSearchParams(window.location.search);
    const incomingQuery = params.get('q');
    if (incomingQuery) {
      input.value = incomingQuery;
      applyFilter(true);
    }
  }

  // ---------- Scroll reveal ----------
  function initScrollReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    targets.forEach(el => observer.observe(el));
  }
})();