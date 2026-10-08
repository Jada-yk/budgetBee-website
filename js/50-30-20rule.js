
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    var incomeInput = document.getElementById('frIncome');
    var calcBtn = document.getElementById('frCalcBtn');
    var validationMsg = document.getElementById('frValidation');
    var results = document.getElementById('frResults');

    var needsAmt = document.getElementById('frNeedsAmt');
    var wantsAmt = document.getElementById('frWantsAmt');
    var savingsAmt = document.getElementById('frSavingsAmt');

    // Bail out quietly if this script ends up on a page without the
    // calculator markup.
    if (!incomeInput || !calcBtn || !validationMsg || !results) return;

    function formatNaira(value) {
      return '\u20A6' + value.toLocaleString('en-NG', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
    }

    function calculate() {
      var raw = incomeInput.value.trim();
      var income = parseFloat(raw);

      var isValid = raw !== '' && !isNaN(income) && income > 0;

      if (!isValid) {
        validationMsg.hidden = false;
        results.hidden = true;
        incomeInput.setAttribute('aria-invalid', 'true');
        return;
      }

      validationMsg.hidden = true;
      incomeInput.removeAttribute('aria-invalid');

      var needs = income * 0.5;
      var wants = income * 0.3;
      var savings = income * 0.2;

      needsAmt.textContent = formatNaira(needs);
      wantsAmt.textContent = formatNaira(wants);
      savingsAmt.textContent = formatNaira(savings);

      results.hidden = false;
    }

    calcBtn.addEventListener('click', calculate);

    incomeInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') calculate();
    });

    // Clear the error as soon as the user starts fixing the input
    incomeInput.addEventListener('input', function () {
      if (!validationMsg.hidden) validationMsg.hidden = true;
    });
  }
})();