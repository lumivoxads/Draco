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

/* Floating Contact Rail — appears on every page that loads this script. */
(function () {
   if (document.querySelector('.contact-rail')) return;
   var rail = document.createElement('div');
   rail.className = 'contact-rail';
   
   var links = [
      { id: 'wa', href: 'https://wa.me/971504501195?text=' + encodeURIComponent("Hi Draco, I'd like to talk about a loyalty program."), icon: 'fa-brands fa-whatsapp', label: 'WhatsApp', target: '_blank' },
      { id: 'em', href: 'mailto:Rajesh.Rishi@Draco.ae', icon: 'fa-regular fa-envelope', label: 'Email', target: '' },
      { id: 'in', href: 'https://www.linkedin.com/in/rajeshrishi', icon: 'fa-brands fa-linkedin-in', label: 'LinkedIn', target: '_blank' }
   ];
   
   links.forEach(function(l) {
      var a = document.createElement('a');
      a.className = 'rail-btn rail-' + l.id;
      a.href = l.href;
      if (l.target) {
         a.target = l.target;
         a.rel = 'noopener noreferrer';
      }
      a.setAttribute('aria-label', l.label);
      a.innerHTML = '<span class="tooltip">' + l.label + '</span><i class="' + l.icon + '"></i>';
      rail.appendChild(a);
   });
   
   document.body.appendChild(rail);
})();

/* About page sub-nav & back-to-top */
(function () {
   var nav = document.getElementById('aboutNav');
   if (!nav) return;
   
   var floatNav = nav.cloneNode(true);
   floatNav.id = 'aboutNavFloat';
   floatNav.className = 'about-subnav-float';
   document.body.appendChild(floatNav);

   var btt = document.createElement('button');
   btt.className = 'back-to-top';
   btt.setAttribute('aria-label', 'Back to top');
   btt.innerHTML = '<i class="fa-regular fa-arrow-up"></i>';
   btt.addEventListener('click', function() { window.scrollTo({top: 0, behavior: 'smooth'}); });
   document.body.appendChild(btt);

   var sections = Array.from(document.querySelectorAll('.d-section[id]'));
   var links = floatNav.querySelectorAll('a');
   var inlineLinks = nav.querySelectorAll('a');

   window.addEventListener('scroll', function () {
      var scroll = window.scrollY;
      var hero = document.querySelector('.page-hero');
      var threshold = hero ? hero.offsetHeight : 300;
      
      var isPast = scroll > threshold;
      floatNav.classList.toggle('show', isPast);
      btt.classList.toggle('show', isPast);

      var current = '';
      sections.forEach(function(sec) {
         if (scroll >= sec.offsetTop - 150) {
            current = sec.getAttribute('id');
         }
      });
      
      if (current) {
         [links, inlineLinks].forEach(function(linkList) {
            linkList.forEach(function(a) {
               a.classList.toggle('active', a.getAttribute('href') === '#' + current);
            });
         });
      }
   });
})();
