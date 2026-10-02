/* ProofFolio site script: vanilla JS, no dependencies. */
(() => {
  'use strict';

  const cfg = window.PROOFFOLIO_CONFIG || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(message) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => { toast.hidden = true; }, 300);
    }, 4500);
  }

  /* ---------- Config: Play link, contact, policy details ---------- */
  function applyConfig() {
    const playUrl = String(cfg.playStoreUrl || '').trim();
    $$('[data-play-link]').forEach((link) => {
      if (playUrl) {
        link.href = playUrl;
        link.target = '_blank';
        link.rel = 'noopener';
      } else {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          showToast('The Google Play link has not been added yet.');
        });
      }
    });

    const email = String(cfg.contactEmail || '').trim();
    $$('[data-contact-link]').forEach((link) => {
      if (email) link.href = 'mailto:' + email;
    });
    $$('[data-contact-item]').forEach((item) => { item.hidden = !email; });
    if (email) {
      $$('[data-contact-email]').forEach((el) => {
        const a = document.createElement('a');
        a.href = 'mailto:' + email;
        a.textContent = email;
        el.replaceWith(a);
      });
    }

    $$('[data-config]').forEach((el) => {
      const value = String(cfg[el.dataset.config] || '').trim();
      if (value) {
        el.textContent = value;
        el.classList.remove('fill');
      }
    });
  }

  /* ---------- Mobile navigation ---------- */
  function initNav() {
    const toggle = $('.nav-toggle');
    const nav = $('#site-nav');
    if (!toggle || !nav) return;
    const icon = $('use', toggle);

    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (icon) icon.setAttribute('href', open ? '#i-close' : '#i-menu');
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Highlight current section in the nav (home page only) ---------- */
  function initSectionNav() {
    const links = $$('.nav a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    const byId = new Map();
    links.forEach((link) => {
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (target) byId.set(target, link);
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = byId.get(entry.target);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((l) => l.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'location');
        } else if (link.getAttribute('aria-current')) {
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, target) => observer.observe(target));
  }

  /* ---------- Problem section: scattered items gather into a project ---------- */
  function initGather() {
    const root = $('[data-gather]');
    if (!root) return;
    const stage = $('.gather__stage', root);
    const chips = $$('.chip', root);
    const slots = $$('.slot', root);
    const button = $('[data-gather-toggle]', root);
    const status = $('[data-gather-status]', root);
    if (!stage || !chips.length || !slots.length || !button) return;

    let touched = false;

    function layout() {
      const stageBox = stage.getBoundingClientRect();
      chips.forEach((chip) => {
        const slot = slots[Number(chip.dataset.slot)];
        if (!slot) return;
        const box = slot.getBoundingClientRect();
        const w = box.width;
        const h = box.height;
        chip.style.width = w + 'px';
        chip.style.height = h + 'px';
        const u = Number(chip.dataset.u);
        const v = Number(chip.dataset.v);
        chip.style.setProperty('--sx', (u * (stageBox.width - w)).toFixed(1) + 'px');
        chip.style.setProperty('--sy', (v * (stageBox.height - h)).toFixed(1) + 'px');
        chip.style.setProperty('--sr', chip.dataset.r + 'deg');
        chip.style.setProperty('--gx', (box.left - stageBox.left).toFixed(1) + 'px');
        chip.style.setProperty('--gy', (box.top - stageBox.top).toFixed(1) + 'px');
      });
    }

    function relayout() {
      root.classList.add('no-anim');
      layout();
      root.classList.add('is-ready');
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('no-anim')));
    }

    function setGathered(gathered) {
      root.classList.toggle('is-gathered', gathered);
      button.textContent = gathered ? 'Scatter again' : 'Gather into a project';
      if (status) {
        status.textContent = gathered
          ? 'Six items are now gathered in one project called Riverside survey.'
          : 'Six items are scattered across different places.';
      }
    }

    relayout();
    if ('ResizeObserver' in window) {
      let lastWidth = stage.clientWidth;
      new ResizeObserver(() => {
        if (stage.clientWidth !== lastWidth) {
          lastWidth = stage.clientWidth;
          relayout();
        }
      }).observe(stage);
    } else {
      window.addEventListener('resize', relayout);
    }

    button.addEventListener('click', () => {
      touched = true;
      setGathered(!root.classList.contains('is-gathered'));
    });

    // One orchestrated moment: gather once when the section scrolls into view.
    if ('IntersectionObserver' in window && !reduceMotion.matches) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          setTimeout(() => { if (!touched) setGathered(true); }, 700);
        }
      }, { threshold: 0.6 });
      io.observe(stage);
    }
  }

  /* ---------- Accessible tabs (use cases) ---------- */
  function initTabs() {
    const list = $('[data-tabs]');
    if (!list) return;
    const tabs = $$('[role="tab"]', list);
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));

    function select(index, focus) {
      tabs.forEach((tab, i) => {
        const on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        if (panels[i]) panels[i].hidden = !on;
      });
      if (focus) tabs[index].focus();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i, false));
      tab.addEventListener('keydown', (event) => {
        let next = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (i + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        if (next !== null) {
          event.preventDefault();
          select(next, true);
        }
      });
    });
    select(0, false);
  }

  /* ---------- Privacy page: table of contents and draft banner ---------- */
  function initPolicy() {
    const toc = $('.toc');
    if (toc && window.matchMedia('(max-width: 61.99rem)').matches) toc.open = false;

    const banner = $('[data-policy-banner]');
    if (!banner) return;
    const pending = $$('.confirm, .fill').filter(
      (el) => el.classList.contains('confirm') || !el.closest('.confirm')
    ).length;
    const count = $('[data-policy-count]', banner);
    if (count) count.textContent = String(pending);
    if (pending === 0) banner.hidden = true;
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyConfig();
    initNav();
    initSectionNav();
    initGather();
    initTabs();
    initPolicy();
  });
})();
