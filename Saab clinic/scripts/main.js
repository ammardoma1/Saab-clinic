(function(){
  // main UI enhancements: preloader, parallax cards, smooth anchors, language persistence
  function onLoad(){
    // preloader
    const pre = document.getElementById('preloader');
    if(pre){
      pre.classList.add('loaded');
      setTimeout(()=>{ try{ pre.remove() }catch(e){} },600);
    }

    // language persistence: if user previously chose a language, apply it
    try{
      const stored = localStorage.getItem('saab_lang');
      if(stored && document.documentElement.lang !== stored){
        // call existing switchLang() until matches (toggle)
        if(typeof switchLang === 'function'){
          // if there are only two languages, one toggle will switch
          switchLang();
          // if still not correct, toggle again
          if(document.documentElement.lang !== stored) switchLang();
        }
      }
    }catch(e){}

    // smooth-scroll for internal anchors
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', e=>{
        const href = a.getAttribute('href');
        const el = document.querySelector(href);
        if(el){
          e.preventDefault();
          el.scrollIntoView({behavior:'smooth',block:'center'});
        }
      })
    })

    // small parallax for card-bubbles
    const list = document.querySelector('.card-list');
    if(list){
      const bubbles = Array.from(list.querySelectorAll('.card-bubble'));
      list.addEventListener('pointermove', e=>{
        const rect = list.getBoundingClientRect();
        const cx = rect.left + rect.width/2;
        const cy = rect.top + rect.height/2;
        const mx = e.clientX - cx;
        const my = e.clientY - cy;
        bubbles.forEach((b, i)=>{
          const depth = 0.03 + (i * 0.01);
          const tx = mx * depth;
          const ty = my * depth * -1;
          b.style.transform = `translate3d(${tx}px, ${ty - 18}px, 0) scale(${1 + depth/6})`;
        })
      })
      // reset on leave
      list.addEventListener('pointerleave', ()=>{
        bubbles.forEach(b=> b.style.transform = '')
      })
    }

    // mobile nav toggle: hamburger opens/closes the .top-nav dropdown
    const navToggle = document.querySelector('.nav-toggle');
    const topNav = document.getElementById('topNav');
    if(navToggle && topNav){
      // ensure correct initial state depending on viewport width
      if(window.innerWidth > 820){ topNav.classList.remove('collapsed'); topNav.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); } else { topNav.classList.add('collapsed'); }

      navToggle.addEventListener('click', ()=>{
        const open = topNav.classList.toggle('open');
        if(open){
          topNav.classList.remove('collapsed');
          navToggle.setAttribute('aria-expanded','true');
          topNav.setAttribute('aria-expanded','true');
          navToggle.setAttribute('aria-label','Close menu');
        } else {
          topNav.classList.add('collapsed');
          navToggle.setAttribute('aria-expanded','false');
          topNav.setAttribute('aria-expanded','false');
          navToggle.setAttribute('aria-label','Open menu');
        }
      });

      // close menu on link click (mobile)
      topNav.querySelectorAll('a[href^="#"]').forEach(a=>{
        a.addEventListener('click', ()=>{
          if(topNav.classList.contains('open')){
            topNav.classList.remove('open');
            topNav.classList.add('collapsed');
            navToggle.setAttribute('aria-expanded','false');
            navToggle.setAttribute('aria-label','Open menu');
          }
        })
      });

      // ensure nav resets when switching to large view
      window.addEventListener('resize', ()=>{
        if(window.innerWidth > 820){
          topNav.classList.remove('open');
          topNav.classList.remove('collapsed');
          navToggle.setAttribute('aria-expanded','false');
          topNav.setAttribute('aria-expanded','false');
        } else {
          if(!topNav.classList.contains('open')) topNav.classList.add('collapsed');
        }
      });
    }

    // remember language when user toggles
    const btn = document.querySelector('.lang-switch');
    if(btn){
      btn.addEventListener('click', ()=>{
        setTimeout(()=>{
          try{ localStorage.setItem('saab_lang', document.documentElement.lang) }catch(e){}
        },200);
      })
    }

    // light animation for floating icons
    document.querySelectorAll('.icon').forEach((ic, idx)=>{
      // staggered start
      setTimeout(()=> ic.classList.add('animate'), 400 + (idx*120));
    })

    // contact form handling (client-side only)
    function handleForm(form, resultEl){
      if(!form) return;
      const submit = form.querySelector('[type="submit"]');
      form.addEventListener('submit', e=>{
        e.preventDefault();
        const data = new FormData(form);
        const name = data.get('name')?.trim();
        const email = data.get('email')?.trim();
        const message = data.get('message')?.trim();
        if(!name || !email || !message){
          if(resultEl){ resultEl.style.display='block'; resultEl.className = 'form-error'; resultEl.textContent = 'Please fill all fields.' }
          return;
        }
        // disable submit
        if(submit) { submit.disabled = true; submit.setAttribute('aria-busy','true') }
        if(resultEl){ resultEl.style.display='block'; resultEl.className = ''; resultEl.textContent = 'Sending…' }
        // simulate network request
        setTimeout(()=>{
          // success
          if(resultEl){ resultEl.className = 'form-success'; resultEl.textContent = 'Message sent — we will contact you shortly.' }
          form.reset();
          if(submit) { submit.disabled = false; submit.removeAttribute('aria-busy') }
        },900 + Math.random()*600);
      })
    }

    handleForm(document.getElementById('contactForm'), document.getElementById('contactResult'));
    handleForm(document.getElementById('contactFormEn'), document.getElementById('contactResultEn'));

    // Carousel controls: prev/next and keyboard
    (function setupCarousel(){
      const carousel = document.querySelector('.card-carousel');
      if(!carousel) return;
      const prev = carousel.querySelector('.carousel-btn.prev');
      const next = carousel.querySelector('.carousel-btn.next');
      const track = carousel.querySelector('.card-track .card-list');
      if(!track) return;
      const itemGap = 18; // matches CSS gap

      function computeStep(){
        const item = track.querySelector('.card-bubble');
        if(item && item.offsetWidth > 20){
          return item.offsetWidth + itemGap;
        }
        // fallback to sensible fraction
        return Math.max(160, Math.round(track.clientWidth * 0.6));
      }

      function scrollByAmount(amount){
        // recompute for responsive correctness
        const amt = Math.round(amount);
        if('scrollBy' in track){
          track.scrollBy({left: amt, behavior: 'smooth'});
        } else {
          track.scrollLeft += amt;
        }
      }

      if(prev) prev.addEventListener('click', ()=> scrollByAmount(-computeStep()));
      if(next) next.addEventListener('click', ()=> scrollByAmount(computeStep()));

      // keyboard support when focus inside
      carousel.addEventListener('keydown', (e)=>{
        if(e.key === 'ArrowLeft') { e.preventDefault(); scrollByAmount(-computeStep()) }
        if(e.key === 'ArrowRight') { e.preventDefault(); scrollByAmount(computeStep()) }
      });

      // show/hide controls based on overflow
      function updateControls(){
        const hasOverflow = track.scrollWidth > track.clientWidth + 8;
        if(prev){ prev.style.display = hasOverflow ? 'flex' : 'none'; prev.setAttribute('aria-hidden', String(!hasOverflow)); prev.disabled = !hasOverflow }
        if(next){ next.style.display = hasOverflow ? 'flex' : 'none'; next.setAttribute('aria-hidden', String(!hasOverflow)); next.disabled = !hasOverflow }
      }
      updateControls();
      window.addEventListener('resize', updateControls);
      // also update after images load to ensure measurements are correct
      const imgs = track.querySelectorAll('img');
      let loadedCount = 0;
      imgs.forEach(img=>{
        if(img.complete) { loadedCount++; return }
        img.addEventListener('load', ()=>{ loadedCount++; if(loadedCount === imgs.length) updateControls() })
        img.addEventListener('error', ()=>{ loadedCount++; if(loadedCount === imgs.length) updateControls() })
      });
    })();

    // Sticky header on scroll
    (function stickyHeader(){
      const header = document.querySelector('header.card');
      if(!header) return;
      const threshold = 40;
      function onScroll(){
        if(window.scrollY > threshold){
          header.classList.add('sticky');
          document.body.classList.add('has-sticky-padding');
        } else {
          header.classList.remove('sticky');
          document.body.classList.remove('has-sticky-padding');
        }
      }
      onScroll();
      window.addEventListener('scroll', onScroll, {passive:true});
    })();

    // Nav highlight on scroll
    (function navHighlight(){
      const nav = document.querySelector('.top-nav');
      if(!nav) return;
      const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
      const sections = links.map(a=> document.querySelector(a.getAttribute('href'))).filter(Boolean);
      if(sections.length===0) return;
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            const id = entry.target.id;
            links.forEach(a=> a.classList.toggle('active', a.getAttribute('href') === '#'+id));
          }
        })
      }, {threshold:0.45});
      sections.forEach(s=> io.observe(s));
    })();

    // social links: open in new tab and add rel for security
    (function socialLinks(){
      const social = document.querySelectorAll('.social-links a');
      social.forEach(a=>{
        // leave anchors with href '#' untouched
        try{
          if(!a.getAttribute('href') || a.getAttribute('href').trim() === '#') return;
          a.setAttribute('target','_blank');
          a.setAttribute('rel','noopener noreferrer');
        }catch(e){}
      })
    })();

    // Back-to-top button behavior
    (function backToTop(){
      const btn = document.getElementById('backToTop');
      if(!btn) return;
      const showAt = 320;
      function update(){
        if(window.scrollY > showAt) btn.classList.add('show'); else btn.classList.remove('show');
      }
      update();
      window.addEventListener('scroll', update, {passive:true});
      btn.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));
      // keyboard activation (Enter / Space)
      btn.addEventListener('keydown', (e)=>{
        if(e.key === 'Enter' || e.key === ' ' || e.code === 'Space'){
          e.preventDefault();
          btn.click();
        }
      });
    })();
  }

  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    setTimeout(onLoad, 60);
  } else {
    document.addEventListener('DOMContentLoaded', onLoad);
    window.addEventListener('load', onLoad);
  }
})();

