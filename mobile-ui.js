(() => {
  'use strict';
  const toggle = document.querySelector('.mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const header = document.querySelector('.site-header');
  const bar = document.querySelector('.mobile-action-bar');
  const mobile = window.matchMedia('(max-width: 820px)');
  const root = document.documentElement;
  const measure = () => {
    if (header) root.style.setProperty('--site-header-height', `${header.getBoundingClientRect().height}px`);
    if (bar && mobile.matches) root.style.setProperty('--mobile-bar-height', `${bar.getBoundingClientRect().height}px`);
  };
  measure();
  window.addEventListener('resize', measure);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(measure);
    if (header) observer.observe(header);
    if (bar) observer.observe(bar);
  }
  if (!toggle || !menu) return;
  let open = false;
  let blocked = [];
  const background = () => [...document.querySelectorAll('main, footer, .mobile-action-bar, .brand, .whatsapp-float, .site-header > nav:not(.mobile-menu)')];
  const setState = (next, restoreFocus = true) => {
    next = Boolean(next && mobile.matches);
    if (next === open) return;
    open = next;
    if (open) {
      menu.removeAttribute('inert');
      menu.setAttribute('aria-hidden', 'false');
      document.body.classList.add('mobile-menu-open');
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fechar menu');
      menu.querySelector('a')?.focus();
      blocked = background().map(element => [element, element.hasAttribute('inert')]);
      blocked.forEach(([element]) => element.setAttribute('inert', ''));
    } else {
      blocked.forEach(([element, wasInert]) => { if (!wasInert) element.removeAttribute('inert'); });
      blocked = [];
      if (restoreFocus && mobile.matches) toggle.focus();
      else if (menu.contains(document.activeElement)) document.activeElement.blur();
      menu.setAttribute('inert', '');
      menu.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('mobile-menu-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
    }
  };
  toggle.addEventListener('click', () => setState(!open));
  document.querySelectorAll('[data-mobile-menu-close]').forEach(element => element.addEventListener('click', () => setState(false)));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    setState(false);
    const destination = new URL(link.href, location.href);
    if (destination.origin === location.origin && destination.pathname === location.pathname && destination.hash) {
      const section = document.getElementById(decodeURIComponent(destination.hash.slice(1)));
      const target = section?.querySelector('h1, h2, h3') || section;
      if (target) {
        const previous = target.getAttribute('tabindex');
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener('blur', () => {
          if (previous === null) target.removeAttribute('tabindex');
          else target.setAttribute('tabindex', previous);
        }, { once: true });
      }
    }
  }));
  document.addEventListener('keydown', event => {
    if (!open) return;
    if (event.key === 'Escape') { event.preventDefault(); setState(false); return; }
    if (event.key !== 'Tab') return;
    const focusable = [toggle, ...menu.querySelectorAll('a[href], button:not([disabled])')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !focusable.includes(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !focusable.includes(document.activeElement))) {
      event.preventDefault(); first.focus();
    }
  });
  const reset = () => { if (!mobile.matches) setState(false, false); measure(); };
  mobile.addEventListener('change', reset);
  window.addEventListener('pageshow', () => { setState(false, false); measure(); });
})();
