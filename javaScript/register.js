const form             = document.querySelector('.loginForm');
const usernameInput    = document.getElementById('userName');
const emailInput       = document.getElementById('email');
const passwordInput    = document.getElementById('password');
const passwordConfInput = document.getElementById('passwordConf');
const privacyCheckbox  = document.getElementById('privacyAccept');

const usernameError    = document.getElementById('usernameError');
const emailError       = document.getElementById('emailError');
const formError        = document.getElementById('formError');

const strengthWrapper  = document.getElementById('strengthWrapper');
const strengthFill     = document.getElementById('strengthFill');
const strengthLabel    = document.getElementById('strengthLabel');

const TAKEN_NAMES    = ['admin', 'test', 'max_mustermann', 'mathverse', 'moderator'];
const MIN_PW_LENGTH  = 6;
const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,20}$/;

window.MV.redirectIfLoggedIn("../index.html");

window.addEventListener('pageshow', (e) => {
    if (e.persisted) window.MV.redirectIfLoggedIn("../index.html");
});

// ===========================================================================
// STATE HELPERS
// ===========================================================================

function setValid(input) {
    input.classList.remove('is-error', 'shake');
    input.classList.add('is-valid');
}

function setError(input) {
    input.classList.remove('is-valid');
    input.classList.add('is-error');
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
}

function setNeutral(input) {
    input.classList.remove('is-valid', 'is-error', 'shake');
}

function showMsg(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    el.style.color = '';
    el.style.borderColor = '';
    el.style.backgroundColor = '';
}

function hideMsg(el) {
    if (!el) return;
    el.style.display = 'none';
    el.textContent = ''; // <-- Diese Zeile fixt deinen Fehler!
}

function showSuccessMsg(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    el.style.color = 'var(--accent-live)';
    el.style.borderColor = 'var(--accent-live)';
    el.style.backgroundColor = 'rgba(0, 255, 204, 0.06)';
}

// ===========================================================================
// VALIDATION FUNCTIONS
// ===========================================================================
/**
 * @param {boolean} silent – true = set classes only, no error text changes
 * @returns {boolean} – true if valid
 */
function validateUsername(silent = false) {
    const val = usernameInput.value.trim();

    if (!val) {
        setError(usernameInput);
        if (!silent) showMsg(usernameError, 'Please enter a username.');
        return false;
    }

    if (!USERNAME_REGEX.test(val)) {
        setError(usernameInput);
        if (!silent) showMsg(usernameError, 'Only letters, numbers, _, - and . are allowed (3–20 characters).');
        return false;
    }

    if (TAKEN_NAMES.includes(val.toLowerCase()) || window.MV.isUsernameTaken(val)) {
        setError(usernameInput);
        if (!silent) showMsg(usernameError, `“${val}” is already taken.`);
        return false;
    }

    setValid(usernameInput);
    if (!silent) showSuccessMsg(usernameError, `“${val}” is available.`);
    return true;
}

function validateEmail(silent = false) {
    const val = emailInput.value.trim();

    if (!val) {
        setError(emailInput);
        if (!silent) showMsg(emailError, 'Please enter an email address.');
        return false;
    }
    if (!emailInput.checkValidity()) {
        setError(emailInput);
        if (!silent) showMsg(emailError, 'Please enter a valid email address.');
        return false;
    }
    if (window.MV.isEmailTaken(val)) {
        setError(emailInput);
        if (!silent) showMsg(emailError, 'An account already exists for this email address.');
        return false;
    }

    setValid(emailInput);
    if (!silent) hideMsg(emailError);
    return true;
}

function validatePassword(silent = false) {
    const val = passwordInput.value;

    if (!val) {
        setError(passwordInput);
        if (!silent) showMsg(formError, 'Please enter a password.');
        return false;
    }
    if (val.length < MIN_PW_LENGTH) {
        setError(passwordInput);
        if (!silent) showMsg(formError, `The password must be at least ${MIN_PW_LENGTH} characters long.`);
        return false;
    }

    setValid(passwordInput);
    return true;
}

