const params = new URLSearchParams(window.location.search);
const token  = params.get('token') || '';

const confirmBox    = document.getElementById('confirmBox');
const invalidBox    = document.getElementById('invalidTokenBox');
const successBox    = document.getElementById('successBox');
const revertSummary = document.getElementById('revertSummary');
const confirmBtn    = document.getElementById('confirmRevertBtn');
const successText   = document.getElementById('successText');

function buildRevertRow(label, value) {
    const row = document.createElement('div');
    row.className = 'revertRow';

    const labelEl = document.createElement('span');
    labelEl.className = 'revertLabel';
    labelEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.className = 'revertValue';
    valueEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(valueEl);
    return row;
}

// Only VALIDATES the token (doesn't consume it) so the page can show who's
// affected before the person commits to anything by clicking the button.
async function init() {
    if (!token) {
        confirmBox.style.display = 'none';
        invalidBox.style.display = 'block';
        return;
    }

    const check = await window.MV.validateEmailRevertToken(token);
    if (!check.valid) {
        confirmBox.style.display = 'none';
        invalidBox.style.display = 'block';
        return;
    }

    revertSummary.appendChild(buildRevertRow('Current (new) email', check.newEmail));
    revertSummary.appendChild(buildRevertRow('Will be reverted to', check.oldEmail));
}

init();

confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Reverting...';

    const result = await window.MV.revertEmailChange(token);

    if (!result.success) {
        confirmBox.style.display = 'none';
        invalidBox.style.display = 'block';
        return;
    }

    confirmBox.style.display = 'none';
    successText.textContent = `Your email has been reverted to ${result.revertedToEmail}.`;
    successBox.style.display = 'block';
});