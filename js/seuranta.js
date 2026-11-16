// Mainonnan seuranta (Google Ads ja Meta Pixel) käynnistyy vasta, kun kävijä
// hyväksyy evästeet. Valinta tallennetaan selaimeen, ja sen voi vaihtaa
// tietosuojasivulta (window.kapeEvasteet()).
(function () {
  var AVAIN = 'kape-evasteet';
  var GOOGLE_ID = 'AW-1029024677';
  var META_ID = '1543626617179447';
  var kiitos = window.location.search.indexOf('kiitos=1') !== -1;

  // gtag on aina määritelty, jotta sivun muu koodi voi kutsua sitä.
  // Ilman hyväksyntää kutsut jäävät selaimen muistiin eivätkä lähde minnekään.
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };

  function lueValinta() {
    try { return window.localStorage.getItem(AVAIN); } catch (e) { return null; }
  }

  function tallennaValinta(arvo) {
    try { window.localStorage.setItem(AVAIN, arvo); } catch (e) {}
  }

  var kaynnissa = false;
  function kaynnistaSeuranta() {
    if (kaynnissa) { return; }
    kaynnissa = true;

    var g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ID;
    document.head.appendChild(g);
    gtag('js', new Date());
    gtag('config', GOOGLE_ID);
    if (kiitos) { gtag('event', 'conversion', { 'send_to': GOOGLE_ID + '/JTb2CNLJ2ckcEKXX1uoD' }); }

    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', META_ID);
    fbq('track', 'PageView');
    if (kiitos) { fbq('track', 'Lead'); }
  }

  var tyyli =
    '#kape-evastebanneri{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;' +
    'max-width:640px;margin:0 auto;background:#fff;color:#222;border:1px solid #d6d6d6;' +
    'border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.15);padding:18px 20px;' +
    'font-size:15px;line-height:1.5;font-family:inherit}' +
    '#kape-evastebanneri p{margin:0 0 14px}' +
    '#kape-evastebanneri a{color:#2d6432;text-decoration:underline}' +
    '#kape-evastebanneri .kape-ev-napit{display:flex;gap:10px;flex-wrap:wrap}' +
    '#kape-evastebanneri button{flex:1 1 160px;padding:11px 16px;border-radius:6px;' +
    'font:inherit;font-weight:600;cursor:pointer;border:2px solid #2d6432}' +
    '#kape-evastebanneri .kape-ev-hyvaksy{background:#2d6432;color:#fff}' +
    '#kape-evastebanneri .kape-ev-kiella{background:#fff;color:#2d6432}';

  function naytaBanneri() {
    if (document.getElementById('kape-evastebanneri')) { return; }
    if (!document.getElementById('kape-evastetyyli')) {
      var s = document.createElement('style');
      s.id = 'kape-evastetyyli';
      s.textContent = tyyli;
      document.head.appendChild(s);
    }
    var b = document.createElement('div');
    b.id = 'kape-evastebanneri';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'Evästeet');
    b.innerHTML =
      '<p>Käytämme Googlen ja Metan evästeitä mainonnan toimivuuden mittaamiseen. ' +
      'Sivusto toimii samalla tavalla, vaikka et hyväksyisi niitä. ' +
      '<a href="/tietosuoja">Tietosuojaseloste</a></p>' +
      '<div class="kape-ev-napit">' +
      '<button type="button" class="kape-ev-hyvaksy">Hyväksy</button>' +
      '<button type="button" class="kape-ev-kiella">Vain välttämättömät</button>' +
      '</div>';
    b.querySelector('.kape-ev-hyvaksy').addEventListener('click', function () {
      tallennaValinta('kylla');
      b.parentNode.removeChild(b);
      kaynnistaSeuranta();
    });
    b.querySelector('.kape-ev-kiella').addEventListener('click', function () {
      var aiemmin = lueValinta();
      tallennaValinta('ei');
      b.parentNode.removeChild(b);
      // Jos seuranta oli jo päällä, sivu ladataan uudelleen ilman sitä.
      if (aiemmin === 'kylla' && kaynnissa) { window.location.reload(); }
    });
    document.body.appendChild(b);
  }

  window.kapeEvasteet = naytaBanneri;

  var valinta = lueValinta();
  if (valinta === 'kylla') {
    kaynnistaSeuranta();
  } else if (valinta !== 'ei') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', naytaBanneri);
    } else {
      naytaBanneri();
    }
  }
})();