function validatePasswordConf(silent = false) {
    const pw  = passwordInput.value;
    const pwc = passwordConfInput.value;

    if (!pwc) {
        setError(passwordConfInput);
        if (!silent) showMsg(formError, 'Please confirm your password.');
        return false;
    }
    if (pw !== pwc) {
        setError(passwordConfInput);
        if (!silent) showMsg(formError, 'The passwords do not match.');
        return false;
    }
    if (pw.length < MIN_PW_LENGTH) {
        setError(passwordConfInput);
        return false;
    }

    setValid(passwordConfInput);
    if (!silent) hideMsg(formError);
    return true;
}

// PASSWORD STRENGTH INDICATOR

function updateStrengthBar(pw) {
    if (!strengthWrapper) return;

    if (!pw) {
        strengthWrapper.style.display = 'none';
        return;
    }

    strengthWrapper.style.display = 'flex';
    const lvl = window.MV.getPasswordStrength(pw);
    strengthWrapper.dataset.strength = lvl;

    const labels = ['', 'Weak', 'Okay', 'Good', 'Strong'];
    strengthLabel.textContent = labels[lvl];
}

// BLUR EVENTS

usernameInput.addEventListener('blur', () => validateUsername());
emailInput.addEventListener('blur', () => validateEmail());
passwordInput.addEventListener('blur', () => {
    validatePassword();
    if (passwordConfInput.value) validatePasswordConf();
});
passwordConfInput.addEventListener('blur', () => validatePasswordConf());

// INPUT EVENTS

usernameInput.addEventListener('input', () => {
    usernameInput.classList.remove('shake');
    validateUsername();
});

emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('is-error')) {
        emailInput.classList.remove('is-error', 'shake');
        hideMsg(emailError);
    }
});

passwordInput.addEventListener('input', () => {
    const pw = passwordInput.value;

    updateStrengthBar(pw);

    if (passwordInput.classList.contains('is-error')) {
        passwordInput.classList.remove('is-error', 'shake');
    }
    if (formError.textContent.includes('characters')) hideMsg(formError);

    if (passwordConfInput.value) {
        if (pw === passwordConfInput.value && pw.length >= MIN_PW_LENGTH) {
            setValid(passwordInput);
            setValid(passwordConfInput);
            hideMsg(formError);
        } else {
            passwordConfInput.classList.remove('is-valid');
        }
    }
});

passwordInput.addEventListener('animationstart', (e) => {
    if (e.animationName === 'onAutoFillStart') {
        updateStrengthBar(passwordInput.value);
        if (passwordConfInput.value) {
            if (passwordInput.value === passwordConfInput.value) {
                setValid(passwordInput);
                setValid(passwordConfInput);
                hideMsg(formError);
            }
        }
    }
});

passwordConfInput.addEventListener('input', () => {
    if (passwordConfInput.classList.contains('is-error')) {
        passwordConfInput.classList.remove('is-error', 'shake');
    }
    if (formError.textContent.includes('match')) hideMsg(formError);

    // Real-time match
    const pw  = passwordInput.value;
    const pwc = passwordConfInput.value;
    if (pw && pwc && pw === pwc && pw.length >= MIN_PW_LENGTH) {
        setValid(passwordInput);
        setValid(passwordConfInput);
        hideMsg(formError);
    }
});

privacyCheckbox.addEventListener('change', () => {
    if (privacyCheckbox.checked && formError.textContent.includes('privacy')) {
        hideMsg(formError);
    }
});

let isSubmitting = false;

// SUBMIT HANDLER

