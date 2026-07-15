/* Draco — shared site behaviour: mobile menu toggle */
(function () {
   var burger = document.getElementById('dracoBurger');
   var menu = document.getElementById('dracoMobile');
   if (!burger || !menu) return;
   var close = document.getElementById('dracoClose');
   function set(open) { menu.classList.toggle('open', open); document.body.style.overflow = open ? 'hidden' : ''; }
   burger.addEventListener('click', function () { set(true); });
   if (close) close.addEventListener('click', function () { set(false); });
   menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
   document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
})();

/* Floating WhatsApp button — appears on every page that loads this script. */
(function () {
   if (document.querySelector('.wa-float')) return;
   var WA_NUMBER = '971504501195'; // Draco — Rajesh Rishi, +971 50 450 1195
   var a = document.createElement('a');
   a.className = 'wa-float';
   a.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent("Hi Draco, I'd like to talk about a loyalty program.");
   a.target = '_blank';
   a.rel = 'noopener noreferrer';
   a.setAttribute('aria-label', 'Chat on WhatsApp');
   a.innerHTML = '<i class="fa-brands fa-whatsapp"></i>';
   document.body.appendChild(a);
})();
