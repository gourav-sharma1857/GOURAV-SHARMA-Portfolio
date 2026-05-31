

(function () {
  'use strict';

  /* ── WAIT FOR DOM ── */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupCursor();
    setupConstellation();
    setupScrollProgress();
    setupLiquidBlob();
    setupFloatingOrbs();
    setupMagneticButtons();
    setupRippleButtons();
    setupTiltCards();
    setupStaggeredSkills();
    setupGlitchTitles();
    setupSplitLetters();
    setupExplosionClicks();
    setupKonamiCode();
    setupSectionCounters();
    setupHeroParticles();
  }

  /* ──────────────────────────────────────────
     1. CUSTOM CURSOR
  ──────────────────────────────────────────── */
  function setupCursor() {
    const dot  = document.createElement('div'); dot.id  = 'cursor-dot';
    const ring = document.createElement('div'); ring.id = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = -200, my = -200;
    let rx = -200, ry = -200;
    let raf;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    document.addEventListener('mouseleave', () => { mx = -200; my = -200; });

    function tick() {
      dot.style.left  = mx + 'px';
      dot.style.top   = my + 'px';
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      raf = requestAnimationFrame(tick);
    }
    tick();

    // Color shift on interactive elements
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => {
        dot.style.background  = '#7e42a7';
        dot.style.transform   = 'translate(-50%,-50%) scale(2)';
      });
      el.addEventListener('mouseleave', () => {
        dot.style.background  = '#44cbda';
        dot.style.transform   = 'translate(-50%,-50%) scale(1)';
      });
    });
  }

  /* ──────────────────────────────────────────
     2. CONSTELLATION CANVAS
  ──────────────────────────────────────────── */
  function setupConstellation() {
    const canvas = document.createElement('canvas');
    canvas.id = 'constellation-canvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');

    const STAR_COUNT = 120;
    const MAX_DIST   = 140;
    let   W, H, stars = [], mouse = { x: -9999, y: -9999 };

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); spawnStars(); });

    document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function spawnStars() {
      stars = Array.from({ length: STAR_COUNT }, () => ({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.25, 0.25), vy: rand(-0.25, 0.25),
        r: rand(0.8, 2.2),
        alpha: rand(0.4, 1),
        twinkle: rand(0.005, 0.02),
        phase: rand(0, Math.PI * 2),
        color: Math.random() > 0.7
          ? `hsl(${rand(190,220)},80%,80%)`
          : `hsl(${rand(260,290)},60%,80%)`
      }));
    }
    spawnStars();

    function drawFrame() {
      ctx.clearRect(0, 0, W, H);

      // Move stars, wrap edges
      stars.forEach(s => {
        s.x += s.vx; s.y += s.vy;
        s.phase += s.twinkle;
        if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
        if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;

        // Mouse repulsion
        const dx = s.x - mouse.x, dy = s.y - mouse.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 100) {
          s.x += (dx / d) * 1.5;
          s.y += (dy / d) * 1.5;
        }
      });

      // Draw connections
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx   = stars[i].x - stars[j].x;
          const dy   = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < MAX_DIST) {
            const opacity = (1 - dist / MAX_DIST) * 0.4;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(114,161,222,${opacity})`;
            ctx.lineWidth   = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw stars
      stars.forEach(s => {
        const a = s.alpha * (0.7 + 0.3 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color.replace(')', `,${a})`).replace('hsl', 'hsla');
        ctx.fill();
      });

      // Mouse "gravity well" glow
      const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120);
      mg.addColorStop(0, 'rgba(68,203,218,0.06)');
      mg.addColorStop(1, 'rgba(68,203,218,0)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(drawFrame);
    }
    drawFrame();
  }

  /* ──────────────────────────────────────────
     3. SCROLL PROGRESS BAR
  ──────────────────────────────────────────── */
  function setupScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
      bar.style.width = pct + '%';
    });
  }

  /* ──────────────────────────────────────────
     4. LIQUID BLOB (follows cursor slowly)
  ──────────────────────────────────────────── */
  function setupLiquidBlob() {
    const blob = document.createElement('div');
    blob.className = 'liquid-blob';
    document.body.appendChild(blob);

    let bx = window.innerWidth / 2, by = window.innerHeight / 2;

    document.addEventListener('mousemove', e => {
      bx = e.clientX - 250;
      by = e.clientY - 250;
    });

    setInterval(() => {
      blob.style.left = bx + 'px';
      blob.style.top  = by + 'px';
    }, 50);
  }

  /* ──────────────────────────────────────────
     5. FLOATING ORBS
  ──────────────────────────────────────────── */
  function setupFloatingOrbs() {
    [1, 2, 3].forEach(i => {
      const orb = document.createElement('div');
      orb.className = `orb orb-${i}`;
      document.body.appendChild(orb);
    });
  }

  /* ──────────────────────────────────────────
     6. MAGNETIC BUTTONS
  ──────────────────────────────────────────── */
  function setupMagneticButtons() {
    document.querySelectorAll('button, .resume-main-btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect   = btn.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) * 0.35;
        const dy     = (e.clientY - cy) * 0.35;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ──────────────────────────────────────────
     7. RIPPLE EFFECT on buttons
  ──────────────────────────────────────────── */
  function setupRippleButtons() {
    document.querySelectorAll('button').forEach(btn => {
      btn.classList.add('ripple-btn');
      btn.addEventListener('click', e => {
        const rect   = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(rect.width, rect.height) * 2;
        ripple.style.cssText = `
          width: ${size}px; height: ${size}px;
          left: ${e.clientX - rect.left - size/2}px;
          top:  ${e.clientY - rect.top  - size/2}px;
        `;
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
      });
    });
  }

  /* ──────────────────────────────────────────
     8. 3D TILT on skill cards
  ──────────────────────────────────────────── */
  function setupTiltCards() {
    document.querySelectorAll('.skill-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x    = (e.clientX - rect.left) / rect.width  - 0.5;
        const y    = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = `
          perspective(600px)
          rotateX(${-y * 18}deg)
          rotateY(${x * 18}deg)
          scale(1.05)
          translateZ(10px)
        `;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    // Lighter tilt on project cards
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x    = (e.clientX - rect.left) / rect.width  - 0.5;
        const y    = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = `
          perspective(1200px)
          rotateX(${-y * 5}deg)
          rotateY(${x * 5}deg)
          translateY(-8px)
        `;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ──────────────────────────────────────────
     9. STAGGERED SKILL CARD ENTRANCE
  ──────────────────────────────────────────── */
  function setupStaggeredSkills() {
    const grids = document.querySelectorAll('.skills-grid');
    const obs   = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    grids.forEach(g => obs.observe(g));
  }

  /* ──────────────────────────────────────────
     10. GLITCH TITLE EFFECT
  ──────────────────────────────────────────── */
  function setupGlitchTitles() {
    document.querySelectorAll('.section-title').forEach(el => {
      el.classList.add('glitch-title');
      el.setAttribute('data-text', el.textContent);
    });
  }

  /* ──────────────────────────────────────────
     11. SPLIT LETTERS FLOAT on hero name
  ──────────────────────────────────────────── */
  function setupSplitLetters() {
    const nameEl = document.querySelector('.hero-info h1 .gradient');
    if (!nameEl) return;
    const text = nameEl.textContent;
    nameEl.innerHTML = text.split('').map((ch, i) =>
      ch === ' '
        ? ' '
        : `<span class="split-letter" style="animation-delay:${i * 0.08}s">${ch}</span>`
    ).join('');
  }

  /* ──────────────────────────────────────────
     12. EXPLOSION PARTICLES on click
  ──────────────────────────────────────────── */
  function setupExplosionClicks() {
    const colors = ['#44cbda', '#7e42a7', '#2a46ff', '#72a1de', '#ff6b9d', '#ffd700'];

    document.addEventListener('click', e => {
      if (e.target.closest('a, button')) return; // don't cover link clicks
      burst(e.clientX, e.clientY, 6);
    });

    document.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', e => {
        burst(e.clientX, e.clientY, 12);
      });
    });

    function burst(cx, cy, count) {
      for (let i = 0; i < count; i++) {
        const p   = document.createElement('div');
        const ang = (Math.PI * 2 / count) * i + Math.random() * 0.5;
        const dist = 60 + Math.random() * 80;
        p.className = 'exp-particle';
        p.style.cssText = `
          left: ${cx}px; top: ${cy}px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          --tx: ${Math.cos(ang) * dist}px;
          --ty: ${Math.sin(ang) * dist - 40}px;
          --dur: ${0.5 + Math.random() * 0.4}s;
          width: ${4 + Math.random() * 5}px;
          height: ${4 + Math.random() * 5}px;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1000);
      }
    }
  }

  /* ──────────────────────────────────────────
     13. KONAMI CODE EASTER EGG
  ──────────────────────────────────────────── */
  function setupKonamiCode() {
    const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let pos = 0;
    document.addEventListener('keydown', e => {
      if (e.key === code[pos]) {
        pos++;
        if (pos === code.length) {
          pos = 0;
          triggerKonami();
        }
      } else {
        pos = 0;
      }
    });

    function triggerKonami() {
      const flash = document.createElement('div');
      flash.className = 'konami-flash';
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 700);

      // Rain of particles
      for (let i = 0; i < 80; i++) {
        setTimeout(() => {
          const p   = document.createElement('div');
          p.className = 'exp-particle';
          const colors = ['#44cbda','#7e42a7','#ffd700','#ff6b9d','#2a46ff'];
          p.style.cssText = `
            left: ${Math.random() * window.innerWidth}px;
            top: ${Math.random() * window.innerHeight}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            --tx: ${(Math.random() - 0.5) * 200}px;
            --ty: ${-100 - Math.random() * 200}px;
            --dur: ${0.8 + Math.random() * 0.6}s;
            width: ${6 + Math.random() * 8}px;
            height: ${6 + Math.random() * 8}px;
          `;
          document.body.appendChild(p);
          setTimeout(() => p.remove(), 1500);
        }, i * 15);
      }

      // Toast message
      const toast = document.createElement('div');
      toast.textContent = '🎮 CHEAT CODE ACTIVATED! You found the secret!';
      toast.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        background: linear-gradient(135deg, #7e42a7, #44cbda);
        color: white; padding: 14px 28px; border-radius: 50px;
        font-weight: 700; font-size: 16px; z-index: 9999999;
        box-shadow: 0 0 30px #44cbda; letter-spacing: 0.5px;
        animation: konamiToast 0.4s cubic-bezier(0.23,1,0.32,1);
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3500);
    }
  }

  /* ──────────────────────────────────────────
     14. ANIMATED COUNTERS on scroll into view
  ──────────────────────────────────────────── */
  function setupSectionCounters() {
    // Find LeetCode or any numeric text and animate it
    const leetSection = document.querySelector('#Leetcode');
    if (!leetSection) return;

    // We inject 3 animated stat cards above the LeetCode card image
    const statsWrapper = document.createElement('div');
    statsWrapper.style.cssText = `
      display: flex; gap: 20px; justify-content: center;
      flex-wrap: wrap; margin-bottom: 30px; width: 100%;
    `;

    const stats = [
      { label: 'Problems Solved', value: 100, suffix: '+', color: '#44cbda' },
      { label: 'Contest Rating',  value: 1500, suffix: '+', color: '#7e42a7' },
      { label: 'Days Active',     value: 100, suffix: '',  color: '#2a46ff'  },
    ];

    stats.forEach(({ label, value, suffix, color }) => {
      const card = document.createElement('div');
      card.style.cssText = `
        background: linear-gradient(135deg, rgba(8,0,32,0.9), rgba(34,0,73,0.8));
        border: 1px solid ${color}44;
        border-radius: 16px;
        padding: 20px 30px;
        text-align: center;
        min-width: 160px;
        box-shadow: 0 0 20px ${color}22;
        transition: box-shadow 0.3s ease, transform 0.3s ease;
      `;
      card.onmouseenter = () => {
        card.style.boxShadow = `0 0 40px ${color}55`;
        card.style.transform = 'translateY(-6px)';
      };
      card.onmouseleave = () => {
        card.style.boxShadow = `0 0 20px ${color}22`;
        card.style.transform = '';
      };

      const num = document.createElement('div');
      num.className = 'stat-counter';
      num.style.cssText = `font-size: 2.2rem; font-weight: 800; color: ${color}; font-family: 'Fira Code', monospace;`;
      num.textContent  = '0' + suffix;

      const lbl = document.createElement('div');
      lbl.style.cssText = 'font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 4px; letter-spacing: 0.5px;';
      lbl.textContent = label;

      card.appendChild(num);
      card.appendChild(lbl);
      statsWrapper.appendChild(card);

      // Animate counter when visible
      const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          animateCounter(num, 0, value, suffix, 1800);
          obs.disconnect();
        }
      }, { threshold: 0.5 });
      obs.observe(card);
    });

    leetSection.insertBefore(statsWrapper, leetSection.children[1] || null);
  }

  function animateCounter(el, from, to, suffix, duration) {
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.floor(eased * (to - from) + from) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ──────────────────────────────────────────
     15. HERO SECTION FLOATING PARTICLES
  ──────────────────────────────────────────── */
  function setupHeroParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      const size = 2 + Math.random() * 4;
      const colors = ['#44cbda', '#7e42a7', '#2a46ff', '#72a1de'];
      p.style.cssText = `
        position: absolute;
        width: ${size}px; height: ${size}px;
        border-radius: 50%;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${0.3 + Math.random() * 0.5};
        pointer-events: none;
        animation: heroFloat ${4 + Math.random() * 6}s ease-in-out ${Math.random() * 4}s infinite;
        z-index: 1;
      `;
      hero.appendChild(p);
    }

    const style = document.createElement('style');
    style.textContent = `
      @keyframes heroFloat {
        0%,100% { transform: translateY(0) translateX(0) scale(1); }
        33%      { transform: translateY(-30px) translateX(15px) scale(1.2); }
        66%      { transform: translateY(15px) translateX(-20px) scale(0.9); }
      }
      @keyframes konamiToast {
        from { transform: translateX(-50%) translateY(20px); opacity: 0; }
        to   { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

})();