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

// Login ist seit der Supabase-Migration nur noch per E-Mail möglich
// (siehe loginUser() in common-login.js - Username-Auflösung würde einen
// öffentlich aufrufbaren "Username -> E-Mail"-Lookup erfordern, was ein
// Enumeration-Risiko wäre). Format wird hier clientseitig vorab geprüft,
// damit der Fehler sofort statt erst nach einem Server-Roundtrip erscheint.
function isEmailLike(value) {
    return /\S+@\S+\.\S+/.test(value);
}

usernameInput.addEventListener('blur', () => {
    if (usernameInput.value.trim()) {
        setValid(usernameInput, usernameError);
    } else {
        setNeutral(usernameInput);
    }
});

passwordInput.addEventListener('blur', () => {
    if (passwordInput.value) {
        setValid(passwordInput, formError);
    } else {
        setNeutral(passwordInput);
    }
});

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

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    hideMsg(usernameError);
    hideMsg(formError);

    let valid = true;
    const uname = usernameInput.value.trim();

    if (!uname) {
        setError(usernameInput, usernameError, 'Please enter your email address.');
        valid = false;
    } else if (!isEmailLike(uname)) {
        setError(usernameInput, usernameError, 'Please log in with your email address.');
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
        const result = await window.MV.loginUser(uname, passwordInput.value);

        if (!result.success) {
            setError(usernameInput, null);
            if (result.reason === 'email_required') {
                setError(usernameInput, usernameError, 'Please log in with your email address.');
            } else {
                setError(passwordInput, formError, 'Email or password is incorrect.');
            }
            return;
        }

        let baseUrl = window.MV_BASE || ''; 
        let returnUrl = sessionStorage.getItem('mv-return-url') || (baseUrl + '/index.html');
        sessionStorage.removeItem('mv-return-url');

        if (
            returnUrl.includes('login') || 
            returnUrl.includes('register') || 
            returnUrl.includes('forgot-password') || 
            returnUrl.includes('reset-password')
        ) {
            returnUrl = baseUrl + '/index.html';
        }

        window.location.href = returnUrl;
    }
});

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        const isHidden = passwordInput.type === 'password';
        passwordInput.type = isHidden ? 'text' : 'password';
        const icon = toggleBtn.querySelector('i');
        icon.className = isHidden ? 'fa fa-eye-slash' : 'fa fa-eye';
        toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
}