
(function () {
  'use strict';

  var QUIZ_ITEMS = [
    {
      text: 'Paying rent for your apartment',
      answer: 'need',
      explanation: "Housing is a basic need — everyone needs a safe place to live, so rent comes before anything else in your budget."
    },
    {
      text: 'The newest smartphone model',
      answer: 'want',
      explanation: "A working phone can be a need, but upgrading to the newest model is about preference, not survival — that makes it a want."
    },
    {
      text: 'Groceries for the week',
      answer: 'need',
      explanation: "Food is essential to stay healthy and functioning, which makes groceries a core need."
    },
    {
      text: 'Going to the cinema with friends',
      answer: 'want',
      explanation: "Fun and entertainment matter, but you can live without them — that's what makes this a want."
    },
    {
      text: 'Bus fare to get to school or work',
      answer: 'need',
      explanation: "Getting to school or work is necessary for your income or education, so transport costs here count as a need."
    },
    {
      text: 'A pair of designer sneakers',
      answer: 'want',
      explanation: "You likely already own footwear — paying extra for the designer label is about style, not necessity."
    },
    {
      text: 'Prescription medication',
      answer: 'need',
      explanation: "Anything prescribed for your health is essential — medicine keeps you well, so it's a need."
    },
    {
      text: 'A monthly streaming subscription',
      answer: 'want',
      explanation: "Entertainment subscriptions are enjoyable extras you can pause any time without harming your wellbeing — a classic want."
    }
  ];

  var current = 0;
  var score = 0;
  var answered = false;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    var itemText = document.getElementById('nwItemText');
    var currentEl = document.getElementById('nwCurrent');
    var totalEl = document.getElementById('nwTotal');
    var nextBtn = document.getElementById('nwNextBtn');
    var resultsActions = document.getElementById('nwResultsActions');
    var retryBtn = document.getElementById('nwRetryBtn');

    var boxes = {
      need: {
        btn: document.querySelector('.nw-need-btn'),
        front: null,
        info: document.getElementById('nwNeedInfo'),
        verdict: null,
        text: null
      },
      want: {
        btn: document.querySelector('.nw-want-btn'),
        front: null,
        info: document.getElementById('nwWantInfo'),
        verdict: null,
        text: null
      }
    };

    // Bail out quietly if this script ends up on a page without the quiz markup
    if (!itemText || !boxes.need.btn || !boxes.want.btn || !boxes.need.info || !boxes.want.info) return;

    boxes.need.front = boxes.need.btn.querySelector('.nw-face-front');
    boxes.want.front = boxes.want.btn.querySelector('.nw-face-front');
    boxes.need.verdict = boxes.need.info.querySelector('.nw-info-verdict');
    boxes.need.text = boxes.need.info.querySelector('.nw-info-text');
    boxes.want.verdict = boxes.want.info.querySelector('.nw-info-verdict');
    boxes.want.text = boxes.want.info.querySelector('.nw-info-text');

    totalEl.textContent = QUIZ_ITEMS.length;

    // True once the last question has been answered and its box is
    // showing the explanation — the next click reveals the score instead
    // of moving to a new question.
    var awaitingResults = false;
    var lastInfoBox = null;

    function resetBox(box) {
      box.btn.disabled = false;
      box.btn.classList.remove('nw-btn-correct', 'nw-btn-incorrect');
      box.front.hidden = false;
      box.info.hidden = true;
    }

    function showQuestion() {
      var item = QUIZ_ITEMS[current];
      currentEl.textContent = current + 1;
      itemText.textContent = item.text;

      resetBox(boxes.need);
      resetBox(boxes.want);

      nextBtn.hidden = true;
      resultsActions.hidden = true;
    }

    function otherChoice(choice) {
      return choice === 'need' ? 'want' : 'need';
    }

    function handleAnswer(choice) {
      if (answered) return;
      answered = true;

      var item = QUIZ_ITEMS[current];
      var isCorrect = choice === item.answer;
      if (isCorrect) score++;

      var chosenBox = boxes[choice];
      var otherBox = boxes[otherChoice(choice)];
      var isLastQuestion = current === QUIZ_ITEMS.length - 1;

      boxes.need.btn.disabled = true;
      boxes.want.btn.disabled = true;

      // The box the user picked stays on its image and just gets a
      // correct/incorrect border.
      chosenBox.btn.classList.add(isCorrect ? 'nw-btn-correct' : 'nw-btn-incorrect');

      // The other box always flips to show the explanation. If the user
      // was wrong, that box is also the correct answer, so mark it too.
      if (!isCorrect) {
        otherBox.btn.classList.add('nw-btn-correct');
      }
      otherBox.front.hidden = true;
      otherBox.info.hidden = false;
      otherBox.verdict.textContent = isCorrect ? 'Correct.' : 'Incorrect.';
      otherBox.text.textContent = item.explanation;
      lastInfoBox = otherBox;

      if (isLastQuestion) {
        awaitingResults = true;
        nextBtn.hidden = false;
        nextBtn.innerHTML = 'See results <i class="fa-solid fa-arrow-right"></i>';
      } else {
        nextBtn.hidden = false;
        nextBtn.innerHTML = 'Next question <i class="fa-solid fa-arrow-right"></i>';
      }
    }

    function showResults() {
      var pct = score / QUIZ_ITEMS.length;
      var heading;
      var message;

      if (pct === 1) {
        heading = 'Perfect score.';
        message = "You clearly know your needs from your wants. Ready for the next lesson?";
      } else if (pct >= 0.5) {
        heading = 'Nice work.';
        message = "You got most of them right. Review the ones you missed above and you'll have this down cold.";
      } else {
        heading = 'Keep practicing.';
        message = "Needs vs wants take a little practice — give it another go.";
      }

      // Reuse whichever box is currently showing an explanation to display
      // the final score instead.
      lastInfoBox.verdict.textContent = 'You scored ' + score + ' / ' + QUIZ_ITEMS.length + ' — ' + heading;
      lastInfoBox.text.textContent = message;

      nextBtn.hidden = true;
      resultsActions.hidden = false;
    }

    boxes.need.btn.addEventListener('click', function () { handleAnswer('need'); });
    boxes.want.btn.addEventListener('click', function () { handleAnswer('want'); });

    nextBtn.addEventListener('click', function () {
      if (awaitingResults) {
        awaitingResults = false;
        showResults();
        return;
      }

      current++;
      answered = false;
      showQuestion();
    });

    retryBtn.addEventListener('click', function () {
      current = 0;
      score = 0;
      answered = false;
      awaitingResults = false;
      resultsActions.hidden = true;
      showQuestion();
    });

    showQuestion();
  }
})();