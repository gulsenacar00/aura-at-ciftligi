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

const GALLERY_IMAGES = [
  { src: "images/hero.jpg", alt: "Çiftlikte koşan atlar" },
  { src: "images/about.png", alt: "At portresi" },
  { src: "images/stable.jpg", alt: "Ahır ve çiftlik alanı" },
  { src: "images/nature-tour.jpg", alt: "Doğa turu manzarası" },
  { src: "images/family.png", alt: "Aile günü etkinliği" },
];

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

function initMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navList = document.querySelector(".nav-list");

  if (!menuToggle || !navList) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    navList.classList.toggle("open");
  });

  navList.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navList.classList.remove("open");
    });
  });
}

function initNavHighlight() {
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");

  if (!navLinks.length || !sections.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

function initGallery() {
  const imageEl = document.getElementById("gallery-image");
  const counterEl = document.getElementById("gallery-counter");
  const thumbsWrapEl = document.querySelector(".gallery-thumbs-wrap");
  const thumbsEl = document.getElementById("gallery-thumbs");
  const prevBtn = document.getElementById("gallery-prev");
  const nextBtn = document.getElementById("gallery-next");

  if (!imageEl || !counterEl || !thumbsEl || !prevBtn || !nextBtn) {
    return;
  }

  const thumbButtons = Array.from(thumbsEl.querySelectorAll(".gallery-thumb"));
  let currentIndex = 0;

  function scrollToActiveThumb() {
    const activeThumb = thumbButtons[currentIndex];
    if (!activeThumb || !thumbsWrapEl) {
      return;
    }

    const wrapRect = thumbsWrapEl.getBoundingClientRect();
    const thumbRect = activeThumb.getBoundingClientRect();
    const offset =
      thumbRect.left -
      wrapRect.left -
      wrapRect.width / 2 +
      thumbRect.width / 2;

    thumbsWrapEl.scrollBy({ left: offset, behavior: "smooth" });
  }

  function updateGallery(index) {
    currentIndex = (index + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
    const item = GALLERY_IMAGES[currentIndex];

    imageEl.classList.add("is-changing");
    imageEl.src = item.src;
    imageEl.alt = item.alt;
    counterEl.textContent = `${currentIndex + 1} / ${GALLERY_IMAGES.length}`;

    thumbButtons.forEach((button, i) => {
      button.classList.toggle("active", i === currentIndex);
    });

    scrollToActiveThumb();

    imageEl.onload = () => imageEl.classList.remove("is-changing");
  }

  thumbButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      updateGallery(index);
    });
  });

  prevBtn.addEventListener("click", () => updateGallery(currentIndex - 1));
  nextBtn.addEventListener("click", () => updateGallery(currentIndex + 1));

  document.addEventListener("keydown", (event) => {
    const gallery = document.getElementById("galeri");
    if (!gallery) {
      return;
    }

    const rect = gallery.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;

    if (!inView) {
      return;
    }

    if (event.key === "ArrowLeft") {
      updateGallery(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      updateGallery(currentIndex + 1);
    }
  });
}

function initContactForm() {
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
}

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initNavHighlight();
  initGallery();
  initContactForm();
});
