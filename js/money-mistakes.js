
(function () {
  'use strict';

  var ANNUAL_RETURN = 0.05;

  var OCCURRENCES_PER_YEAR = {
    daily: 365,
    weekly: 52,
    monthly: 12
  };

  var YEARS_LABEL = {
    '1': '1 year',
    '5': '5 years',
    '10': '10 years'
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    var itemInput = document.getElementById('mmItemName');
    var costInput = document.getElementById('mmCost');
    var frequencySelect = document.getElementById('mmFrequency');
    var horizonSelect = document.getElementById('mmHorizon');
    var calcBtn = document.getElementById('mmCalcBtn');
    var validationMsg = document.getElementById('mmValidation');
    var results = document.getElementById('mmResults');

    var formulaLine = document.getElementById('mmFormula');
    var outflowAmt = document.getElementById('mmOutflowAmt');
    var outflowSub = document.getElementById('mmOutflowSub');
    var investedAmt = document.getElementById('mmInvestedAmt');
    var investedSub = document.getElementById('mmInvestedSub');
    var outflowBarFill = document.getElementById('mmOutflowBarFill');
    var outflowBarLabel = document.getElementById('mmOutflowBarLabel');
    var investedBarFill = document.getElementById('mmInvestedBarFill');
    var investedBarLabel = document.getElementById('mmInvestedBarLabel');

    // Bail out quietly if this script ends up on a page without the
    // calculator markup.
    if (!costInput || !frequencySelect || !horizonSelect || !calcBtn || !validationMsg || !results) return;

    function formatCurrency(value) {
      return '$' + value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    function calculate() {
      var cost = parseFloat(costInput.value);
      var frequency = frequencySelect.value;
      var years = parseInt(horizonSelect.value, 10);

      var costValid = costInput.value.trim() !== '' && !isNaN(cost) && cost > 0;
      var frequencyValid = frequency === 'daily' || frequency === 'weekly' || frequency === 'monthly';
      var horizonValid = !isNaN(years) && years > 0;

      if (!costValid || !frequencyValid || !horizonValid) {
        validationMsg.textContent = !costValid
          ? 'Please enter a valid cost amount greater than zero.'
          : 'Please choose a frequency and time horizon.';
        validationMsg.hidden = false;
        results.hidden = true;
        return;
      }

      validationMsg.hidden = true;

      var occurrencesPerYear = OCCURRENCES_PER_YEAR[frequency];
      var annualCost = cost * occurrencesPerYear;
      var directOutflow = annualCost * years;

      // Future value of an ordinary annuity of annual contributions,
      // compounded at ANNUAL_RETURN over `years` years.
      var opportunityCost = annualCost * ((Math.pow(1 + ANNUAL_RETURN, years) - 1) / ANNUAL_RETURN);

      var itemLabel = itemInput && itemInput.value.trim() ? itemInput.value.trim() : 'This habit';
      var horizonText = YEARS_LABEL[String(years)] || (years + ' years');

      formulaLine.textContent = 'Direct Cost = Cost \u00D7 Frequency \u00D7 Time  |  Opportunity Cost (5% Compound Growth)';

      outflowAmt.textContent = formatCurrency(directOutflow);
      outflowSub.textContent = horizonText + ' of ' + itemLabel;

      investedAmt.textContent = formatCurrency(opportunityCost);
      investedSub.textContent = 'if invested at 5% annually instead';

      var maxValue = Math.max(directOutflow, opportunityCost, 1);
      var outflowPct = (directOutflow / maxValue) * 100;
      var investedPct = (opportunityCost / maxValue) * 100;

      outflowBarFill.style.width = outflowPct + '%';
      investedBarFill.style.width = investedPct + '%';
      outflowBarLabel.textContent = formatCurrency(directOutflow);
      investedBarLabel.textContent = formatCurrency(opportunityCost);

      results.hidden = false;
    }

    calcBtn.addEventListener('click', calculate);

    [costInput, frequencySelect, horizonSelect].forEach(function (el) {
      el.addEventListener('input', function () {
        if (!validationMsg.hidden) validationMsg.hidden = true;
      });
      el.addEventListener('change', function () {
        if (!validationMsg.hidden) validationMsg.hidden = true;
      });
    });

    costInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') calculate();
    });
  }
})();