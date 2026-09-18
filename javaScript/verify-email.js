const pendingEmailLabel = document.getElementById('pendingEmailLabel');
const resendBtn = document.getElementById('resendBtn');
const changeEmailBtn = document.getElementById('changeEmailBtn');
const verifyFormError = document.getElementById('verifyFormError');

const PENDING_EMAIL_KEY = 'mv-pending-verify-email';
const RESEND_COOLDOWN_SECONDS = 60;

window.MV.redirectIfLoggedIn("../index.html");
window.addEventListener('pageshow', (e) => {
    if (e.persisted) window.MV.redirectIfLoggedIn("../index.html");
});

const pendingEmail = sessionStorage.getItem(PENDING_EMAIL_KEY) || '';

function showError(msg) {
    verifyFormError.textContent = msg;
    verifyFormError.style.display = 'block';
}

if (pendingEmail) {
    pendingEmailLabel.textContent = pendingEmail;
} else {
    resendBtn.disabled = true;
    showError("We couldn't find a pending registration in this session. Please register again or log in.");
}

let cooldownInterval = null;

function startCooldown() {
    let seconds = RESEND_COOLDOWN_SECONDS;
    resendBtn.disabled = true;
    resendBtn.textContent = `Resend email (${seconds}s)`;
    cooldownInterval = setInterval(() => {
        seconds -= 1;
        if (seconds <= 0) {
            clearInterval(cooldownInterval);
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend email';
        } else {
            resendBtn.textContent = `Resend email (${seconds}s)`;
        }
    }, 1000);
}

resendBtn.addEventListener('click', async () => {
    if (!pendingEmail || resendBtn.disabled) return;
    verifyFormError.style.display = 'none';

    resendBtn.disabled = true;
    const originalText = resendBtn.textContent;
    resendBtn.textContent = 'Sending...';

    const result = await window.MV.resendConfirmationEmail(pendingEmail);

    if (!result.success) {
        resendBtn.disabled = false;
        resendBtn.textContent = originalText;
        showError('Could not resend the email right now. Please wait a moment and try again.');
        return;
    }

    startCooldown();
});

changeEmailBtn.addEventListener('click', () => {
    sessionStorage.removeItem(PENDING_EMAIL_KEY);
    window.location.href = 'register.html';
});