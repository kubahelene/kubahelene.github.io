
"use strict";

// ==========================================
// HELENE.KUBA — WEBSITE
// ==========================================

// MOBILE NAVIGATION

const menu = document.querySelector(".menu-button");
const nav = document.getElementById("site-nav");

menu?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");

  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute(
    "aria-label",
    open ? "Close menu" : "Open menu"
  );
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menu?.setAttribute("aria-expanded", "false");
    menu?.setAttribute("aria-label", "Open menu");
  });
});


// ==========================================
// COPYRIGHT YEAR
// ==========================================

const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}


// ==========================================
// FEATURED PHOTOGRAPHS
// ==========================================

document.querySelectorAll(".photo img").forEach((img) => {
  const update = () => {
    img.closest(".photo")?.classList.toggle(
      "has-image",
      img.complete && img.naturalWidth > 0
    );
  };

  img.addEventListener("load", update);
  img.addEventListener("error", update);

  update();
});


// ==========================================
// PHOTO DUMP
// ==========================================

document.querySelectorAll(".dump-item img").forEach((img) => {
  const removeIfMissing = () => {
    if (img.complete && img.naturalWidth === 0) {
      img.closest(".dump-item")?.remove();
    }
  };

  img.addEventListener("error", removeIfMissing);
  removeIfMissing();
});


// ==========================================
// ABOUT PHOTO — AUTOMATIC ALIGNMENT
// ==========================================

function alignAboutPhoto() {
  const about = document.querySelector(".about");
  const headline = about?.querySelector(".about-headline");
  const imageWrap = about?.querySelector(".about-image-wrap");

  const paragraph = about?.querySelector(
    ".about-body > p:nth-of-type(3)"
  );

  const instagramLink = about?.querySelector(
    ".about-body > .inline-link"
  );

  if (
    !headline ||
    !imageWrap ||
    !paragraph ||
    !instagramLink
  ) {
    return;
  }

  if (window.innerWidth <= 900) {
    imageWrap.style.removeProperty("top");
    imageWrap.style.removeProperty("height");
    return;
  }

  const headlineRect = headline.getBoundingClientRect();
  const paragraphRect = paragraph.getBoundingClientRect();
  const linkRect = instagramLink.getBoundingClientRect();

  const top = paragraphRect.top - headlineRect.top;
  const height = linkRect.bottom - paragraphRect.top;

  if (height <= 0) return;

  imageWrap.style.top = `${top}px`;
  imageWrap.style.height = `${height}px`;
}

window.addEventListener("load", alignAboutPhoto);
window.addEventListener("resize", alignAboutPhoto);

if (document.fonts?.ready) {
  document.fonts.ready.then(alignAboutPhoto);
}

const aboutBody = document.querySelector(".about-body");

if (aboutBody && "ResizeObserver" in window) {
  const observer = new ResizeObserver(alignAboutPhoto);
  observer.observe(aboutBody);
}


// ==========================================
// CONTACT FORM — FORMSPREE
// ==========================================

const form = document.getElementById("inquiry-form");
const feedback = document.getElementById("form-feedback");

const FORMSPREE_ENDPOINT =
  "https://formspree.io/f/xljjalvo";

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button = form.querySelector(".send");

  const name = form.elements.namedItem("name")?.value.trim();
  const contact = form.elements.namedItem("contact")?.value.trim();
  const shootType = form.querySelector(
    'input[name="shootType"]:checked'
  )?.value;

  // Validate required fields

  if (!name || !contact || !shootType) {
    feedback.textContent =
      "Please add your name, contact details and shooting type.";

    feedback.classList.remove("success");
    feedback.classList.add("error");
    return;
  }

  // Prevent duplicate submissions

  if (button.disabled) return;

  button.disabled = true;
  button.textContent = "Sending...";

  feedback.textContent = "Sending your inquiry...";
  feedback.classList.remove("error", "success");

  // Collect all fields from the existing form

  const formData = new FormData(form);

  // Add a readable subject for Formspree notifications

  formData.set(
    "_subject",
    `New photography inquiry — ${name}`
  );

  // If the visitor provided an email address,
  // include it as the email field for convenient replies.

  if (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
  ) {
    formData.set("email", contact);
  }

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      let errorMessage =
        "Something went wrong. Please try again.";

      try {
        const result = await response.json();

        if (
          Array.isArray(result.errors) &&
          result.errors.length > 0
        ) {
          errorMessage = result.errors
            .map((error) => error.message)
            .filter(Boolean)
            .join(" ");
        }
      } catch {
        // Keep the general error message
      }

      throw new Error(errorMessage);
    }

    // Submission confirmed successful

    feedback.textContent =
      "Your inquiry has been sent! I'll get back to you as soon as I can.";

    feedback.classList.remove("error");
    feedback.classList.add("success");

    form.reset();

  } catch (error) {
    feedback.textContent =
      error.message ||
      "Your inquiry couldn't be sent. Please try again.";

    feedback.classList.remove("success");
    feedback.classList.add("error");

  } finally {
    button.disabled = false;
    button.textContent = "Send inquiry ↗";
  }
});
