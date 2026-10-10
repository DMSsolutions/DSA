const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('is-open');
  });
}

const forms = document.querySelectorAll('.needs-feedback');

forms.forEach((form) => {
  const feedback = form.querySelector('.form-feedback');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const entries = Object.fromEntries(formData.entries());
    const formName = form.dataset.formName || 'contact';
    const subject =
      formName === 'devis'
        ? 'Nouvelle demande de devis'
        : `Nouveau message : ${entries.sujet || 'Contact'}`;

    const bodyLines = Object.entries(entries)
      .filter(([, value]) => String(value).trim() !== '')
      .map(([key, value]) => `${key}: ${value}`);

    const mailto = `mailto:contact@dsaconsulting.sn?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

    if (feedback) {
      feedback.textContent =
        "Merci, votre message est prêt. Votre application e-mail va s'ouvrir pour finaliser l'envoi.";
    }

    window.location.href = mailto;
    form.reset();
  });
});
