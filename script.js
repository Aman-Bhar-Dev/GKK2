/* ---------- script.js (updated: accept any numeric OTP) ---------- */

document.addEventListener('DOMContentLoaded', () => {
  // Page containers
  const stage = document.getElementById('stage');
  const page1 = document.getElementById('page1');
  const page2 = document.getElementById('page2');
  const page3 = document.getElementById('page3');

  // Page1 controls
  const nextBtn = document.getElementById('nextBtn');

  // Page2 controls
  const backBtn = document.getElementById('backBtn');
  const infoCard = document.getElementById('infoCard');
  const plansList = document.getElementById('plansList');
  const continueBtn = document.getElementById('continueBtn');

  // Page3 controls (login)
  const backLoginBtn = document.getElementById('backLoginBtn');
  const mobileInput = document.getElementById('mobileInput');
  const sendOtpBtn = document.getElementById('sendOtpBtn');
  const otpSection = document.getElementById('otpSection');
  const otpInput = document.getElementById('otpInput');
  const verifyOtpBtn = document.getElementById('verifyOtpBtn');

  // Defensive checks
  if (!stage || !nextBtn) {
    console.error('Essential elements missing (stage/nextBtn). Script aborted.');
    return;
  }

  // state
  let animating = false;
  let resendTimer = null;
  const RESEND_SECONDS = 30;

  /* ----------------- utilities ----------------- */
  function showToast(msg, ms = 1400) {
    if (document.querySelector('.toast')) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.style.opacity = '0', ms);
    setTimeout(() => t.remove(), ms + 300);
  }

  function microAnimate(el) {
    try {
      el.animate([
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(-6px) scale(1.02)' },
        { transform: 'translateY(0) scale(.995)' }
      ], { duration: 320, easing: 'cubic-bezier(.2,.9,.3,1)' });
    } catch (e) { /* ignore if not supported */ }
  }

  /* ----------------- Page1 -> Page2 ----------------- */
  nextBtn.addEventListener('click', () => {
    if (animating) return;
    animating = true;
    microAnimate(nextBtn);

    stage.classList.add('show-2');
    if (page2) page2.setAttribute('aria-hidden', 'false');

    // Stagger reveal for info list
    if (plansList && infoCard) {
      const items = Array.from(plansList.querySelectorAll('.plans-item'));
      items.forEach((li, idx) => {
        li.style.animationDelay = `${idx * 110}ms`;
        li.style.opacity = ''; // reset if inline style was set earlier
      });
      // small timeout then add .show to trigger CSS animation
      setTimeout(() => infoCard.classList.add('show'), 140);
    }

    setTimeout(() => { animating = false; }, 700);
  });

  /* ----------------- Page2 -> Page1 (Back) ----------------- */
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      stage.classList.remove('show-2');
      if (page2) page2.setAttribute('aria-hidden', 'true');

      // remove reveal so it can replay next time
      if (infoCard) {
        infoCard.classList.remove('show');
        // clear inline animationDelay after a short timeout
        setTimeout(() => {
          const items = plansList ? plansList.querySelectorAll('.plans-item') : [];
          items.forEach(li => li.style.animationDelay = '');
        }, 520);
      }
    });
  }

  /* ----------------- Page2 -> Page3 (Continue) ----------------- */
  if (continueBtn && page3) {
    continueBtn.addEventListener('click', () => {
      microAnimate(continueBtn);
      // remove page2 show class so it doesn't show on return
      if (infoCard) infoCard.classList.remove('show');

      stage.classList.add('show-3');
      if (page3) page3.setAttribute('aria-hidden', 'false');

      // focus mobile input for convenience
      setTimeout(() => {
        if (mobileInput) mobileInput.focus();
      }, 420);
    });
  }

  /* ----------------- Page3 -> Page2 (Back) ----------------- */
  if (backLoginBtn) {
    backLoginBtn.addEventListener('click', () => {
      stage.classList.remove('show-3');
      if (page3) page3.setAttribute('aria-hidden', 'true');

      // reset OTP UI
      resetOtpUI();
    });
  }

  /* ----------------- OTP utilities & flow (accept any numeric OTP) ----------------- */
  function resetOtpUI() {
    if (otpSection) {
      otpSection.classList.remove('show');
      otpSection.setAttribute('aria-hidden', 'true');
    }
    if (sendOtpBtn) {
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = 'Send OTP';
    }
    if (otpInput) otpInput.value = '';
    // do not clear mobileInput here if you want it to persist; keeping it for cleanliness:
    // if (mobileInput) mobileInput.value = '';
    if (resendTimer) {
      clearInterval(resendTimer);
      resendTimer = null;
    }
  }

  function startResendCountdown(button) {
    let remaining = RESEND_SECONDS;
    button.disabled = true;
    button.textContent = `Resend in ${remaining}s`;
    resendTimer = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(resendTimer);
        resendTimer = null;
        button.disabled = false;
        button.textContent = 'Resend OTP';
      } else {
        button.textContent = `Resend in ${remaining}s`;
      }
    }, 1000);
  }

  // Send OTP button behaviour (frontend-only)
  if (sendOtpBtn && mobileInput && otpSection) {
    sendOtpBtn.addEventListener('click', () => {
      const raw = mobileInput.value ? mobileInput.value.trim() : '';
      const digits = raw.replace(/\D/g, '');
      // Basic validation for Indian 10-digit numbers; adjust if needed
      if (!/^\d{10}$/.test(digits)) {
        showToast('Please enter a valid 10-digit mobile number');
        mobileInput.focus();
        return;
      }

      microAnimate(sendOtpBtn);

      // show OTP section (no developer OTP required)
      otpSection.classList.add('show');
      otpSection.setAttribute('aria-hidden', 'false');

      // start resend countdown (optional)
      startResendCountdown(sendOtpBtn);

      showToast('OTP flow started — enter the OTP from your phone (frontend)');
      // focus OTP input
      setTimeout(() => { if (otpInput) otpInput.focus(); }, 400);
    });

    // allow Enter key in mobile field to trigger send
    mobileInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        sendOtpBtn.click();
      }
    });
  }

  // Verify OTP: accept any non-empty numeric OTP and proceed
  if (verifyOtpBtn && otpInput) {
    verifyOtpBtn.addEventListener('click', () => {
      const entered = otpInput.value ? otpInput.value.trim() : '';
      // require at least one digit; you can tighten length rules if needed
      if (!/^\d+$/.test(entered)) {
        showToast('Please enter the numeric OTP received on your phone');
        otpInput.focus();
        return;
      }

    // Success: accept any numeric OTP (frontend-only)
    showToast('OTP accepted — redirecting to home...');

    // store a simple "logged-in" flag and phone (so home.html can read it)
    try {
    // sanitize phone
    const phone = mobileInput && mobileInput.value ? mobileInput.value.replace(/\D/g,'') : '';
    localStorage.setItem('gkk_logged_in', 'true');
    if (phone) localStorage.setItem('gkk_user_phone', phone);
    } catch (e) {
    console.warn('Could not save login state to localStorage', e);
    }

    // give a short moment for the toast then navigate to home.html
    setTimeout(() => {
    // optionally reset UI before leave
    resetOtpUI();
    // replace with your actual relative path to the home page
    window.location.href = 'home.html';
    }, 700);

    });

    // Enter key to verify
    otpInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        verifyOtpBtn.click();
      }
    });
  }

  /* ----------------- Misc: Esc to go back from login page ----------------- */
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      if (stage.classList.contains('show-3')) {
        if (backLoginBtn) backLoginBtn.click();
      } else if (stage.classList.contains('show-2')) {
        if (backBtn) backBtn.click();
      }
    }
  });

  /* ----------------- initial log ----------------- */
  console.info('GKK UI script updated — OTP verification accepts any numeric input.');
});
