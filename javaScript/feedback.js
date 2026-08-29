/* ==========================================================================
   FEEDBACK MODAL – Auto-Inject & Logic (Global Error Styling)
   ========================================================================== */

(function () {
  const MAX_CHAR_LENGTH = 500;
  const API_ENDPOINT = "https://globomath-feedback-worker.schuhleonard.workers.dev";

  const modalHTML = `
    <div id="feedbackModal" class="modal" role="dialog" aria-modal="true" aria-labelledby="feedbackTitle" style="display: none;">
      <div class="modal-content">
        <button type="button" class="close-btn" aria-label="Close feedback modal">&times;</button>

        <div id="feedbackFormContainer">
          <h2 id="feedbackTitle" class="feedback-header">Send feedback</h2>
          
          <form id="feedbackForm" novalidate>
            <label for="feedbackCategory" class="feedback-label">Category</label>
            <select id="feedbackCategory" class="feedback-select" required aria-required="true">
              <option value="" disabled selected hidden>Select a category...</option>
              <option value="Design">Design / UI</option>
              <option value="Tool missing">Suggest a new math tool</option>
              <option value="Bug">Report a bug</option>
              <option value="Other">Other</option>
            </select>

            <label for="feedbackText" class="feedback-label">Your message</label>
            <textarea 
              id="feedbackText" 
              class="feedback-textarea" 
              rows="4" 
              maxlength="${MAX_CHAR_LENGTH}" 
              required 
              aria-required="true"
              placeholder="Write your feedback here..."
            ></textarea>

            <div id="feedbackError" class="errorMessagestyle" role="alert" aria-live="polite" style="display: none;"></div>

            <button type="submit" id="feedbackSubmitBtn" class="feedback-submit-btn">
              <span class="btn-text">Send</span>
            </button>
          </form>
        </div>

        <div id="feedbackSuccessMessage" class="success-container" style="display: none;" aria-live="polite">
          <div class="success-icon">&#10004;</div>
          <h3 class="success-header">Sent!</h3>
          <p class="success-text">Thank you, your feedback helps us improve Globomath even further.</p>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  const initFeedbackModal = () => {
    const modal = document.getElementById("feedbackModal");
    const openBtn = document.getElementById("openFeedbackBtn");
    const closeBtn = modal?.querySelector(".close-btn");
    const form = document.getElementById("feedbackForm");
    const formContainer = document.getElementById("feedbackFormContainer");
    const successMsg = document.getElementById("feedbackSuccessMessage");

    const categoryInput = document.getElementById("feedbackCategory");
    const textInput = document.getElementById("feedbackText");
    const submitBtn = document.getElementById("feedbackSubmitBtn");
    const errorBox = document.getElementById("feedbackError");

    if (!modal || !form) return;

    let isSubmitting = false;

    const showError = (message) => {
      if (!errorBox) return;
      errorBox.textContent = message;
      errorBox.style.display = "block";
    };

    const hideError = () => {
      if (!errorBox) return;
      errorBox.style.display = "none";
      errorBox.textContent = "";
    };

    const resetModalState = () => {
      form.reset();
      hideError();
      formContainer.style.display = "block";
      successMsg.style.display = "none";
      if (submitBtn) {
        submitBtn.disabled = false;
        const btnText = submitBtn.querySelector(".btn-text");
        if (btnText) btnText.textContent = "Send";
      }
      isSubmitting = false;
    };

    const openModal = () => {
      modal.style.display = "block";
      hideError();
      categoryInput?.focus();
    };

    const closeModal = () => {
      // NEU: Schließen blockieren, wenn gerade ein Request läuft (Klick außerhalb, ESC, X-Button)
      if (isSubmitting) return;

      modal.style.display = "none";
      if (successMsg.style.display === "flex") {
        resetModalState();
      } else {
        hideError();
      }
    };

    if (openBtn) {
      openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openModal();
      });
    }

    closeBtn?.addEventListener("click", closeModal);

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Tastatur-Accessibility: ESC schließt das Modal
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.style.display === "block") {
        closeModal();
      }
    });

    categoryInput?.addEventListener("change", hideError);
    textInput?.addEventListener("input", hideError);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (isSubmitting) return;

      const category = categoryInput ? categoryInput.value.trim() : "";
      const rawMessage = textInput ? textInput.value : "";
      const trimmedMessage = rawMessage.trim();

      // Validierung
      if (!category) {
        showError("Please select a category.");
        categoryInput?.focus();
        return;
      }

      if (!trimmedMessage) {
        showError("Please write a message.");
        textInput?.focus();
        return;
      }

      if (trimmedMessage.length > MAX_CHAR_LENGTH) {
        showError(`Message is too long (max ${MAX_CHAR_LENGTH} characters).`);
        textInput?.focus();
        return;
      }

      hideError();
      isSubmitting = true;

      // Loading-Zustand setzen
      if (submitBtn) {
        submitBtn.disabled = true;
        const btnText = submitBtn.querySelector(".btn-text");
        if (btnText) btnText.textContent = "Sending...";
      }

      // Anonyme Feedback-Daten
      const payload = {
        category: category,
        message: trimmedMessage,
        page: window.location.pathname
      };

      try {
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        // NEU: Request ist beendet. Flag sofort zurücksetzen, 
        // damit closeModal() wieder funktioniert!
        isSubmitting = false;

        // Erfolgsfall UI-Updates
        formContainer.style.display = "none";
        successMsg.style.display = "flex";

        setTimeout(() => {
          closeModal();
          setTimeout(() => {
            resetModalState();
          }, 300);
        }, 2500);

      } catch (err) {
        // Fehlerfall: Der Text bleibt im Feld erhalten
        showError("Failed to send feedback. Please check your connection and try again.");
        if (submitBtn) {
          submitBtn.disabled = false;
          const btnText = submitBtn.querySelector(".btn-text");
          if (btnText) btnText.textContent = "Send";
        }
        // isSubmitting = false ist hier ja bereits korrekterweise vorhanden
        isSubmitting = false;
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFeedbackModal);
  } else {
    initFeedbackModal();
  }
})();