/* Junk Doctors PPC mini-site behavior (forked from the TJ's build 9/29/2026). Built into /assets/lp.js by build.py (town list injected). */
(function(){
  'use strict';
  var CFG = {
    /* Live Google reviews. Fill both to switch the reviews block and the hero rating to live data.
       JD: LEAVE EMPTY. The page says 3,080+ reviews across NC (all JD listings combined); one listing's live
       count would contradict it. Static quotes are word for word from junkdrs.com. */
    placesKey: '',
    placeId: '',
    tz: 'America/New_York',
    /* junkdrs.com: crews Mon to Sat 8am to 7pm, same-day often available if you call before 3pm. */
    sameDayCutoff: 15
  };
  var TOWNS = {"charlotte":["Charlotte","NC"],"cotswold":["Cotswold","NC"],"dilworth":["Dilworth","NC"],"eastover":["Eastover","NC"],"myers-park":["Myers Park","NC"],"noda":["NoDa","NC"],"plaza-midwood":["Plaza Midwood","NC"],"south-end":["South End","NC"],"southpark":["SouthPark","NC"],"ballantyne":["Ballantyne","NC"],"steele-creek":["Steele Creek","NC"],"university-city":["University City","NC"],"huntersville":["Huntersville","NC"],"matthews":["Matthews","NC"],"concord":["Concord","NC"],"gastonia":["Gastonia","NC"],"mooresville":["Mooresville","NC"],"fort-mill":["Fort Mill","SC"],"raleigh":["Raleigh","NC"],"brier-creek":["Brier Creek","NC"],"cameron-village":["Cameron Village","NC"],"five-points":["Five Points","NC"],"glenwood-south":["Glenwood South","NC"],"midtown":["Midtown","NC"],"north-hills":["North Hills","NC"],"north-raleigh":["North Raleigh","NC"],"wakefield":["Wakefield","NC"],"cary":["Cary","NC"],"durham":["Durham","NC"],"garner":["Garner","NC"],"wake-forest":["Wake Forest","NC"],"rolesville":["Rolesville","NC"],"clayton":["Clayton","NC"],"knightdale":["Knightdale","NC"],"apex":["Apex","NC"],"holly-springs":["Holly Springs","NC"],"fuquay-varina":["Fuquay-Varina","NC"],"morrisville":["Morrisville","NC"],"chapel-hill":["Chapel Hill","NC"],"carrboro":["Carrboro","NC"],"hillsborough":["Hillsborough","NC"],"smithfield":["Smithfield","NC"],"greensboro":["Greensboro","NC"],"adams-farm":["Adams Farm","NC"],"fisher-park":["Fisher Park","NC"],"friendly-hills":["Friendly Hills","NC"],"hamilton-lakes":["Hamilton Lakes","NC"],"irving-park":["Irving Park","NC"],"high-point":["High Point","NC"],"jamestown":["Jamestown","NC"],"summerfield":["Summerfield","NC"],"oak-ridge":["Oak Ridge","NC"],"pleasant-garden":["Pleasant Garden","NC"],"mcleansville":["McLeansville","NC"],"gibsonville":["Gibsonville","NC"],"winston-salem":["Winston-Salem","NC"],"kernersville":["Kernersville","NC"],"clemmons":["Clemmons","NC"],"lewisville":["Lewisville","NC"],"walkertown":["Walkertown","NC"],"burlington":["Burlington","NC"],"graham":["Graham","NC"],"elon":["Elon","NC"],"mebane":["Mebane","NC"],"asheboro":["Asheboro","NC"],"archdale":["Archdale","NC"],"randleman":["Randleman","NC"],"reidsville":["Reidsville","NC"],"eden":["Eden","NC"],"lexington":["Lexington","NC"],"thomasville":["Thomasville","NC"],"stokesdale":["Stokesdale","NC"]}; /* slug -> display name, every place the market pages list */
  var SVCS = {
    'junk-removal':'Junk Removal','furniture-removal':'Furniture Removal','appliance-removal':'Appliance Removal',
    'mattress-removal':'Mattress Removal','refrigerator-removal':'Refrigerator Removal','junk-hauling':'Junk Hauling'
  };
  var q = new URLSearchParams(location.search);
  var body = document.body;

  /* 1) Message match. The ad's final URL can pass ?city= (all pages) and ?svc= (home page only).
        Only whitelisted values ever reach the page, so nothing typed into a URL can print arbitrary text. */
  (function(){
    var T = TOWNS[(q.get('city')||'').toLowerCase()]; var city = T ? T[0] : null, cst = T ? T[1] : null;
    /* KEEP THIS GUARD. Demo pages are in-state only while SC contractor rules are unresolved (Richard 9/29). Out of state
       places (Fort Mill, SC) are still in the shared data-xy lookup, so without this line they'd render as a labeled pin
       on a demolition map. */
    if (T && body.dataset.demo && cst !== body.dataset.state) { city = null; cst = null; }
    var svc = body.dataset.allowSvc ? SVCS[(q.get('svc')||'').toLowerCase()] : null;
    var h = document.getElementById('headline'), loc = document.getElementById('locText');
    var base = body.dataset.service; /* e.g. "Hot Tub Removal" */
    var name = svc || base;
    if (city) {
      h.textContent = name + ' in ' + city + (cst !== body.dataset.state ? ', ' + cst : '');  /* Lee 9/30: plain service + place */
      document.querySelectorAll('[data-town="'+city+'"]').forEach(function(el){ var m = document.createElement('mark'); m.textContent = el.textContent; el.textContent = ''; el.appendChild(m); });
      var yes = document.getElementById('areaYes'), yt = document.getElementById('areaYesText');
      if (yes) yes.textContent = 'Yes, we serve ' + city + '.';
      var map = document.querySelector('.area-map'), pin = document.getElementById('cityPin');
      if (map && pin) { try { var P = JSON.parse(map.getAttribute('data-xy'))[city];
        if (P) { pin.setAttribute('transform', 'translate(' + P[0] + ',' + P[1] + ')'); document.getElementById('cityPinLabel').textContent = city; pin.removeAttribute('hidden'); map.classList.add('has-city'); } } catch(e){} }
      if (yt) yt.textContent = body.dataset.demo ? 'Call and we\'ll set up an on-site quote.' : body.dataset.pace ? 'Call and we\'ll set up an on-site walkthrough.' : 'Call and we\'ll get you on the schedule. Same-day is often available.';
    } else if (svc) {
      h.textContent = svc + ' in ' + body.dataset.city;
    }
    if (city || svc) document.title = h.textContent + " | Junk Doctors";
  })();

  /* 2) Availability line: true statements from JD's published hours, in Eastern time. */
  (function(){
    var el = document.getElementById('availText'); if (!el || body.dataset.demo || body.dataset.pace) return; /* demo: always an on-site quote first; pace pages (hoarding, estate): no same-day push (Alston 9/30) */
    var hr, day; try {
      hr = parseInt(new Intl.DateTimeFormat('en-US',{hour:'numeric',hourCycle:'h23',timeZone:CFG.tz}).format(new Date()),10);
      day = new Intl.DateTimeFormat('en-US',{weekday:'short',timeZone:CFG.tz}).format(new Date());
    } catch(e){ return; }
    /* No 24/7 claim until the afternoon missed-call fix is measured (Alston 9/29). */
    if (day !== 'Sun' && hr < CFG.sameDayCutoff) el.textContent = 'Call before 3pm and same-day is often possible.';
    else if (day === 'Sun') el.textContent = 'Call now to get on the schedule. Crews run Monday to Saturday.';
    else el.textContent = 'Call now to get on the schedule.';
  })();

  /* 3) Keep the Google Ads click id on the root domain (main site + CallRail can read it) and carry it onto the booking link. */
  (function(){
    var keys = ['gclid','gbraid','wbraid','utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
    var host = location.hostname.split('.').slice(-2).join('.');
    var isReal = /(^|\.)junkdrs\.com$/.test(location.hostname);
    var pass = new URLSearchParams();
    keys.forEach(function(k){
      var v = q.get(k);
      if (!v) { var m = document.cookie.match(new RegExp('(?:^|; )jdlp_'+k+'=([^;]*)')); if (m) v = decodeURIComponent(m[1]); }
      else { try { document.cookie = 'jdlp_'+k+'='+encodeURIComponent(v)+';path=/;max-age=7776000;SameSite=Lax' + (isReal ? ';domain=.'+host : ''); } catch(e){} }
      if (v) pass.set(k, v);
    });
    if ([].concat(Array.from(pass.keys())).length) document.querySelectorAll('.book-link').forEach(function(a){ var u = new URL(a.href); pass.forEach(function(v,k){ u.searchParams.set(k,v); }); a.href = u.toString(); });
  })();

  /* 4) Click events for GTM / Google Ads. Calls are the main conversion; CallRail counts the real calls. */
  document.addEventListener('click', function(e){
    var a = e.target.closest('[data-cta]'); if (!a) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({event: a.classList.contains('phone-link') ? 'lp_call_click' : 'lp_book_click', cta: a.getAttribute('data-cta'), lp_page: body.dataset.page});
  });

  /* 5) Privacy choices. Lee 9/29: no banner by default (the notice only has to show where a state requires it,
        and a static page cannot tell the visitor's state). GPC is still honored before GTM loads, and the
        footer "Privacy choices" link opens the same equal-weight opt out at any time. */
  (function(){
    var box = document.getElementById('privacy'); if (!box) return;
    function done(optOut){ try { localStorage.setItem('jd_privacy_seen','1'); if (optOut) localStorage.setItem('jd_privacy_optout','1'); } catch(e){} box.classList.remove('show'); if (optOut) location.reload(); }
    document.getElementById('pOk').onclick = function(){ done(false); };
    document.getElementById('pNo').onclick = function(){ done(true); };
    document.getElementById('privacyChoices').onclick = function(e){ e.preventDefault(); box.classList.add('show'); };
  })();


  /* 7) Sticky call bar (phones): shows only after the hero buttons have scrolled away, and hides again while the
        final call section is on screen, so two sets of call buttons are never in view at once (Lee 9/29). */
  (function(){
    var bar = document.querySelector('.sticky'), hero = document.querySelector('.hero .cta-row'), fin = document.querySelector('.final');
    if (!bar) return;
    if (!hero) { bar.classList.add('show'); return; }
    function upd(){
      var past = hero.getBoundingClientRect().bottom < 0, finVis = false;
      if (fin) { var f = fin.getBoundingClientRect(); finVis = f.top < window.innerHeight && f.bottom > 0; }
      bar.classList.toggle('show', past && !finVis);
    }
    window.addEventListener('scroll', upd, {passive: true});
    window.addEventListener('resize', upd);
    upd();
  })();

  /* 6) Live Google reviews (Places API New, via Maps JS). Loads after the page is interactive so it never
        slows the first paint. Until a key and Place ID are set, the page shows the static fallback. */
  function stars(n){ var s=''; for (var i=0;i<5;i++) s += i < Math.round(n) ? '★' : '☆'; return s; }
  function loadMaps(key){
    return new Promise(function(res, rej){
      window.__jdMapsReady = res;
      var s = document.createElement('script');
      s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(key) + '&loading=async&v=weekly&callback=__jdMapsReady';
      s.async = true; s.onerror = rej; document.head.appendChild(s);
    });
  }
  function liveReviews(){
    if (!CFG.placesKey || !CFG.placeId) return;
    loadMaps(CFG.placesKey).then(function(){ return google.maps.importLibrary('places'); }).then(function(lib){
      var place = new lib.Place({id: CFG.placeId});
      return place.fetchFields({fields:['rating','userRatingCount','reviews','googleMapsURI']}).then(function(){ return place; });
    }).then(function(place){
      if (!place.rating) return;
      var r = place.rating.toFixed(1), n = place.userRatingCount;
      document.querySelectorAll('[data-rating]').forEach(function(el){ el.textContent = r; });
      document.querySelectorAll('[data-count]').forEach(function(el){ el.textContent = n; });
      document.querySelectorAll('[data-maps]').forEach(function(a){ a.href = place.googleMapsURI; });
      var list = (place.reviews||[]).filter(function(v){ return v.text; });
      var box = document.getElementById('reviewList'); if (!box || !list.length) return;
      box.innerHTML = ''; box.classList.add('live');
      list.forEach(function(v){
        var q = document.createElement('blockquote');
        var st = document.createElement('span'); st.className='stars'; st.textContent = stars(v.rating||5); q.appendChild(st);
        var p = document.createElement('p'); p.textContent = v.text; q.appendChild(p);
        var c = document.createElement('cite');
        var au = v.authorAttribution || {};
        if (au.photoURI) { var im = document.createElement('img'); im.src = au.photoURI; im.alt=''; im.loading='lazy'; im.referrerPolicy='no-referrer'; c.appendChild(im); }
        var a = document.createElement('a'); a.href = au.uri || place.googleMapsURI; a.target='_blank'; a.rel='noopener nofollow'; a.textContent = au.displayName || 'Google user'; c.appendChild(a);
        if (v.relativePublishTimeDescription) c.appendChild(document.createTextNode(' · ' + v.relativePublishTimeDescription));
        q.appendChild(c); box.appendChild(q);
      });
      var pw = document.getElementById('poweredBy'); if (pw) pw.hidden = false;
    }).catch(function(){ /* keep the static fallback */ });
  }
  function idle(fn){ ('requestIdleCallback' in window) ? requestIdleCallback(fn,{timeout:2500}) : setTimeout(fn,1200); }
  if (document.readyState === 'complete') idle(liveReviews); else window.addEventListener('load', function(){ idle(liveReviews); });
})();

/* JD STYLE=real additions (10/3). Appended after lp.src.js only in the real build, so the current build's lp.js stays byte
   for byte the same. lp.js above has already run its message match; this puts the place in the eyebrow (Chris 10/2)
   and keeps the H1 on the service: ?city=cary shows "Cary, NC" above the H1, ?svc=furniture-removal on a metro home
   shows "Furniture Removal" as the H1. Same whitelists as lp.js, so nothing typed into a URL can print. */
(function(){
  'use strict';
  var TOWNS = {"charlotte":["Charlotte","NC"],"cotswold":["Cotswold","NC"],"dilworth":["Dilworth","NC"],"eastover":["Eastover","NC"],"myers-park":["Myers Park","NC"],"noda":["NoDa","NC"],"plaza-midwood":["Plaza Midwood","NC"],"south-end":["South End","NC"],"southpark":["SouthPark","NC"],"ballantyne":["Ballantyne","NC"],"steele-creek":["Steele Creek","NC"],"university-city":["University City","NC"],"huntersville":["Huntersville","NC"],"matthews":["Matthews","NC"],"concord":["Concord","NC"],"gastonia":["Gastonia","NC"],"mooresville":["Mooresville","NC"],"fort-mill":["Fort Mill","SC"],"raleigh":["Raleigh","NC"],"brier-creek":["Brier Creek","NC"],"cameron-village":["Cameron Village","NC"],"five-points":["Five Points","NC"],"glenwood-south":["Glenwood South","NC"],"midtown":["Midtown","NC"],"north-hills":["North Hills","NC"],"north-raleigh":["North Raleigh","NC"],"wakefield":["Wakefield","NC"],"cary":["Cary","NC"],"durham":["Durham","NC"],"garner":["Garner","NC"],"wake-forest":["Wake Forest","NC"],"rolesville":["Rolesville","NC"],"clayton":["Clayton","NC"],"knightdale":["Knightdale","NC"],"apex":["Apex","NC"],"holly-springs":["Holly Springs","NC"],"fuquay-varina":["Fuquay-Varina","NC"],"morrisville":["Morrisville","NC"],"chapel-hill":["Chapel Hill","NC"],"carrboro":["Carrboro","NC"],"hillsborough":["Hillsborough","NC"],"smithfield":["Smithfield","NC"],"greensboro":["Greensboro","NC"],"adams-farm":["Adams Farm","NC"],"fisher-park":["Fisher Park","NC"],"friendly-hills":["Friendly Hills","NC"],"hamilton-lakes":["Hamilton Lakes","NC"],"irving-park":["Irving Park","NC"],"high-point":["High Point","NC"],"jamestown":["Jamestown","NC"],"summerfield":["Summerfield","NC"],"oak-ridge":["Oak Ridge","NC"],"pleasant-garden":["Pleasant Garden","NC"],"mcleansville":["McLeansville","NC"],"gibsonville":["Gibsonville","NC"],"winston-salem":["Winston-Salem","NC"],"kernersville":["Kernersville","NC"],"clemmons":["Clemmons","NC"],"lewisville":["Lewisville","NC"],"walkertown":["Walkertown","NC"],"burlington":["Burlington","NC"],"graham":["Graham","NC"],"elon":["Elon","NC"],"mebane":["Mebane","NC"],"asheboro":["Asheboro","NC"],"archdale":["Archdale","NC"],"randleman":["Randleman","NC"],"reidsville":["Reidsville","NC"],"eden":["Eden","NC"],"lexington":["Lexington","NC"],"thomasville":["Thomasville","NC"],"stokesdale":["Stokesdale","NC"]};
  var SVCS = {
    'junk-removal':'Junk Removal','furniture-removal':'Furniture Removal','appliance-removal':'Appliance Removal',
    'mattress-removal':'Mattress Removal','refrigerator-removal':'Refrigerator Removal','junk-hauling':'Junk Hauling'
  };
  var body = document.body, q = new URLSearchParams(location.search);
  var eb = document.getElementById('heroPlace'), h = document.getElementById('headline');
  if (eb && h) {
    var T = TOWNS[(q.get('city')||'').toLowerCase()], city = T ? T[0] : null, st = T ? T[1] : null;
    /* KEEP THIS GUARD (same as lp.js): demolition pages are in state only (Richard 9/29). */
    if (T && body.dataset.demo && st !== body.dataset.state) { city = null; st = null; }
    var svc = body.dataset.allowSvc ? SVCS[(q.get('svc')||'').toLowerCase()] : null;
    h.textContent = svc || h.getAttribute('data-h1');
    if (city) eb.textContent = city + ', ' + st;
    if (city || svc) document.title = (svc || body.dataset.service) + ' in ' + (city || body.dataset.city) + ', ' + (st || body.dataset.state) + ' | Junk Doctors';
  }
  /* Home service cards and specialty tiles: their own event, so they never count as a booking or a call click. */
  document.addEventListener('click', function(e){
    var a = e.target.closest('[data-svc-cta]'); if (!a) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({event: 'lp_service_click', service: a.getAttribute('data-service'), cta: a.getAttribute('data-svc-cta'), lp_page: body.dataset.page});
  });
})();
