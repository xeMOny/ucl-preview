/*
  Portada del entorno de preview (preview.uclcampus.com).

  Qué hace: en el subdominio de preview, cualquier visita ve un cartel neutro
  ("Este enlace estará en funcionamiento más adelante"). El equipo entra una
  sola vez con un enlace especial (?k=TOKEN); el navegador lo recuerda y las
  siguientes visitas muestran la web completa sin teclear nada.

  Alcance: SOLO se activa en el host preview.uclcampus.com. En uclcampus.com
  (producción) o en local no hace nada, así que es inofensivo si queda tras el
  lanzamiento. Es protección "casual" (el contenido sigue en el HTML para quien
  sepa mirar el código fuente); suficiente para que nadie que tropiece con la
  URL vea la web. El sitio de preview va además con <meta robots noindex>.

  Cambiar el enlace de acceso: sustituir HASH por el cyrb53 del nuevo token
  (misma función de abajo). El enlace es  https://preview.uclcampus.com/?k=TOKEN
*/
(function () {
  if (location.hostname !== 'preview.uclcampus.com') return;

  var HASH = 'mmarl8cexw';      // cyrb53("ucl-preview-71db9ba1")
  var KEY = 'ucl_preview_ok';
  var PARAM = 'k';

  function cyrb53(str) {
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (var i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }
  function authorized() {
    try { return localStorage.getItem(KEY) === HASH; } catch (e) { return false; }
  }
  function grant() { try { localStorage.setItem(KEY, HASH); } catch (e) {} }

  // Ocultar el contenido cuanto antes (antes incluso de que exista #root) para
  // que no haya un parpadeo de la web para quien no tiene acceso.
  var hideStyle = null;
  function hideContent() {
    if (hideStyle) return;
    hideStyle = document.createElement('style');
    hideStyle.textContent = '#root{display:none!important}';
    (document.head || document.documentElement).appendChild(hideStyle);
  }
  function revealSite() {
    if (hideStyle && hideStyle.parentNode) hideStyle.parentNode.removeChild(hideStyle);
    var ph = document.getElementById('ucl-ph');
    if (ph && ph.parentNode) ph.parentNode.removeChild(ph);
  }
  function showPlaceholder() {
    if (document.getElementById('ucl-ph')) return;
    var d = document.createElement('div');
    d.id = 'ucl-ph';
    d.setAttribute('style', 'position:fixed;inset:0;z-index:2147483647;background:#ffffff;' +
      'display:flex;align-items:center;justify-content:center;padding:28px;text-align:center;' +
      'font-family:system-ui,-apple-system,\'Segoe UI\',Roboto,sans-serif');
    d.innerHTML = '<p style="max-width:460px;margin:0;font-size:17px;line-height:1.6;color:#556">' +
      'Este enlace estará en funcionamiento más adelante.</p>';
    (document.body || document.documentElement).appendChild(d);
  }

  if (!authorized()) hideContent();

  function boot() {
    if (authorized()) { revealSite(); return; }
    var k = new URLSearchParams(location.search).get(PARAM);
    if (k && cyrb53(k) === HASH) {
      grant();
      try { history.replaceState(null, '', location.pathname); } catch (e) {}
      revealSite();
    } else {
      showPlaceholder();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