form.addEventListener('submit', (e) => {
    e.preventDefault();

    // NEU: Wenn bereits gesendet wird, sofort abbrechen!
    if (isSubmitting) return;

    hideMsg(usernameError);
    hideMsg(emailError);
    hideMsg(formError);

    let valid = true;
    let firstErrorInput = null;

    // 1. Username
    const uname = usernameInput.value.trim();
    if (!uname) {
        setError(usernameInput);
        showMsg(usernameError, 'Please enter a username.');
        valid = false;
        firstErrorInput = firstErrorInput || usernameInput;
    } else if (!USERNAME_REGEX.test(uname)) {
        setError(usernameInput);
        showMsg(usernameError, 'Only letters, numbers, _, - and . are allowed (3–20 characters).');
        valid = false;
        firstErrorInput = firstErrorInput || usernameInput;
    } else if (TAKEN_NAMES.includes(uname.toLowerCase()) || window.MV.isUsernameTaken(uname)) {
        setError(usernameInput);
        showMsg(usernameError, `“${uname}” is already taken.`);
        valid = false;
        firstErrorInput = firstErrorInput || usernameInput;
    } else {
        setValid(usernameInput);
    }

    // 2. Email
    if (!emailInput.value.trim() || !emailInput.checkValidity()) {
        setError(emailInput);
        showMsg(emailError, 'Please enter a valid email address.');
        valid = false;
        firstErrorInput = firstErrorInput || emailInput;
    } else if (window.MV.isEmailTaken(emailInput.value.trim())) {
        setError(emailInput);
        showMsg(emailError, 'An account already exists for this email address.');
        valid = false;
        firstErrorInput = firstErrorInput || emailInput;
    } else {
        setValid(emailInput);
    }

    // 3. Password
    if (!passwordInput.value) {
        setError(passwordInput);
        if (!formError.textContent) showMsg(formError, 'Please enter a password.');
        valid = false;
        firstErrorInput = firstErrorInput || passwordInput;
    } else if (passwordInput.value.length < MIN_PW_LENGTH) {
        setError(passwordInput);
        showMsg(formError, `The password must be at least ${MIN_PW_LENGTH} characters long.`);
        valid = false;
        firstErrorInput = firstErrorInput || passwordInput;
    } else {
        setValid(passwordInput);
    }

    // 4. Password Confirmation
    if (!passwordConfInput.value) {
        setError(passwordConfInput);
        if (!formError.textContent) showMsg(formError, 'Please confirm your password.');
        valid = false;
        firstErrorInput = firstErrorInput || passwordConfInput;
    } else if (passwordInput.value !== passwordConfInput.value) {
        setError(passwordConfInput);
        setError(passwordInput);
        showMsg(formError, 'The passwords do not match.');
        valid = false;
        firstErrorInput = firstErrorInput || passwordConfInput;
    } else if (passwordInput.value.length >= MIN_PW_LENGTH) {
        setValid(passwordConfInput);
    }

    // 5. Privacy Checkbox
    if (!privacyCheckbox.checked) {
        if (!formError.textContent) showMsg(formError, 'You must accept the privacy policy.');
        valid = false;
    }

    // EVALUATION
    if (!valid) {
        // Scroll to first error field if something is invalid
        if (firstErrorInput) {
            firstErrorInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorInput.focus();
        }
    } else {
        // NEU: Flag setzen und Button deaktivieren, um Mehrfach-Klicks zu verhindern
        isSubmitting = true;
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.cursor = 'not-allowed';
            submitBtn.style.opacity = '0.7';
            // Optional: Text anpassen, z.B.: submitBtn.textContent = 'Registering...';
        }

        // IF EVERYTHING IS VALID: Register and log in user
        window.MV.registerUser({
            username: uname,
            email: emailInput.value.trim(),
            password: passwordInput.value,
            favoriten: [],
            pinnedGroups: ["favoritenGroupStar"], 
            containerOrders: {},
            theme: 'violet',
            fontsize: 20,
            currency: window.MV.getCurrency(),
            decimalPlaces: window.MV.getDecimalPlaces(),
            liveResult: window.MV.getLiveResult(),
            angleMode: window.MV.getAngleMode(),
            toolHistory: window.MV.getAllGuestToolHistory(),
            isPro: false,

            createdAt: Date.now()
        });
        window.MV.clearGuestToolHistoryStore();

        let baseUrl = window.MV_BASE || ''; 
        let returnUrl = sessionStorage.getItem('mv-return-url') || (baseUrl + '/index.html');
        sessionStorage.removeItem('mv-return-url');

        // SECURITY CHECK: Prevents redirect loops for ALL auth pages
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

privacyCheckbox.addEventListener('change', () => {
    if (privacyCheckbox.checked && formError.textContent.includes('privacy')) {
        hideMsg(formError);
    }
});

// PASSWORD-TOGGLE BUTTONS

function setupPasswordToggle(toggleId, inputEl) {
    const btn = document.getElementById(toggleId);
    if (!btn || !inputEl) return;

    btn.addEventListener('click', () => {
        const isHidden = inputEl.type === 'password';
        inputEl.type = isHidden ? 'text' : 'password';
        const icon = btn.querySelector('i');
        icon.className = isHidden ? 'fa fa-eye-slash' : 'fa fa-eye';
        btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
}

setupPasswordToggle('togglePassword', passwordInput);
setupPasswordToggle('togglePasswordConf', passwordConfInput);