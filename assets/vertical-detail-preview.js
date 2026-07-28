/* Click-to-expand vertical detail panel.
   Only "Airline" has real client copy — every other vertical shows a
   placeholder so every chip is clickable while real copy is pending. */
(function () {
   'use strict';

   function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
         return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
   }

   var PLACEHOLDER = function (name) {
      var safeName = escapeHtml(name);
      return {
         title: safeName,
         paragraphs: ['Full vertical brief coming soon — contact us to discuss Draco for ' + safeName + '.'],
         bullets: [],
         cta: { label: 'Contact us', href: 'contact.html' }
      };
   };

   var CONTENT = {
      'Airline': {
         title: 'Airline',
         paragraphs: [
            'From fast-growing ultra-low-cost disruptors to elite, award-winning global flagship carriers, the aviation industry relies on one core engine to drive customer lifetime value, dynamic monetization, and repeat bookings.',
            'Whether your business model demands lean, high-margin ancillary reward structures or hyper-personalized, multi-tiered luxury ecosystems, our enterprise loyalty platform is built to adapt, scale, and deliver.'
         ],
         bullets: [
            '<strong>Proven architectural versatility:</strong> purpose-built to power every business model — low-cost ancillary programs, coalition ecosystems, and full-service legacy platforms across every continent.',
            '<strong>Aggressive revenue growth:</strong> turn everyday passenger touchpoints into high-margin revenue streams with flexible points currencies, dynamic redemption, and frictionless co-brand partner integrations.',
            '<strong>Real-time data &amp; personalization:</strong> enterprise-grade analytics deliver tailor-made offers at high-intent moments, driving both frequency and ancillary spend.',
            '<strong>Massive global scale:</strong> engineered for high-volume throughput — hundreds of millions of active profiles, billions of transaction events, enterprise reliability.'
         ],
         cta: { label: 'Start a conversation', href: 'contact.html' }
      }
   };

   // Every region screen carries its own static card, so the detail panel is
   // created lazily inside whichever card the clicked chip belongs to.
   var root = document.getElementById('main');
   if (!root) return;

   var activeChip = null;
   var detailEl = null;

   function detailFor(chip) {
      var chipsContainer = chip.closest('.verticals-chips');
      if (!chipsContainer) return null;
      var existing = chipsContainer.parentNode.querySelector('.vertical-detail');
      if (existing) return existing;
      var el = document.createElement('div');
      el.className = 'vertical-detail';
      el.setAttribute('aria-live', 'polite');
      chipsContainer.parentNode.insertBefore(el, chipsContainer.nextSibling);
      return el;
   }

   function closeDetail() {
      if (detailEl) detailEl.classList.remove('open');
      if (activeChip) activeChip.classList.remove('active');
      activeChip = null;
      detailEl = null;
   }

   function renderDetail(name) {
      var data = CONTENT[name] || PLACEHOLDER(name);
      var html = '<button type="button" class="vd-close" aria-label="Close">&times;</button>';
      html += '<h3>' + data.title + '</h3>';
      data.paragraphs.forEach(function (p) { html += '<p>' + p + '</p>'; });
      if (data.bullets.length) {
         html += '<ul>' + data.bullets.map(function (b) { return '<li>' + b + '</li>'; }).join('') + '</ul>';
      }
      html += '<a class="vd-cta" href="' + data.cta.href + '">' + data.cta.label + ' <i class="fa-regular fa-arrow-right"></i></a>';
      detailEl.innerHTML = html;
   }

   root.addEventListener('click', function (e) {
      if (e.target.closest('.vd-close')) {
         closeDetail();
         return;
      }

      var chip = e.target.closest('.v-chip');
      if (!chip) return;

      if (chip === activeChip) {
         closeDetail();
         return;
      }

      var target = detailFor(chip);
      if (!target) return;

      closeDetail();
      chip.classList.add('active');
      activeChip = chip;
      detailEl = target;
      renderDetail(chip.textContent.trim());
      detailEl.classList.add('open');
   });
})();
