
(function () {
  'use strict';

  var VIEW_COUNT_KEY = 'budgetbasics_pages_visited';
  var PROMPTED_KEY = 'budgetbasics_feedback_prompted';
  var PAGE_THRESHOLD = 3;
  var SHOW_DELAY_MS = 1200;
  var AVATAR_SRC = '/images/bee_logo.png';
  var STAR_COUNT = 5;

  function readCount() {
    try {
      return parseInt(sessionStorage.getItem(VIEW_COUNT_KEY) || '0', 10) || 0;
    } catch (err) {
      return 0;
    }
  }

  function writeCount(value) {
    try {
      sessionStorage.setItem(VIEW_COUNT_KEY, String(value));
    } catch (err) { /* sessionStorage unavailable — skip silently */ }
  }

  function alreadyPrompted() {
    try {
      return sessionStorage.getItem(PROMPTED_KEY) === '1';
    } catch (err) {
      return false;
    }
  }

  function markPrompted() {
    try {
      sessionStorage.setItem(PROMPTED_KEY, '1');
    } catch (err) { /* no-op */ }
  }

  function buildPrompt() {
    var root = document.createElement('div');
    root.id = 'bb-feedback-prompt';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Share your feedback');

    root.innerHTML =
      '<div class="bb-fb-header">' +
        '<img class="bb-fb-bee" src="' + AVATAR_SRC + '" alt="">' +
        '<div class="bb-fb-heading">' +
          '<strong>Enjoying your time?</strong>' +
          '<span>Let us know how BudgetBasics is working for you.</span>' +
        '</div>' +
        '<button type="button" class="bb-fb-close" aria-label="Dismiss">&times;</button>' +
      '</div>' +
      '<div class="bb-fb-stars" role="radiogroup" aria-label="Rating out of 5 stars"></div>' +
      '<textarea class="bb-fb-comment" placeholder="Any comments? (optional)" aria-label="Comments"></textarea>' +
      '<div class="bb-fb-actions">' +
        '<button type="button" class="bb-fb-dismiss">Not now</button>' +
        '<button type="button" class="bb-feedback-send">Send</button>' +
      '</div>';

    var bee = root.querySelector('.bb-fb-bee');
    bee.addEventListener('error', function () {
      bee.src = 'https://placehold.co/30x30/f4c95d/12233f?text=%F0%9F%90%9D';
    });

    var starsWrap = root.querySelector('.bb-fb-stars');
    var rating = 0;
    var stars = [];

    for (var i = 0; i < STAR_COUNT; i++) {
      var star = document.createElement('button');
      star.type = 'button';
      star.className = 'bb-feedback-star';
      star.innerHTML = '<i class="fa-solid fa-star"></i>';
      star.setAttribute('role', 'radio');
      star.setAttribute('aria-checked', 'false');
      star.setAttribute('aria-label', (i + 1) + ' star' + (i === 0 ? '' : 's'));
      (function (index) {
        star.addEventListener('click', function () {
          rating = index + 1;
          updateStars(rating);
        });
        star.addEventListener('mouseenter', function () {
          updateStars(index + 1);
        });
      })(i);
      starsWrap.appendChild(star);
      stars.push(star);
    }

    starsWrap.addEventListener('mouseleave', function () {
      updateStars(rating);
    });

    function updateStars(count) {
      stars.forEach(function (star, index) {
        var filled = index < count;
        star.classList.toggle('bb-star-filled', filled);
        star.setAttribute('aria-checked', filled ? 'true' : 'false');
      });
    }

    function dismiss() {
      root.classList.remove('bb-feedback-open');
      root.addEventListener('transitionend', function () {
        if (root.parentNode) root.remove();
      }, { once: true });
      setTimeout(function () {
        if (root.parentNode) root.remove();
      }, 500);
    }

    root.querySelector('.bb-fb-close').addEventListener('click', dismiss);
    root.querySelector('.bb-fb-dismiss').addEventListener('click', dismiss);

    root.querySelector('.bb-feedback-send').addEventListener('click', function () {
      root.innerHTML =
        '<div class="bb-feedback-thanks">' +
          '<i class="fa-solid fa-circle-check"></i>' +
          '<span>Thanks for the feedback' + (rating ? ' and the ' + rating + '-star rating' : '') + '!</span>' +
        '</div>';
      setTimeout(dismiss, 2200);
    });

    document.body.appendChild(root);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.add('bb-feedback-open');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var count = readCount() + 1;
    writeCount(count);

    if (count >= PAGE_THRESHOLD && !alreadyPrompted()) {
      markPrompted();
      setTimeout(buildPrompt, SHOW_DELAY_MS);
    }
  });
})();