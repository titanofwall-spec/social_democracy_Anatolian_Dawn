/* Align desktop sidebars with the connected title/menu header. */
(function () {
  'use strict';
  function init() {
    const page = document.getElementById('page');
    const menu = document.getElementById('header-links');
    const header = menu && menu.closest('header');
    if (!page || !header) return;
    function align() {
      const top = menu.getBoundingClientRect().top - page.getBoundingClientRect().top;
      page.style.setProperty('--ad-menu-top', top + 'px');
    }
    align();
    window.addEventListener('resize', align);
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(align);
      observer.observe(header);
      observer.observe(page);
    }
    if (document.fonts) document.fonts.ready.then(align);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
