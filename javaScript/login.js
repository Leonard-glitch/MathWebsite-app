

const form           = document.querySelector('.loginForm');
const usernameInput  = document.getElementById('username');
const passwordInput  = document.getElementById('password');
const usernameError  = document.getElementById('usernameError');
const formError      = document.getElementById('formError');
const toggleBtn      = document.getElementById('togglePassword');

window.MV.redirectIfLoggedIn("../index.html");

window.addEventListener('pageshow', (e) => {
    if (e.persisted) window.MV.redirectIfLoggedIn("../index.html");
});

// Reine UX-Bremse gegen Tipp-Loops und triviale Skripte – KEIN Sicherheits-
// feature (per Konsole umgehbar). Der echte Schutz ist serverseitig
const LOGIN_FAIL_KEY = 'mv-login-fails';
const LOGIN_LOCK_KEY = 'mv-login-lock-until';
const FAILS_BEFORE_LOCK = 5;

function getLockRemaining() {
    const until = parseInt(sessionStorage.getItem(LOGIN_LOCK_KEY) || '0', 10);
    return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

function registerLoginFailure() {
    const fails = parseInt(sessionStorage.getItem(LOGIN_FAIL_KEY) || '0', 10) + 1;
    sessionStorage.setItem(LOGIN_FAIL_KEY, String(fails));
    if (fails >= FAILS_BEFORE_LOCK) {
        const seconds = Math.min(300, 30 * Math.pow(2, fails - FAILS_BEFORE_LOCK));
        sessionStorage.setItem(LOGIN_LOCK_KEY, String(Date.now() + seconds * 1000));
        startLockCountdown();
    }
}

function clearLoginFailures() {
    sessionStorage.removeItem(LOGIN_FAIL_KEY);
    sessionStorage.removeItem(LOGIN_LOCK_KEY);
}

let lockTimer = null;
function startLockCountdown() {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;
    clearInterval(lockTimer);
    const tick = () => {
        const left = getLockRemaining();
        if (left <= 0) {
            clearInterval(lockTimer);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Log in';
            hideMsg(formError);
            return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = `Please wait (${left}s)`;
        showMsg(formError, 'Too many failed attempts. Please wait a moment before trying again.');
    };
    tick();
    lockTimer = setInterval(tick, 1000);
}

if (getLockRemaining() > 0) startLockCountdown();


function setValid(input, errEl) {
    input.classList.remove('is-error', 'shake');
    input.classList.add('is-valid');
    if (errEl) hideMsg(errEl);
}

function setError(input, errEl, msg) {
    input.classList.remove('is-valid');
    input.classList.add('is-error');
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
    if (errEl && msg) showMsg(errEl, msg);
}

function setNeutral(input) {
    input.classList.remove('is-valid', 'is-error', 'shake');
}

function showMsg(el, msg) {
    el.textContent = msg;
    el.style.display = 'block';
}

function hideMsg(el) {
    if (el) el.style.display = 'none';
}

// ===========================================================================
// BLUR VALIDATION (green when valid, neutral when empty)
// ===========================================================================

usernameInput.addEventListener('blur', () => {
    const val = usernameInput.value.trim();
    if (!val) {
        setNeutral(usernameInput);
    } else if (!usernameInput.checkValidity()) {
        setError(usernameInput, usernameError, 'Please enter a valid email address.');
    } else {
        setValid(usernameInput, usernameError);
    }
});

passwordInput.addEventListener('blur', () => {
    if (passwordInput.value) {
        setValid(passwordInput, formError);
    } else {
        setNeutral(passwordInput);
    }
});

// ===========================================================================
// INPUT EVENTS – clear error markers while typing
// ===========================================================================

usernameInput.addEventListener('input', () => {
    if (usernameInput.classList.contains('is-error')) {
        usernameInput.classList.remove('is-error', 'shake');
        hideMsg(usernameError);
    }
});

passwordInput.addEventListener('input', () => {
    if (passwordInput.classList.contains('is-error')) {
        passwordInput.classList.remove('is-error', 'shake');
        hideMsg(formError);
    }
});

// ===========================================================================
// SUBMIT VALIDATION
// ===========================================================================

// ===========================================================================
// SUBMIT VALIDATION
// ===========================================================================

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (getLockRemaining() > 0) { startLockCountdown(); return; }

    hideMsg(usernameError);
    hideMsg(formError);

    let valid = true;

    const emailVal = usernameInput.value.trim();
    if (!emailVal) {
        setError(usernameInput, usernameError, 'Please enter your email address.');
        valid = false;
    } else if (!usernameInput.checkValidity()) {
        setError(usernameInput, usernameError, 'Please enter a valid email address.');
        valid = false;
    } else {
        setValid(usernameInput, usernameError);
    }

    if (!passwordInput.value) {
        setError(passwordInput, formError, 'Please enter your password.');
        valid = false;
    } else {
        setValid(passwordInput, formError);
    }

    if (valid) {
        const uname = usernameInput.value.trim();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        const result = await window.MV.loginUser(uname, passwordInput.value);

        if (!result.success) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
            if (result.reason === 'email_required') {
                setError(usernameInput, usernameError, 'Please log in with your email address.');
            } else if (result.reason === 'network_error') {
                showMsg(formError, 'Could not reach the server. Please check your connection and try again.');
            } else {
                setError(usernameInput, null);
                setError(passwordInput, formError, 'Email or password is incorrect.');
            }
            if (result.reason !== 'network_error') registerLoginFailure();
            return;
        }

        clearLoginFailures();


        let baseUrl = window.MV_BASE || ''; 
        let returnUrl = sessionStorage.getItem('mv-return-url') || (baseUrl + '/index.html');
        sessionStorage.removeItem('mv-return-url');

        // SICHERHEITS-CHECK: Verhindert den Redirect-Loop für ALLE Auth-Seiten
        if (
            returnUrl.includes('login') || 
            returnUrl.includes('register') || 
            returnUrl.includes('forgot-password') || 
            returnUrl.includes('reset-password') ||
            returnUrl.includes('verify-email')
        ) {
            returnUrl = baseUrl + '/index.html';
        }

        window.location.href = returnUrl;
    }
});

// ===========================================================================
// PASSWORD TOGGLE (eye icon)
// ===========================================================================

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        const isHidden = passwordInput.type === 'password';
        passwordInput.type = isHidden ? 'text' : 'password';
        const icon = toggleBtn.querySelector('i');
        icon.className = isHidden ? 'fa fa-eye-slash' : 'fa fa-eye';
        toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
}