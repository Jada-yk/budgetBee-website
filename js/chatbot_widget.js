
(function () {
  'use strict';

  const STORAGE_KEY = 'budgetbasics_chat_history';
  const AVATAR_SRC = '/images/bee_logo.png';
  const BOT_NAME = 'Budget Bee';
  const BOT_SUBTITLE = 'BudgetBasics Assistant';
  const GREETING = "Hi, I'm Budget Bee! Ask me about needs vs wants, the 50-30-20 rule, savings goals, or common money mistakes.";
  const DISCLAIMER = 'Educational answers only — not professional financial advice.';
  const FALLBACK = "I don't have an answer for that yet. Try asking about needs vs wants, the 50-30-20 rule, savings goals, or common money mistakes.";
  const TYPING_DELAY_MS = 650; // simulated "thinking" pause before a reply appears

  const SUGGESTED_PROMPTS = [
    'What is a need?',
    'How much should I save?',
    'How do I avoid overspending?'
  ];

  // ---------- Rule-based knowledge base ----------
  // Each entry is checked against the user's message (lowercased).
  // The entry with the most matching keywords wins.
  const KNOWLEDGE_BASE = [
    {
      keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
      response: GREETING
    },
    {
      keywords: ['need', 'needs', 'essential', 'necessity', 'must have'],
      response: "A 'need' is something you can't reasonably do without — rent, groceries, transport to school or work, and utility bills are classic examples. These come first when you're deciding where your money goes."
    },
    {
      keywords: ['want', 'wants', 'nice to have', 'discretionary', 'non-essential'],
      response: "A 'want' is something nice to have but not essential — streaming subscriptions, eating out, or new clothes when your old ones still work. Wants are still fine to budget for, they just come after needs and savings."
    },
    {
      keywords: ['50-30-20', '50/30/20', '50 30 20', 'split', 'rule'],
      response: "The 50-30-20 rule is a simple way to divide income: 50% toward needs, 30% toward wants, and 20% toward savings. It's a guideline, not a strict law — adjust the percentages to fit your own situation."
    },
    {
      keywords: ['save', 'saving', 'savings', 'how much should i save', 'percent'],
      response: "A common starting point is saving around 20% of your income, following the 50-30-20 rule. If that's tight right now, even 5-10% consistently is a solid habit to build — the goal is consistency, not perfection."
    },
    {
      keywords: ['goal', 'target', 'how long', 'months', 'reach my goal'],
      response: "For a savings goal, figure out the amount you still need (target minus what you already have), then divide it by how much you can set aside each month. That gives you a rough number of months to reach it."
    },
    {
      keywords: ['overspend', 'overspending', 'impulse', 'spend too much', 'spending too much'],
      response: "To avoid overspending: wait 24 hours before non-essential purchases, track expenses as you go, unsubscribe from services you don't use, and set a simple weekly spending limit for wants."
    },
    {
      keywords: ['budget', 'budgeting', 'plan my money', 'plan money'],
      response: "Budgeting basics: start with your total income, subtract fixed expenses (rent, bills), then plan the rest across variable expenses, wants, and savings. Writing it down, even roughly, makes it much easier to stick to."
    },
    {
      keywords: ['income', 'expense', 'expenses', 'expenditure'],
      response: "Income is money coming in — allowance, wages, scholarships. Expenses are money going out, split into fixed (rent, subscriptions) and variable (food, transport). Comparing the two each month tells you what's actually left over."
    },
    {
      keywords: ['mistake', 'mistakes', 'subscription', 'subscriptions', 'late payment', 'late fee'],
      response: "Common money mistakes: impulse buying, ignoring small recurring costs, forgotten subscriptions, paying bills late, and spending without any plan at all. Reviewing your expenses regularly catches most of these early."
    },
    {
      keywords: ['about', 'who are you', 'what is this', 'what are you'],
      response: "I'm the BudgetBasics assistant — a simple, rule-based helper for basic budgeting questions. I'm here to support learning, not to replace a financial advisor."
    },
    {
      keywords: ['thanks', 'thank you', 'thank'],
      response: "You're welcome! Feel free to ask about needs vs wants, the 50-30-20 rule, savings goals, or common money mistakes any time."
    }
  ];

  const COMPARE_NEEDS_WANTS = "Needs are the essentials you can't skip — rent, food, transport, utilities. Wants are the extras that make life nicer but aren't essential — subscriptions, eating out, new gadgets. Quick test: if delaying it wouldn't cause real harm, it's a want.";

  function findResponse(userText) {
    const text = userText.toLowerCase();

    // Handle "needs vs wants"-style comparisons before individual keyword
    // matching, so asking about both doesn't just land on whichever word
    // happens to be listed first.
    const mentionsNeed = text.includes('need');
    const mentionsWant = text.includes('want');
    const asksToCompare = /\bvs\b|versus|difference|compare/.test(text);
    if ((mentionsNeed && mentionsWant) || (asksToCompare && (mentionsNeed || mentionsWant))) {
      return COMPARE_NEEDS_WANTS;
    }

    let best = null;
    let bestScore = 0;

    KNOWLEDGE_BASE.forEach(entry => {
      const score = entry.keywords.reduce((count, kw) => count + (text.includes(kw) ? 1 : 0), 0);
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    });

    return best ? best.response : FALLBACK;
  }

  // ---------- Session storage helpers ----------
  function loadHistory() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function saveHistory(history) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (err) {
      // sessionStorage unavailable (private mode, etc.) — fail silently
    }
  }

  function clearHistory() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (err) { /* no-op */ }
  }

  // ---------- Avatar element (shared markup, with icon fallback) ----------
  function makeAvatar(sizeClass) {
    const wrap = document.createElement('div');
    wrap.className = sizeClass;
    const img = document.createElement('img');
    img.src = AVATAR_SRC;
    img.alt = BOT_NAME;
    img.addEventListener('error', () => {
      wrap.innerHTML = '<i class="fa-solid fa-robot"></i>';
    });
    wrap.appendChild(img);
    return wrap;
  }

  // ---------- Build widget DOM ----------
  function buildWidget() {
    const root = document.createElement('div');
    root.id = 'bb-chatbot';

    // Launcher button
    const launcher = document.createElement('button');
    launcher.id = 'bb-chat-launcher';
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Open BudgetBasics assistant');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.appendChild(makeAvatar(''));
    const closeIcon = document.createElement('i');
    closeIcon.className = 'fa-solid fa-xmark bb-launcher-close-icon';
    launcher.appendChild(closeIcon);

    // Panel
    const panel = document.createElement('div');
    panel.id = 'bb-chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', BOT_SUBTITLE);

    const header = document.createElement('div');
    header.className = 'bb-panel-header';
    header.appendChild(makeAvatar('bb-panel-avatar'));

    const title = document.createElement('div');
    title.className = 'bb-panel-title';
    title.innerHTML = `<strong>${BOT_NAME}</strong><span>${BOT_SUBTITLE}</span>`;
    header.appendChild(title);

    const resetBtn = document.createElement('button');
    resetBtn.className = 'bb-panel-reset';
    resetBtn.type = 'button';
    resetBtn.setAttribute('aria-label', 'Reset conversation');
    resetBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
    header.appendChild(resetBtn);

    const messages = document.createElement('div');
    messages.className = 'bb-messages';

    const suggestions = document.createElement('div');
    suggestions.className = 'bb-suggestions';
    SUGGESTED_PROMPTS.forEach(prompt => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'bb-chip';
      chip.textContent = prompt;
      chip.addEventListener('click', () => handleUserMessage(prompt));
      suggestions.appendChild(chip);
    });

    const footer = document.createElement('div');
    footer.className = 'bb-panel-footer';

    const inputRow = document.createElement('div');
    inputRow.className = 'bb-input-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Ask a budgeting question...';
    input.setAttribute('aria-label', 'Ask a budgeting question');

    const sendBtn = document.createElement('button');
    sendBtn.className = 'bb-send-btn';
    sendBtn.type = 'button';
    sendBtn.setAttribute('aria-label', 'Ask');
    sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';

    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);

    const disclaimer = document.createElement('p');
    disclaimer.className = 'bb-disclaimer';
    disclaimer.textContent = DISCLAIMER;

    footer.appendChild(inputRow);
    footer.appendChild(disclaimer);

    panel.appendChild(header);
    panel.appendChild(messages);
    panel.appendChild(suggestions);
    panel.appendChild(footer);

    root.appendChild(launcher);
    root.appendChild(panel);
    document.body.appendChild(root);

    return { root, launcher, panel, messages, suggestions, input, sendBtn, resetBtn };
  }

  // ---------- Rendering ----------
  function renderMessage(messagesEl, sender, text) {
    const row = document.createElement('div');
    row.className = 'bb-msg-row bb-' + sender;

    if (sender === 'bot') {
      row.appendChild(makeAvatar('bb-msg-avatar'));
    }

    const bubble = document.createElement('div');
    bubble.className = 'bb-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);

    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping(messagesEl) {
    const row = document.createElement('div');
    row.className = 'bb-msg-row bb-bot bb-typing';
    row.appendChild(makeAvatar('bb-msg-avatar'));

    const bubble = document.createElement('div');
    bubble.className = 'bb-bubble';
    bubble.innerHTML = '<span class="bb-dot"></span><span class="bb-dot"></span><span class="bb-dot"></span>';
    row.appendChild(bubble);

    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return row;
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', () => {
    const ui = buildWidget();
    let history = loadHistory();

    function handleUserMessageInner(text) {
      const trimmed = text.trim();
      if (!trimmed) return;

      ui.suggestions.style.display = 'none';

      renderMessage(ui.messages, 'user', trimmed);
      history.push({ sender: 'user', text: trimmed });
      saveHistory(history);

      ui.input.value = '';
      ui.sendBtn.disabled = true;

      const typingRow = showTyping(ui.messages);

      setTimeout(() => {
        typingRow.remove();
        const reply = findResponse(trimmed);
        renderMessage(ui.messages, 'bot', reply);
        history.push({ sender: 'bot', text: reply });
        saveHistory(history);
        ui.sendBtn.disabled = false;
      }, TYPING_DELAY_MS);
    }

    // Expose for the suggestion chips created in buildWidget()
    handleUserMessage = handleUserMessageInner;

    // Restore prior conversation, or show the greeting for a fresh session
    if (history.length) {
      history.forEach(msg => renderMessage(ui.messages, msg.sender, msg.text));
      ui.suggestions.style.display = 'none';
    } else {
      renderMessage(ui.messages, 'bot', GREETING);
      history.push({ sender: 'bot', text: GREETING });
      saveHistory(history);
    }

    function openPanel() {
      ui.root.classList.add('bb-open');
      ui.launcher.setAttribute('aria-expanded', 'true');
      ui.input.focus();
    }

    function closePanel() {
      ui.root.classList.remove('bb-open');
      ui.launcher.setAttribute('aria-expanded', 'false');
      ui.launcher.focus();
    }

    ui.launcher.addEventListener('click', () => {
      ui.root.classList.contains('bb-open') ? closePanel() : openPanel();
    });

    ui.sendBtn.addEventListener('click', () => handleUserMessageInner(ui.input.value));

    ui.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleUserMessageInner(ui.input.value);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && ui.root.classList.contains('bb-open')) closePanel();
    });

    ui.resetBtn.addEventListener('click', () => {
      clearHistory();
      history = [];
      ui.messages.innerHTML = '';
      ui.suggestions.style.display = 'flex';
      renderMessage(ui.messages, 'bot', GREETING);
      history.push({ sender: 'bot', text: GREETING });
      saveHistory(history);
    });
  });

  var handleUserMessage = function () {};
})();