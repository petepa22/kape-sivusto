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

  // --- Liidikonversion laukaisu (Google Ads ja Meta) ---
  function laukaiseLiidikonversio() {
    try { gtag('event', 'conversion', { 'send_to': 'AW-1029024677/JTb2CNLJ2ckcEKXX1uoD' }); } catch (e) {}
    try { fbq('track', 'Lead'); } catch (e) {}
  }

  // --- Puheluklikkausten konversioseuranta (Google Ads) ---
  document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (typeof gtag === 'function') {
        gtag('event', 'conversion', { 'send_to': 'AW-1029024677/dqPZCJ359docEKXX1uoD' });
      }
    });
  });

  // Viesti lähtee kahta reittiä: Formspreehen ja FormSubmitin kautta suoraan
  // sähköpostiin. Riittää, että toinen menee perille, joten yhden palvelun
  // roskapostisuodatin ei voi hukata tarjouspyyntöä.
  function kapeLaheta(data) {
    var kopio = new FormData();
    data.forEach(function (arvo, avain) {
      if (avain !== '_next' && avain !== '_gotcha') { kopio.append(avain, arvo); }
    });
    kopio.append('_template', 'table');
    kopio.append('_captcha', 'false');
    var otsake = { 'Accept': 'application/json' };
    function perilla(pyynto) {
      return pyynto.then(function (r) {
        if (!r.ok) { return false; }
        return r.json().then(function (j) {
          return j.success !== false && j.success !== 'false';
        }, function () { return true; });
      }, function () { return false; });
    }
    return new Promise(function (valmis) {
      var kesken = 2;
      function tulos(ok) {
        if (ok) { valmis({ ok: true }); } else if (--kesken === 0) { valmis({ ok: false }); }
      }
      perilla(fetch('https://formspree.io/f/mqeglaay', { method: 'POST', headers: otsake, body: data })).then(tulos);
      perilla(fetch('https://formsubmit.co/ajax/petteri.palosaari@kape.fi', { method: 'POST', headers: otsake, body: kopio })).then(tulos);
    });
  }

  // Robotti täyttää piilokentän tai lähettää lomakkeen heti sivun avauduttua.
  var kapeAvattu = Date.now();
  function kapeRobotti(lomake) {
    var ansa = lomake.querySelector('[name="_gotcha"]');
    return !!(ansa && ansa.value) || Date.now() - kapeAvattu < 3000;
  }

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
        // Lähetä Formspreelle jos action on asetettu
        var action = form.getAttribute('action');
        if (action && action.indexOf('formspree') !== -1) {
          if (kapeRobotti(form)) {
            var ohitus = form.parentElement.querySelector('.form-success');
            if (ohitus) { form.style.display = 'none'; ohitus.classList.add('show'); }
            return;
          }
          var btn = form.querySelector('button[type="submit"]');
          if (btn) { btn.disabled = true; btn.textContent = 'Lähetetään...'; }

          kapeLaheta(new FormData(form)).then(function(response) {
            if (response.ok) {
              if (form.getAttribute('data-liidi') !== null) {
                laukaiseLiidikonversio();
              }
              var successMsg = form.parentElement.querySelector('.form-success');
              if (successMsg) {
                form.style.display = 'none';
                successMsg.classList.add('show');
              }
            } else {
              if (btn) { btn.disabled = false; btn.textContent = 'Lähetä viesti'; }
              alert('Lähetys epäonnistui. Yritä uudelleen tai soita 044 015 0618.');
            }
          }).catch(function() {
            if (btn) { btn.disabled = false; btn.textContent = 'Lähetä viesti'; }
            alert('Yhteysvirhe. Yritä uudelleen tai soita 044 015 0618.');
          });
        } else {
          // Fallback ilman Formspreeta
          var successMsg = form.parentElement.querySelector('.form-success');
          if (successMsg) {
            form.style.display = 'none';
            successMsg.classList.add('show');
          } else {
            alert('Kiitos yhteydenotosta! Palaamme asiaan pian.');
            form.reset();
          }
        }
      }
    });
  });

  // --- Kiitosviesti lomakkeen lähetyksen jälkeen ---
  // Lomakkeet lähtevät Formspreelle tavallisena POSTina ja palaavat
  // takaisin osoitteeseen ?kiitos=1. Näytetään silloin kiitosviesti
  // lomakkeen tilalla, ettei lähettäjä jää arvailemaan menikö viesti perille.
  if (window.location.search.indexOf('kiitos=1') !== -1) {
    document.querySelectorAll('.form-success').forEach(function (viesti) {
      var kuori = viesti.parentElement;
      var lomake = kuori ? kuori.querySelector('form') : null;
      if (lomake) { lomake.style.display = 'none'; }
      viesti.classList.add('show');
      try { viesti.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    });
  }

});
