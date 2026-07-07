const SUBJECT_LABELS = {
  binicilik: "Binicilik Dersi",
  tur: "Doğa Turu",
  aile: "Aile Günü",
  diger: "Diğer",
};

const LIMITS = {
  name: 100,
  email: 254,
  message: 2000,
};

const DEFAULT_ERROR =
  "Mesaj gönderilemedi. Lütfen tekrar deneyin veya doğrudan e-posta atın.";

function getFormEmail(form) {
  return form.dataset.formEmail || "";
}

function validateForm(formData) {
  const honey = String(formData.get("_honey") || "").trim();
  if (honey) {
    return { ok: false, spam: true };
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const subjectKey = formData.get("subject");
  const subjectLabel = SUBJECT_LABELS[subjectKey];

  if (!name || name.length > LIMITS.name) {
    return { ok: false, error: "Lütfen geçerli bir ad soyad girin." };
  }

  if (!email || email.length > LIMITS.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Lütfen geçerli bir e-posta adresi girin." };
  }

  if (!subjectLabel) {
    return { ok: false, error: "Lütfen bir konu seçin." };
  }

  if (!message || message.length > LIMITS.message) {
    return { ok: false, error: "Lütfen geçerli bir mesaj girin." };
  }

  return {
    ok: true,
    data: { name, email, message, subjectLabel },
  };
}

function isSuccessfulResponse(result) {
  return result && (result.success === true || result.success === "true");
}

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navList = document.querySelector(".nav-list");

  if (menuToggle && navList) {
    menuToggle.addEventListener("click", () => {
      navList.classList.toggle("open");
    });
  }

  const contactForm = document.getElementById("contact-form");
  const formSuccess = document.getElementById("form-success");
  const formError = document.getElementById("form-error");
  const submitBtn = document.getElementById("submit-btn");

  if (!contactForm || !formSuccess || !formError || !submitBtn) {
    return;
  }

  const formEmail = getFormEmail(contactForm);
  if (!formEmail) {
    formError.textContent = "Form yapılandırması eksik. Lütfen site yöneticisiyle iletişime geçin.";
    formError.classList.add("show");
    submitBtn.disabled = true;
    return;
  }

  if (window.location.protocol === "file:") {
    formError.textContent =
      "Formun çalışması için siteyi bir web sunucusu üzerinden açmanız gerekir. Dosyaya çift tıklamak yerine Live Server veya 'npx serve' kullanın.";
    formError.classList.add("show");
    submitBtn.disabled = true;
    return;
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    formSuccess.classList.remove("show");
    formError.classList.remove("show");
    formError.textContent = DEFAULT_ERROR;

    const formData = new FormData(contactForm);
    const validation = validateForm(formData);

    if (!validation.ok) {
      if (validation.spam) {
        formSuccess.classList.add("show");
        contactForm.reset();
        return;
      }

      formError.textContent = validation.error;
      formError.classList.add("show");
      return;
    }

    const { name, email, message, subjectLabel } = validation.data;

    const payload = {
      name,
      email,
      subject: subjectLabel,
      message,
      _subject: `Aura At Çiftliği - ${subjectLabel}`,
      _template: "table",
      _captcha: "true",
      _honey: "",
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Gönderiliyor...";

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${formEmail}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      let result = {};
      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok || !isSuccessfulResponse(result)) {
        throw new Error(result?.message || "Form gönderimi başarısız");
      }

      formSuccess.classList.add("show");
      contactForm.reset();
    } catch {
      formError.classList.add("show");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Gönder";
    }
  });
});
