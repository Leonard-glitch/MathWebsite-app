const formContainer = document.getElementById('resetFormContainer');
const invalidBox    = document.getElementById('invalidTokenBox');
const successBox    = document.getElementById('successBox');

const form           = formContainer.querySelector('.loginForm');
const newPwInput     = document.getElementById('password');
const confirmPwInput = document.getElementById('passwordConf');
const formError      = document.getElementById('formError');
const strengthWrapper = document.getElementById('strengthWrapper');
const strengthFill    = document.getElementById('strengthFill');
const strengthLabel   = document.getElementById('strengthLabel');

const MIN_PW_LENGTH = 6;

window.MV.redirectIfLoggedIn("../index.html");

function showMsg(el, msg) { el.textContent = msg; el.style.display = 'block'; }
function hideMsg(el) { if (el) el.style.display = 'none'; }
function setError(input) {
    input.classList.remove('is-valid');
    input.classList.add('is-error');
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
}
function setValid(input) {
    input.classList.remove('is-error', 'shake');
    input.classList.add('is-valid');
}

function updateStrengthBar(pw) {
    if (!strengthWrapper) return;
    if (!pw) { strengthWrapper.style.display = 'none'; return; }
    strengthWrapper.style.display = 'flex';
    const lvl = window.MV.getPasswordStrength(pw);
    strengthWrapper.dataset.strength = lvl;
    const labels = ['', 'Weak', 'Okay', 'Good', 'Strong'];
    strengthLabel.textContent = labels[lvl];
}

// Supabase's detectSessionInUrl parses the recovery link from the URL and
// establishes a temporary session automatically — there is no token left
// for us to validate manually. common-login.js tracks whether that happened
// via the 'PASSWORD_RECOVERY' auth event, exposed here.
function checkRecoveryAccess() {
    if (window.MV.isPasswordRecoverySession()) {
        formContainer.style.display = '';
        invalidBox.style.display = 'none';
    } else {
        formContainer.style.display = 'none';
        invalidBox.style.display = 'block';
    }
}

// The event may fire before or after this script runs — cover both orders.
window.addEventListener('mv:passwordrecovery', checkRecoveryAccess);
checkRecoveryAccess();

newPwInput.addEventListener('input', () => {
    updateStrengthBar(newPwInput.value);
    if (newPwInput.classList.contains('is-error')) newPwInput.classList.remove('is-error', 'shake');
    hideMsg(formError);
});

confirmPwInput.addEventListener('input', () => {
    if (confirmPwInput.classList.contains('is-error')) confirmPwInput.classList.remove('is-error', 'shake');
    hideMsg(formError);
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMsg(formError);

    const pw  = newPwInput.value;
    const pwc = confirmPwInput.value;

    if (!pw || pw.length < MIN_PW_LENGTH) {
        setError(newPwInput);
        showMsg(formError, `The password must be at least ${MIN_PW_LENGTH} characters long.`);
        return;
    }
    if (pw !== pwc) {
        setError(confirmPwInput);
        showMsg(formError, 'The passwords do not match.');
        return;
    }
    setValid(newPwInput);
    setValid(confirmPwInput);

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Resetting...';

    const result = await window.MV.resetPasswordWithToken(null, pw);

    if (!result.success) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        formContainer.style.display = 'none';
        invalidBox.style.display = 'block';
        return;
    }

    formContainer.style.display = 'none';
    successBox.style.display = 'block';
});

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
setupPasswordToggle('togglePassword', newPwInput);
setupPasswordToggle('togglePasswordConf', confirmPwInput);