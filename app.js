const thankYouDialog = document.querySelector("#thank-you-dialog");
const closeThankYou = document.querySelector("#close-thank-you");

for (const form of document.querySelectorAll(".webtzm-form")) {
  if (form.hasAttribute("data-webtzm-form")) {
    form.addEventListener("webtzm:send-status", (event) => {
      if (event.detail?.state === "success" && thankYouDialog && !thankYouDialog.open) {
        thankYouDialog.showModal();
      }
    });
    continue;
  }

  const submitButton = form.querySelector('[type="submit"]');
  const buttonLabel = submitButton.querySelector(".button-label");
  const details = form.querySelector("[data-character-count]");
  const counter = form.querySelector("#character-count");
  const formStatus = form.querySelector(".form-status");

  function updateCharacterCount() {
    if (details && counter) counter.textContent = `${details.value.length} / ${details.maxLength}`;
  }

  details?.addEventListener("input", updateCharacterCount);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const idleLabel = buttonLabel.textContent;
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    buttonLabel.textContent = "Sending…";
    formStatus.hidden = false;
    formStatus.classList.remove("is-error");
    formStatus.textContent = "Sending securely…";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      const result = await response.json();
      if (!response.ok || result.accepted !== true) {
        throw new Error(result.message || "Webtzm did not accept this submission.");
      }

      formStatus.hidden = true;
      form.reset();
      updateCharacterCount();
      thankYouDialog.showModal();
    } catch (error) {
      const detail = error instanceof TypeError
        ? "Could not reach Webtzm. Please try again in a moment."
        : error.message;
      formStatus.classList.add("is-error");
      formStatus.textContent = `Not sent: ${detail}`;
      console.error(error);
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      buttonLabel.textContent = idleLabel;
    }
  });
}

closeThankYou?.addEventListener("click", () => thankYouDialog.close());

