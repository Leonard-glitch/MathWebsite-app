const form        = document.getElementById('forgotForm');
const emailInput  = document.getElementById('email');
const emailError  = document.getElementById('emailError');
const formError   = document.getElementById('formError');
const submitBtn   = document.getElementById('submitBtn');
const successBox  = document.getElementById('successBox');


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

emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('is-error')) {
        emailInput.classList.remove('is-error', 'shake');
        hideMsg(emailError);
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMsg(emailError);
    hideMsg(formError);

    const email = emailInput.value.trim();
    if (!email || !emailInput.checkValidity()) {
        setError(emailInput);
        showMsg(emailError, 'Please enter a valid email address.');
        return;
    }
    setValid(emailInput);

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';

    try {
        await window.MV.requestPasswordReset(email);
    } catch (err) {
        // Fehlerdetails niemals an den Nutzer durchreichen – das würde
        // Rückschlüsse zulassen, ob die E-Mail existiert oder nicht.
        console.error('Password reset request failed:', err);
    }

    // WICHTIG: Immer dieselbe Meldung anzeigen, unabhängig davon, ob ein
    // Account zu dieser Adresse existiert – verhindert User-Enumeration
    // über dieses Formular.
    form.style.display = 'none';
    successBox.style.display = 'flex';
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
});