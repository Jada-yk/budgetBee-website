
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    var pills = document.querySelectorAll('.ig-filter-pill');
    var cards = document.querySelectorAll('.ig-card');
    var noResults = document.getElementById('igNoResults');
    var backdrop = document.getElementById('igModalBackdrop');
    var modalPanels = document.querySelectorAll('.ig-modal-panel');
    var closeButtons = document.querySelectorAll('.ig-modal-close');

    if (!cards.length) return;

    // ---------- Filtering ----------
    function applyFilter(category) {
      var anyVisible = false;

      cards.forEach(function (card) {
        var matches = category === 'all' || card.dataset.category === category;
        card.classList.toggle('ig-hidden', !matches);
        if (matches) anyVisible = true;
      });

      if (noResults) noResults.hidden = anyVisible;
    }

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('ig-active'); });
        pill.classList.add('ig-active');
        applyFilter(pill.dataset.filter);
      });
    });

    // ---------- Modal ----------
    function openModal(modalId) {
      if (!backdrop) return;
      modalPanels.forEach(function (panel) {
        panel.hidden = panel.id !== modalId;
      });
      backdrop.classList.add('ig-open');
      backdrop.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
      if (!backdrop) return;
      backdrop.classList.remove('ig-open');
      backdrop.setAttribute('aria-hidden', 'true');
    }

    cards.forEach(function (card) {
      var trigger = card.querySelector('[data-modal]');
      if (!trigger) return;
      trigger.addEventListener('click', function () {
        openModal(trigger.dataset.modal);
      });
    });

    closeButtons.forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });

    if (backdrop) {
      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) closeModal();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && backdrop && backdrop.classList.contains('ig-open')) {
        closeModal();
      }
    });
  }
})();