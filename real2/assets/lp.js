/* TJ's PPC mini-site behavior. Built into /assets/lp.js by build.py (town list injected). */
(function(){
  'use strict';
  var CFG = {
    /* Live Google reviews. Fill both to switch the reviews block and the hero rating to live data.
       Key: a Maps JavaScript API key restricted by HTTP referrer to lp.tjscleanoutservices.com/*
       and restricted by API to "Maps JavaScript API" + "Places API (New)". Place ID: TJ's GBP listing. */
    placesKey: '',
    placeId: '',
    tz: 'America/New_York',
    phonesOpen: 7, phonesClose: 22,   /* phones answered 7am to 10pm, 7 days (TJ's site) */
    sameDayCutoff: 15                 /* "book before 3pm and same-day is often possible" (TJ's FAQ) */
  };
  var TOWNS = {"avon":"Avon","berlin":"Berlin","bloomfield":"Bloomfield","bristol":"Bristol","burlington":"Burlington","canton":"Canton","east-granby":"East Granby","east-hartford":"East Hartford","east-windsor":"East Windsor","enfield":"Enfield","farmington":"Farmington","glastonbury":"Glastonbury","granby":"Granby","hartford":"Hartford","hartland":"Hartland","manchester":"Manchester","marlborough":"Marlborough","new-britain":"New Britain","newington":"Newington","plainville":"Plainville","rocky-hill":"Rocky Hill","simsbury":"Simsbury","south-windsor":"South Windsor","southington":"Southington","suffield":"Suffield","west-hartford":"West Hartford","wethersfield":"Wethersfield","windsor":"Windsor","windsor-locks":"Windsor Locks","andover":"Andover","bolton":"Bolton","columbia":"Columbia","coventry":"Coventry","ellington":"Ellington","hebron":"Hebron","mansfield":"Mansfield","somers":"Somers","stafford":"Stafford","tolland":"Tolland","union":"Union","vernon":"Vernon","willington":"Willington","chester":"Chester","clinton":"Clinton","cromwell":"Cromwell","deep-river":"Deep River","durham":"Durham","east-haddam":"East Haddam","east-hampton":"East Hampton","essex":"Essex","haddam":"Haddam","killingworth":"Killingworth","middlefield":"Middlefield","middletown":"Middletown","old-saybrook":"Old Saybrook","portland":"Portland","westbrook":"Westbrook","bozrah":"Bozrah","colchester":"Colchester","east-lyme":"East Lyme","franklin":"Franklin","griswold":"Griswold","groton":"Groton","lebanon":"Lebanon","ledyard":"Ledyard","lisbon":"Lisbon","lyme":"Lyme","montville":"Montville","new-london":"New London","north-stonington":"North Stonington","norwich":"Norwich","old-lyme":"Old Lyme","preston":"Preston","salem":"Salem","sprague":"Sprague","stonington":"Stonington","voluntown":"Voluntown","waterford":"Waterford"}; /* slug -> display name, every town in the four counties */
  var COUNTY = {"Avon":"Hartford","Berlin":"Hartford","Bloomfield":"Hartford","Bristol":"Hartford","Burlington":"Hartford","Canton":"Hartford","East Granby":"Hartford","East Hartford":"Hartford","East Windsor":"Hartford","Enfield":"Hartford","Farmington":"Hartford","Glastonbury":"Hartford","Granby":"Hartford","Hartford":"Hartford","Hartland":"Hartford","Manchester":"Hartford","Marlborough":"Hartford","New Britain":"Hartford","Newington":"Hartford","Plainville":"Hartford","Rocky Hill":"Hartford","Simsbury":"Hartford","South Windsor":"Hartford","Southington":"Hartford","Suffield":"Hartford","West Hartford":"Hartford","Wethersfield":"Hartford","Windsor":"Hartford","Windsor Locks":"Hartford","Andover":"Tolland","Bolton":"Tolland","Columbia":"Tolland","Coventry":"Tolland","Ellington":"Tolland","Hebron":"Tolland","Mansfield":"Tolland","Somers":"Tolland","Stafford":"Tolland","Tolland":"Tolland","Union":"Tolland","Vernon":"Tolland","Willington":"Tolland","Chester":"Middlesex","Clinton":"Middlesex","Cromwell":"Middlesex","Deep River":"Middlesex","Durham":"Middlesex","East Haddam":"Middlesex","East Hampton":"Middlesex","Essex":"Middlesex","Haddam":"Middlesex","Killingworth":"Middlesex","Middlefield":"Middlesex","Middletown":"Middlesex","Old Saybrook":"Middlesex","Portland":"Middlesex","Westbrook":"Middlesex","Bozrah":"New London","Colchester":"New London","East Lyme":"New London","Franklin":"New London","Griswold":"New London","Groton":"New London","Lebanon":"New London","Ledyard":"New London","Lisbon":"New London","Lyme":"New London","Montville":"New London","New London":"New London","North Stonington":"New London","Norwich":"New London","Old Lyme":"New London","Preston":"New London","Salem":"New London","Sprague":"New London","Stonington":"New London","Voluntown":"New London","Waterford":"New London"}; /* display name -> county, for the hero "Serving <Town> and all of <County> County" line */
  var SVCS = {
    'junk-removal':'Junk Removal','furniture-removal':'Furniture Removal','appliance-removal':'Appliance Removal',
    'mattress-removal':'Mattress Removal','refrigerator-removal':'Refrigerator Removal','junk-hauling':'Junk Hauling'
  };
  var q = new URLSearchParams(location.search);
  var body = document.body;

  /* 1) Message match. The ad's final URL can pass ?city= (all pages) and ?svc= (home page only).
        Only whitelisted values ever reach the page, so nothing typed into a URL can print arbitrary text. */
  (function(){
    var city = TOWNS[(q.get('city')||'').toLowerCase()];
    var svc = body.dataset.allowSvc ? SVCS[(q.get('svc')||'').toLowerCase()] : null;
    var h = document.getElementById('headline'), loc = document.getElementById('locText');
    var base = body.dataset.service; /* e.g. "Hot Tub Removal" */
    var name = svc || base;
    var eyebrow = document.getElementById('heroPlace'); /* STYLE=chris only: the place sits in an eyebrow above the H1 */
    if (eyebrow) {
      if (city) eyebrow.textContent = city + ', CT';
      if (svc) h.textContent = svc;
    } else if (city || svc) {
      h.textContent = name + ' in ' + (city || body.dataset.place);  /* Lee 9/30: plain service + place */
    }
    var serving = document.getElementById('heroServing');
    if (city && serving && COUNTY[city]) serving.textContent = 'Serving ' + city + ' and all of ' + COUNTY[city] + ' County';
    if (city) {
      document.querySelectorAll('[data-town="'+city+'"]').forEach(function(el){ var m = document.createElement('mark'); m.textContent = city; el.replaceWith(m); });
      var yes = document.getElementById('areaYes'), yt = document.getElementById('areaYesText');
      if (yes) yes.textContent = 'Yes, we serve ' + city + '.';
      var map = document.querySelector('.area-map'), pin = document.getElementById('cityPin');
      if (map && pin) { try { var P = JSON.parse(map.getAttribute('data-xy'))[city];
        if (P) { pin.setAttribute('transform', 'translate(' + P[0] + ',' + P[1] + ')'); document.getElementById('cityPinLabel').textContent = city; pin.removeAttribute('hidden'); map.classList.add('has-city'); } } catch(e){} }
      /* same-day only where the page itself makes that claim (data-same-day, set by build.py) */
      if (yt) yt.textContent = 'Call and we\'ll get you on the schedule.' + (body.dataset.sameDay ? ' Same-day is often available.' : '');
    }
    if (city || svc) document.title = name + ' in ' + (city || body.dataset.place) + " | TJ's Cleanout Services";
  })();

  /* 2) Availability line: true statements computed from TJ's published phone hours, in Eastern time. */
  (function(){
    var el = document.getElementById('availText'); if (!el) return;
    var hr; try { hr = parseInt(new Intl.DateTimeFormat('en-US',{hour:'numeric',hourCycle:'h23',timeZone:CFG.tz}).format(new Date()),10); } catch(e){ return; }
    if (hr >= CFG.phonesOpen && hr < CFG.sameDayCutoff) el.textContent = 'Phones open now. Call before 3pm and same-day is often possible.';
    else if (hr >= CFG.sameDayCutoff && hr < CFG.phonesClose) el.textContent = 'Phones open now until 10pm. Call to get on the schedule.';
    else el.textContent = 'Phones open at 7am, 7 days a week. You can book online right now.';
  })();

  /* 3) Keep the Google Ads click id on the root domain (main site + CallRail can read it) and carry it onto the booking link. */
  (function(){
    var keys = ['gclid','gbraid','wbraid','utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
    var host = location.hostname.split('.').slice(-2).join('.');
    var isReal = /(^|\.)tjscleanoutservices\.com$/.test(location.hostname);
    var pass = new URLSearchParams();
    keys.forEach(function(k){
      var v = q.get(k);
      if (!v) { var m = document.cookie.match(new RegExp('(?:^|; )tjs_'+k+'=([^;]*)')); if (m) v = decodeURIComponent(m[1]); }
      else { try { document.cookie = 'tjs_'+k+'='+encodeURIComponent(v)+';path=/;max-age=7776000;SameSite=Lax' + (isReal ? ';domain=.'+host : ''); } catch(e){} }
      if (v) pass.set(k, v);
    });
    if ([].concat(Array.from(pass.keys())).length) document.querySelectorAll('.book-link').forEach(function(a){ var u = new URL(a.href); pass.forEach(function(v,k){ u.searchParams.set(k,v); }); a.href = u.toString(); });
  })();

  /* 4) Click events for GTM / Google Ads. Calls are the main conversion; CallRail counts the real calls. */
  document.addEventListener('click', function(e){
    var a = e.target.closest('[data-cta]'); if (!a) return;
    window.dataLayer = window.dataLayer || [];
    /* Lee 10/2: home page service cards and specialty tiles */
    if (a.hasAttribute('data-service')) { window.dataLayer.push({event: 'lp_service_click', service: a.getAttribute('data-service'), cta: a.getAttribute('data-cta'), lp_page: body.dataset.page}); return; }
    window.dataLayer.push({event: a.classList.contains('phone-link') ? 'lp_call_click' : 'lp_book_click', cta: a.getAttribute('data-cta'), lp_page: body.dataset.page});
  });

  /* 5) Privacy choices. Lee 9/29: no banner by default (the notice only has to show where a state requires it,
        and a static page cannot tell the visitor's state). GPC is still honored before GTM loads, and the
        footer "Privacy choices" link opens the same equal-weight opt out at any time. */
  (function(){
    var box = document.getElementById('privacy'); if (!box) return;
    function done(optOut){ try { localStorage.setItem('tjs_privacy_seen','1'); if (optOut) localStorage.setItem('tjs_privacy_optout','1'); } catch(e){} box.classList.remove('show'); if (optOut) location.reload(); }
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
      window.__tjsMapsReady = res;
      var s = document.createElement('script');
      s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(key) + '&loading=async&v=weekly&callback=__tjsMapsReady';
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
