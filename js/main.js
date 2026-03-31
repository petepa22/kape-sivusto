/* =============================================
   Rakennusliike KaPe Oy - main.js
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {

  // --- Hamburger menu toggle ---
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    // Sulje menu kun linkkiä klikataan
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // --- Sticky header taustavärin vaihto scrollattaessa ---
  const header = document.querySelector('.site-header');

  if (header) {
    function updateHeader() {
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  // --- Smooth scroll ankkurilinkeille ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var headerHeight = header ? header.offsetHeight : 0;
        var targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight - 10;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Lomakkeen perusvalidointi ---
  var forms = document.querySelectorAll('.contact-form form');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var isValid = true;

      // Poista vanhat virheet
      form.querySelectorAll('.form-group').forEach(function (group) {
        group.classList.remove('has-error');
      });

      // Validoi pakolliset kentät
      var nimi = form.querySelector('[name="nimi"]');
      var puhelin = form.querySelector('[name="puhelin"]');
      var email = form.querySelector('[name="email"]');
      var viesti = form.querySelector('[name="viesti"]');

      if (nimi && !nimi.value.trim()) {
        nimi.closest('.form-group').classList.add('has-error');
        isValid = false;
      }

      if (puhelin && !puhelin.value.trim()) {
        puhelin.closest('.form-group').classList.add('has-error');
        isValid = false;
      }

      if (email && email.value.trim()) {
        // Validoi sähköposti vain jos kenttä ei ole tyhjä
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
          email.closest('.form-group').classList.add('has-error');
          isValid = false;
        }
      }

      if (isValid) {
        // Näytä onnistumisviesti
        var successMsg = form.parentElement.querySelector('.form-success');
        if (successMsg) {
          form.style.display = 'none';
          successMsg.classList.add('show');
        } else {
          alert('Kiitos yhteydenotosta! Palaamme asiaan pian.');
          form.reset();
        }
      }
    });
  });

});
