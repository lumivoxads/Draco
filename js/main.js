/* ============================================
   Draco ù Shared Site Logic
   ============================================ */

const SITE_CONFIG = {
  logo: 'assets/logo/logo.jpg',
  logoAlt: 'assets/logo/logo-alt.jpg',
  social: {
    instagram: '#',
    linkedin: '#'
  },
  whatsapp: '971504501195',
  contacts: [
    {
      name: 'Rajesh Rishi',
      role: 'Primary Contact',
      phone: '+971504501195',
      email: 'rajesh.rishi@draco.ae',
    },
    {
      name: 'Akshay Manikantan',
      role: 'Business Development',
      phone: '+971506748498',
      email: 'akshay.manikantan@draco.ae',
    },
  ],
};

(function () {
  'use strict';

  function initNav() {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;

    const toggle = nav.querySelector('.site-nav__toggle');
    const links = nav.querySelectorAll('.site-nav__links a');

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(function (link) {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('is-active');
      }
    });

    if (toggle) {
      toggle.addEventListener('click', function () {
        const isOpen = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', isOpen);
      });

      links.forEach(function (link) {
        link.addEventListener('click', function () {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  function initLogo() {
    const logoImg = document.querySelector('.site-nav__logo img');
    const fallback = document.querySelector('.site-nav__logo-text');
    if (!logoImg) return;

    if (SITE_CONFIG.logo) {
      logoImg.src = SITE_CONFIG.logo;
    }

    logoImg.addEventListener('load', function () {
      if (fallback) fallback.style.display = 'none';
    });

    logoImg.addEventListener('error', function () {
      logoImg.style.display = 'none';
      if (fallback) fallback.style.display = 'inline';
    });
  }

  function initSocialLinks() {
    document.querySelectorAll('[data-social="instagram"]').forEach(function (el) {
      el.href = SITE_CONFIG.social.instagram;
    });

    document.querySelectorAll('[data-social="linkedin"]').forEach(function (el) {
      el.href = SITE_CONFIG.social.linkedin;
    });
  }

  function initWhatsApp() {
    const waUrl = 'https://wa.me/' + SITE_CONFIG.whatsapp;

    document.querySelectorAll('.whatsapp-float, [data-whatsapp]').forEach(function (el) {
      el.href = waUrl;
      if (el.tagName === 'A') {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  function formatPhone(phone) {
    if (phone.startsWith('+971')) {
      const digits = phone.replace(/\D/g, '').slice(3);
      return '+971 ' + digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5);
    }
    return phone;
  }

  function createContactCard(contact) {
    const card = document.createElement('div');
    card.className = 'contact-card';

    const name = document.createElement('h3');
    name.className = 'contact-card__name';
    name.textContent = contact.name;

    const role = document.createElement('p');
    role.className = 'contact-card__role';
    role.textContent = contact.role || 'Enterprise Loyalty Solutions';

    const phoneLink = document.createElement('a');
    phoneLink.className = 'contact-card__detail';
    phoneLink.href = 'tel:' + contact.phone.replace(/\s/g, '');
    phoneLink.textContent = formatPhone(contact.phone);

    const emailLink = document.createElement('a');
    emailLink.className = 'contact-card__detail';
    emailLink.href = 'mailto:' + contact.email;
    emailLink.textContent = contact.email;

    card.appendChild(name);
    card.appendChild(role);
    card.appendChild(phoneLink);
    card.appendChild(emailLink);

    return card;
  }

  function initContactCards() {
    const container = document.querySelector('[data-contacts]');
    if (!container) return;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    SITE_CONFIG.contacts.forEach(function (contact) {
      container.appendChild(createContactCard(contact));
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initLogo();
    initSocialLinks();
    initWhatsApp();
    initContactCards();
  });
})();
