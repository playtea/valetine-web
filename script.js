// ===== CONFIGURATION =====
// GANTI URL INI dengan URL dari Google Apps Script kamu
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9rGv9McbJEh0yN6Se_8rk-LTXSm-8YxQy-1j4cGj5t3yCuVEybshcCFRkRSZXmEQjPw/exec';

// ===== FLOATING HEARTS/STARS =====
function createFloatingHearts() {
  const container = document.querySelector('.floating-hearts');
  if (!container) return;

  const symbols = ['💗', '💕', '✨', '⭐', '🐾', '💖'];
  const count = 15;

  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    span.style.left = Math.random() * 100 + '%';
    span.style.animationDelay = Math.random() * 8 + 's';
    span.style.animationDuration = (6 + Math.random() * 4) + 's';
    span.style.fontSize = (0.6 + Math.random() * 0.8) + 'rem';
    container.appendChild(span);
  }
}

// ===== SEND DATA TO GOOGLE SHEETS =====
async function sendResponse(response) {
  // Jika URL belum diganti, skip
  if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
    console.log('Google Script URL belum di-setting. Response:', response);
    return;
  }

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        response: response,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      })
    });
    console.log('Response sent:', response);
  } catch (error) {
    console.log('Failed to send response:', error);
  }
}

// ===== INDEX PAGE LOGIC =====
function initIndexPage() {
  const playArea = document.getElementById('playArea');
  const btnYes = document.getElementById('btnYes');
  const btnNo = document.getElementById('btnNo');
  const bubble = document.getElementById('bubble');
  const reduceMotionToggle = document.getElementById('reduceMotion');

  if (!playArea || !btnYes || !btnNo) return;

  // Reduce motion toggle
  if (reduceMotionToggle) {
    const savedMotion = localStorage.getItem('reduceMotion');
    if (savedMotion === 'true') {
      reduceMotionToggle.checked = true;
      document.body.classList.add('reduce-motion');
    }

    reduceMotionToggle.addEventListener('change', () => {
      if (reduceMotionToggle.checked) {
        document.body.classList.add('reduce-motion');
        localStorage.setItem('reduceMotion', 'true');
      } else {
        document.body.classList.remove('reduce-motion');
        localStorage.setItem('reduceMotion', 'false');
      }
    });
  }

  // Get play area bounds
  function getPlayAreaBounds() {
    const rect = playArea.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();
    return {
      left: 10,
      top: 10,
      right: rect.width - btnRect.width - 10,
      bottom: rect.height - btnRect.height - 10
    };
  }

  // Check overlap
  function rectsOverlap(r1, r2) {
    return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
  }

  // Get relative rect
  function getRelativeRect(btn) {
    const playRect = playArea.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    return {
      left: btnRect.left - playRect.left,
      top: btnRect.top - playRect.top,
      right: btnRect.right - playRect.left,
      bottom: btnRect.bottom - playRect.top
    };
  }

  // Teleport NO button
  function teleportButton() {
    const bounds = getPlayAreaBounds();
    const yesRect = getRelativeRect(btnYes);

    let attempts = 0;
    let newX, newY, newRect;

    do {
      newX = bounds.left + Math.random() * (bounds.right - bounds.left);
      newY = bounds.top + Math.random() * (bounds.bottom - bounds.top);

      const btnRect = btnNo.getBoundingClientRect();
      newRect = {
        left: newX,
        top: newY,
        right: newX + btnRect.width,
        bottom: newY + btnRect.height
      };
      attempts++;
    } while (rectsOverlap(newRect, yesRect) && attempts < 20);

    btnNo.style.position = 'absolute';
    btnNo.style.left = newX + 'px';
    btnNo.style.top = newY + 'px';

    if (!document.body.classList.contains('reduce-motion')) {
      btnNo.classList.remove('wobble');
      void btnNo.offsetWidth;
      btnNo.classList.add('wobble');
    }
  }

  // NO button handlers
  btnNo.addEventListener('mouseenter', (e) => {
    e.preventDefault();
    teleportButton();
  });

  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    teleportButton();
  }, { passive: false });

  btnNo.addEventListener('focus', () => {
    teleportButton();
    btnYes.focus();
  });

  // YES button click - KIRIM DATA KE GOOGLE SHEETS
  btnYes.addEventListener('click', async () => {
    // Kirim data "YES" ke Google Sheets
    sendResponse('YES');

    const messages = ['bentar ya…', 'aku seneng…', '💗'];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    bubble.textContent = randomMsg;
    bubble.classList.add('show');

    setTimeout(() => {
      window.location.href = 'yes.html';
    }, 600);
  });

  // Sparkle on YES hover
  btnYes.addEventListener('mouseenter', () => {
    if (!document.body.classList.contains('reduce-motion')) {
      createSparklesAroundButton(btnYes);
    }
  });
}

// Create sparkles
function createSparklesAroundButton(btn) {
  const rect = btn.getBoundingClientRect();
  const sparkles = ['✨', '💗', '⭐'];

  for (let i = 0; i < 3; i++) {
    const sparkle = document.createElement('span');
    sparkle.textContent = sparkles[i];
    sparkle.style.cssText = `
      position: fixed;
      left: ${rect.left + Math.random() * rect.width}px;
      top: ${rect.top + Math.random() * rect.height}px;
      font-size: 0.8rem;
      pointer-events: none;
      z-index: 100;
      animation: sparkleFloat 0.8s ease-out forwards;
    `;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
  }
}

// Add sparkle animation
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
  @keyframes sparkleFloat {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-30px) scale(0.5); }
  }
`;
document.head.appendChild(sparkleStyle);

// ===== YES PAGE LOGIC =====
function initYesPage() {
  const btnCopy = document.getElementById('btnCopy');
  const copyFeedback = document.getElementById('copyFeedback');

  // Trigger confetti
  if (typeof confetti === 'function') {
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.2, y: 0.6 },
        colors: ['#ffb3c6', '#ff7aa2', '#c9a7eb', '#fff3b0', '#c7f0db'],
        scalar: 0.8
      });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.8, y: 0.6 },
        colors: ['#ffb3c6', '#ff7aa2', '#c9a7eb', '#fff3b0', '#c7f0db'],
        scalar: 0.8
      });
    }, 300);

    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 100,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#ffb3c6', '#ffe4ec', '#fff'],
        scalar: 0.6,
        shapes: ['circle']
      });
    }, 800);
  }

  // Copy button
  if (btnCopy && copyFeedback) {
    btnCopy.addEventListener('click', async () => {
      const textToCopy = 'Aku bilang IYA 💗🐾 (malu-malu)';

      try {
        await navigator.clipboard.writeText(textToCopy);
        copyFeedback.classList.add('show');
        setTimeout(() => copyFeedback.classList.remove('show'), 2000);
      } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        copyFeedback.classList.add('show');
        setTimeout(() => copyFeedback.classList.remove('show'), 2000);
      }
    });
  }

  // Check reduce motion
  if (localStorage.getItem('reduceMotion') === 'true') {
    document.body.classList.add('reduce-motion');
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  createFloatingHearts();

  const isYesPage = document.body.classList.contains('yes-page');

  if (isYesPage) {
    initYesPage();
  } else {
    initIndexPage();
  }
});
