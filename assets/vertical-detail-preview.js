/* Click-to-expand vertical detail panel.
   Content is keyed by region + vertical so the same chip label can show
   different client blurbs on different region cards. Chips with no mapped
   copy do not open a detail panel. */
(function () {
   'use strict';

   function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
         return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
   }

   var CTA = { label: 'Start a conversation', href: 'contact.html' };

   function entry(title, body) {
      return {
         title: title,
         paragraphs: [body],
         bullets: [],
         cta: CTA
      };
   }

   // Client blurbs (Draco website 2.0) — keyed by exact .region-name × chip label.
   var CONTENT = {
      'Africa': {
         'BFSI': entry(
            'Empowering Financial Wellbeing, Wealth-Building Ecosystems, and Integrated Retail Banking',
            'Engineered for Africa and emerging growth markets, our LMS drives multi-tier engagement by transforming everyday financial health into tangible consumer rewards. Designed to power leading non-banking financial services groups, pan-African wealth networks, and integrated retail credit ecosystems, our platform links responsible banking behavior directly to high-value rewards. From earning points on life cover, investments, and daily card spending to redeeming perks across wellness, entertainment, air travel, and retail networks, our system gives financial institutions the tools to deepen client loyalty, elevate lifetime customer value, and fuel long-term financial inclusion.'
         ),
         'Fuel': entry(
            'High-Volume Forecourt Ecosystems, Premium Performance Loyalty, and One-Stop Convenience Solutions',
            'Empower fuel retailers and station networks across Africa and key emerging markets with a digital loyalty platform built to capture high-frequency forecourt footfall. Engineered to support massive multi-market retail operations under leading global fuel brands, our LMS turns routine fill-ups into deep customer engagement. Seamlessly reward drivers for fueling up with premium performance gasolines, synthetic engine oils, and EV charging, while effortlessly driving in-store convenience, fast-food dining, and lubricant bay redemptions. With instant app-based scanning, digital pay-at-pump integration, and localized e-vouchers, our platform helps fuel operators maximize non-fuel retail margins and convert daily transit into brand advocacy.'
         )
      },
      'Asia': {
         'Airline': entry(
            'Data-Driven Lifestyle Ecosystems & Island-Connecting Rewards for APAC',
            'Unlock the immense potential of the Asia-Pacific and Oceania travel markets with a data-centric loyalty platform engineered for diverse geography and dynamic consumer habits. From high-growth Asian low-cost carriers offering multi-industry lifestyle ecosystems (where points convert across banking, dining, and retail) to Central Asian flag carriers and island-hopping Pacific networks providing vital regional air links, our LMS drives total travel engagement. Supported by advanced customer data analytics, our system transforms flight activity into hyper-personalized offers, robust coalition rewards, and enduring brand loyalty.'
         ),
         'Airport': entry(
            'Next-Gen Airport Ecosystems, Tech-Driven Passenger Journeys, and Hyper-Connected Hubs',
            'Engine of the world’s fastest-growing tech hubs and mega-gateways across South Asia, our LMS seamlessly bridges airside operations, digital passenger companions, and omnichannel retail platforms. Designed to power award-winning terminal ecosystems and booming regional transit hubs, our platform turns physical airport footfall into digital engagement. From real-time mobile app integrations for lounge access, dining, and duty-free rewards to unified flight-and-transit loyalty perks, we empower India’s premier international gateways to deliver a frictionless, garden-to-gate experience that maximizes non-aeronautical revenues and passenger satisfaction.'
         ),
         'Ecosystem': entry(
            'Aviation-Led Conglomerate Coalitions & Multi-Industry Ecosystem Integration',
            'Drive total customer lifetime value across Southeast Asia with a powerful coalition loyalty platform built for sprawling enterprise networks. Designed to unify low-cost carriers, retail banking, real estate, healthcare, and everyday consumer touchpoints into one seamless rewards engine, our LMS makes earning points an effortless part of daily life. Members can collect points on routine transactions, unlock instant split-payment flight redemptions, and burn points across digital merchant networks. Powered by micro-incentives and deep cross-brand analytics, our platform helps market leaders turn disparate consumer interactions into an interconnected, habit-forming loyalty ecosystem.'
         ),
         'Hospitality': entry(
            'Heritage-Rich Luxury, Multi-Ecosystem Banking Integration, and Scale-Driven Loyalty',
            'Engine of South Asia’s premier hospitality brands, our platform connects historic luxury palaces, sprawling wellness retreats, and fast-growing business hotel chains under a unified rewards architecture. Designed to handle complex cross-industry loyalty ecosystems—including direct integrations with national conglomerate currencies, high-yield dining membership subscriptions, and co-branded credit cards—our LMS drives exceptional guest retention. From elite spa vouchers and milestone celebrations to instant point redemption at fine-dining venues, we equip hospitality leaders across the region to maximize guest lifetime value and capture total wallet share.'
         ),
         'Retail / CPG': entry(
            'Omnichannel Retail Alliances, Premium Department Store Loyalty, and Hypermarket Cashback Systems',
            'Transform high-volume grocery, fashion, and lifestyle retail across the Middle East and South Asia with a loyalty platform built for deep customer retention and omnichannel conversion. Engineered to support everything from premier multi-brand department store programs with tiered VIP perks and exclusive shopping events to mega-hypermarket networks offering instant, digital cash-like redemptions, our LMS bridges physical stores and e-commerce seamlessly. With friction-free POS integration, localized WhatsApp messaging, app-based receipt scanning, and dynamic co-brand card management, our system empowers regional retail leaders to increase basket frequency, drive high-margin non-aeronautical retail growth, and capture lifetime wallet share.'
         )
      },
      'Central America': {
         'Airline': entry(
            'Coalition Loyalty Engines and Frictionless Travel Rewards Across Latin America',
            'Elevate passenger engagement across Latin America with an agile loyalty architecture built for high-velocity earning and cross-brand ecosystem integration. Designed to power hyper-flexible coalition reward programs and ultra-low-cost carrier models across Mexico and Central and South America, our platform lets travelers effortlessly earn and spend points on everything from flight tickets and airport transit taxes (TUA) to everyday retail purchases. By seamlessly merging multi-partner earn networks with instant, split-payment redemptions for baggage and seat upgrades, we help regional operators build deeply habit-forming travel brands.'
         ),
         'QSR': entry(
            'Multi-Format Foodservice Engagement, High-Yield Point Currency, and Cross-Concept Dining Perks',
            'Drive guest frequency across Latin America’s largest restaurant operators with an agile dining loyalty engine built for high-capacity casual dining chains, iconic fast-casual concepts, and multi-brand franchise groups. Our LMS seamlessly bridges diverse dining formats—from high-energy American casual grills and bar concepts to authentic traditional fast-casual eateries—under a single, high-engagement digital umbrella. Members accumulate a unified point currency on every bill, unlock exclusive birthday rewards and instant dining credits, and redeem split-payment discounts across mobile delivery and table-side touchpoints. By enabling multi-brand cross-earn mechanics, localized promotion engines, and frictionless app-based point redemption, our platform empowers regional restaurant groups to increase average ticket size, boost off-premise ordering, and convert casual diners into daily brand advocates.'
         ),
         'Retail / CPG': entry(
            'High-Frequency Neighborhood Retail, Direct-to-Consumer CPG Coalitions, and Inclusive Credit Ecosystems',
            'Power Latin America’s largest retail and consumer goods networks with an agile loyalty engine built for high-velocity daily transactions and cross-channel engagement. Designed to handle sprawling convenience store chains, premier department store retailers, consumer credit programs, and massive beverage bottling and distribution ecosystems across Mexico and South America, our LMS unifies every consumer touchpoint. From earning cash-back rewards on daily pantry essentials and impulse buys to unlocking store credit perks, promotional CPG rewards, and seamless point redemptions across neighborhood corner stores, department stores, and digital banking apps, our platform converts high-frequency footfall into lasting consumer brand equity and higher basket size.'
         )
      },
      'Central Asia': {
         'Airline': entry(
            'Data-Driven Lifestyle Ecosystems & Island-Connecting Rewards for APAC',
            'Unlock the immense potential of the Asia-Pacific and Oceania travel markets with a data-centric loyalty platform engineered for diverse geography and dynamic consumer habits. From high-growth Asian low-cost carriers offering multi-industry lifestyle ecosystems (where points convert across banking, dining, and retail) to Central Asian flag carriers and island-hopping Pacific networks providing vital regional air links, our LMS drives total travel engagement. Supported by advanced customer data analytics, our system transforms flight activity into hyper-personalized offers, robust coalition rewards, and enduring brand loyalty.'
         )
      },
      'Europe': {
         'Airline': entry(
            'Hybrid Value, Seamless Commutes, and Regional Connectivity for Europe',
            'Dominate Europe’s highly competitive short-haul and point-to-point markets with a streamlined, low-friction loyalty platform designed for maximum retention. Tailored for hybrid flag carriers connecting Southeastern Europe, budget short-haul innovators operating across the continent, and regional commuters, our LMS turns every flight into immediate value. With flexible, transparent tier progression, instant points-plus-cash seat upgrades, and localized lifestyle partner integrations, European carriers can increase direct booking frequency, boost ancillary seat loads, and reward passenger trust without operational complexity.'
         ),
         'Ecosystem': entry(
            'Universal Cross-Industry Currencies and Seamless Nordic Ecosystem Rewards',
            'Redefine consumer engagement across the Nordics with a unified currency ecosystem designed to break down traditional loyalty silos. Our LMS enables seamless, cross-brand point earning and instant spending across a diverse network—connecting airline flights, regional hotel chains, daily grocery shopping, and lifestyle experiences under one frictionless digital banner. By giving members a flexible, universal loyalty tender that tracks easily via mobile app and redeems effortlessly across everyday touchpoints, our platform empowers regional operators to drive high-velocity earning, increase cross-sector retention, and maximize overall wallet share.'
         ),
         'Hospitality': entry(
            'Frictionless Regional Networks, Lifestyle Subscriptions, and Sustainable Travel Rewards',
            'Accelerate guest frequency across Europe’s diverse city-center, business, and resort hotels with a flexible loyalty platform engineered for modern, tech-savvy travelers. Whether supporting pan-European luxury collections, midscale lifestyle brands, or Nordic cross-industry coalitions where points flow freely between hotels, airlines, and retail partners, our LMS turns casual stays into habit-forming engagement. With transparent points-plus-cash bookings, automated room upgrades, mobile-first account management, and instant food-and-beverage vouchers, we help European hoteliers boost direct booking conversion and optimize occupancy year-round.'
         ),
         'Telco': entry(
            'App-First Customer Engagement, Lifestyle Micro-Moments, and Pan-European Loyalty Integration',
            'Transform mobile connectivity into daily brand engagement across Europe with a loyalty architecture engineered to move telecom operators far beyond traditional voice and data. Built to power seamless, app-centric customer loyalty across single-market leaders and multi-country telecom groups alike, our LMS turns routinely opened self-care apps into thriving lifestyle hubs. Reward subscriber retention with gamified points, exclusive partner vouchers, pre-sale entertainment access, streaming discounts, and localized daily perks. By combining multi-market operational capabilities with flexible earn-and-burn mechanics for mobile, fiber, and IoT subscribers, our platform enables European telcos to dramatically lower churn, elevate digital app engagement, and drive high-margin cross-sell opportunities.'
         )
      },
      'Middle East': {
         'Airline': entry(
            'Unmatched Flagship Luxury & Next-Gen Regional Mobility in the Middle East',
            'Engineer world-class passenger journeys across the Middle East with a loyalty engine capable of managing the full spectrum of modern aviation. From world-renowned, global network carriers delivering luxury multi-tiered lounge and cabin upgrade experiences to ambitious new national flag carriers and fast-expanding regional budget airlines, our platform powers it all. Effortlessly manage global partner networks, premium status recognition, local bank transfer integrations, and instant ancillary monetization—delivering tailored loyalty that resonates with high-net-worth international jet-setters and regional travelers alike.'
         ),
         'Hospitality': entry(
            'Palatial Hospitality, Elite Recognition, and Immersive Destination Perks',
            'Designed for the world’s most prestigious luxury destinations, our LMS delivers hyper-personalized, white-glove loyalty experiences for discerning international travelers. Engineered to manage elite multi-tier status structures, ultra-exclusive lounge privileges, private beach access, and Michelin-tier dining perks, our platform turns stays into lifelong brand affinity. Whether managing ultra-luxury flagship properties in Arabian metropolises or iconic island sanctuaries in the Indian Ocean, our system empowers luxury hoteliers to deliver flawless guest recognition, drive direct bookings, and maximize high-yield on-property spend.'
         ),
         'Retail': entry(
            'Omnichannel Retail Coalitions, Family Points Sharing, and Hyper-Personalized Lifestyle Rewards',
            'Engine of the region’s premier shopping malls, hypermarkets, global fashion franchises, and indoor entertainment venues, our LMS powers unified cross-category loyalty across every consumer touchpoint. Engineered to seamlessly connect weekly grocery runs, luxury mall shopping, cinema visits, and family leisure attractions, our platform turns footfall into high-frequency engagement. Members benefit from instant, cash-like point redemptions, friction-free receipt scanning, and shared family pooling algorithms that accelerate reward velocity. Backed by advanced customer data analytics, our system empowers enterprise retail conglomerates to deliver hyper-targeted promotional offers, boost tenant non-aeronautical retail margins, and cultivate unmatched cross-brand brand equity.'
         ),
         'Retail / CPG': entry(
            'Omnichannel Retail Alliances, Premium Department Store Loyalty, and Hypermarket Cashback Systems',
            'Transform high-volume grocery, fashion, and lifestyle retail across the Middle East and South Asia with a loyalty platform built for deep customer retention and omnichannel conversion. Engineered to support everything from premier multi-brand department store programs with tiered VIP perks and exclusive shopping events to mega-hypermarket networks offering instant, digital cash-like redemptions, our LMS bridges physical stores and e-commerce seamlessly. With friction-free POS integration, localized WhatsApp messaging, app-based receipt scanning, and dynamic co-brand card management, our system empowers regional retail leaders to increase basket frequency, drive high-margin non-aeronautical retail growth, and capture lifetime wallet share.'
         )
      },
      'North America': {
         'Airline': entry(
            'Dynamic Low-Fare Loyalty, Tiered Perks, and Smart Analytics for North America',
            'Tailored for North America’s fast-evolving aviation landscape, our LMS bridges ultra-accessible low-cost travel with high-value loyalty mechanics. Whether powering flexible cash-plus-points redemptions for budget-friendly transcontinental routes, managing all-you-can-fly subscription passes and unbundled ancillary perks, or driving co-brand card spending for major regional carriers, our platform handles it all. Backed by deep predictive data analytics, we equip operators from the U.S. and Canada to convert every unbundled seat and co-branded interaction into measurable, long-term customer lifetime value.'
         ),
         'Hospitality': entry(
            'Indulgent Resort Loyalty, Experiential Escapes, and High-Engagement Dining Perks',
            'Elevate the leisure experience across North America, the Caribbean, and coastal resort markets with a loyalty engine built for fun, relaxation, and high-energy hospitality. Designed to power everything from upscale independent boutique portfolios and oceanfront resort collections to music- and entertainment-inspired lifestyle brands, our LMS turns guest passion into repeat visits. Seamlessly manage instant pool-and-cabana perks, resort credit redemptions, food-and-beverage savings, and multi-property tier recognition, enabling hospitality operators to cultivate a devoted, community-driven guest base that books direct time and again.'
         )
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

   function regionFor(chip) {
      var panel = chip.closest('.glass-panel');
      if (!panel) return '';
      var nameEl = panel.querySelector('.region-name');
      return nameEl ? nameEl.textContent.trim() : '';
   }

   function lookup(region, vertical) {
      var byRegion = CONTENT[region];
      if (byRegion && byRegion[vertical]) return byRegion[vertical];
      return null;
   }

   function renderDetail(data) {
      var html = '<button type="button" class="vd-close" aria-label="Close">&times;</button>';
      html += '<h3>' + escapeHtml(data.title) + '</h3>';
      data.paragraphs.forEach(function (p) { html += '<p>' + escapeHtml(p) + '</p>'; });
      if (data.bullets.length) {
         html += '<ul>' + data.bullets.map(function (b) { return '<li>' + b + '</li>'; }).join('') + '</ul>';
      }
      html += '<a class="vd-cta" href="' + data.cta.href + '">' + escapeHtml(data.cta.label) + ' <i class="fa-regular fa-arrow-right"></i></a>';
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

      var data = lookup(regionFor(chip), chip.textContent.trim());
      if (!data) {
         closeDetail();
         return;
      }

      var target = detailFor(chip);
      if (!target) return;

      closeDetail();
      chip.classList.add('active');
      activeChip = chip;
      detailEl = target;
      renderDetail(data);
      detailEl.classList.add('open');
   });
})();
