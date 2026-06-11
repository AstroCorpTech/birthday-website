document.addEventListener('DOMContentLoaded', () => {
    // ===== LOADER =====
    const loader = document.getElementById('loader');
    setTimeout(() => loader?.classList.add('hidden'), 1500);

    // ===== NAVIGATION =====
    const navLinks = document.querySelector('.nav-links');
    document.getElementById('menuToggle')?.addEventListener('click', () => navLinks?.classList.toggle('active'));
    document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => navLinks?.classList.remove('active')));

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // ========================================
    // HERO CANVAS CONSTELLATION
    // ========================================
    const canvas = document.getElementById('heroCanvas');
    const heroSpotlight = document.getElementById('heroSpotlight');
    const heroSection = document.getElementById('home');
    let ctx, particles = [], mouse = { x: -1000, y: -1000 }, isHeroVisible = true;
    const PARTICLE_COUNT = 70;
    const CONNECTION_DIST = 130;
    const MOUSE_DIST = 180;
    const lavishNames = [
        'My Hero','Living Legend','Once in a Lifetime','Born to Shine','King of Hearts',
        'Star of My Sky','Best Brother Ever','My Pride & Joy','The Real Boss','Golden Heart',
        'Warrior of Love','The Undisputed GOAT','Shining Star','My Whole World','Unstoppable',
        'Fearless Soul','Born to Win','Heart of Gold','My Protector','Rising Star',
        'Trailblazer','Brightest Light','Soul Brother','Magic Maker','Made of Stardust',
        'Destined for Greatness','Rare Gem','My Safe Place','Chosen One','Pure Class'
    ];
    const starPopup = document.getElementById('starPopup');
    const starName = document.getElementById('starName');
    let popupTimer;

    function initHeroCanvas() {
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resizeCanvas();
        createParticles();
        animateCanvas();

        window.addEventListener('resize', resizeCanvas);
        heroSection.addEventListener('mousemove', e => {
            const rect = heroSection.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            if (heroSpotlight) {
                heroSpotlight.style.left = mouse.x + 'px';
                heroSpotlight.style.top = mouse.y + 'px';
            }
        });
        heroSection.addEventListener('mouseleave', () => {
            mouse.x = -1000; mouse.y = -1000;
        });
        canvas.addEventListener('click', e => {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            // Find closest particle
            let closest = null, closestDist = 40;
            particles.forEach(p => {
                const d = Math.hypot(p.x - clickX, p.y - clickY);
                if (d < closestDist) { closestDist = d; closest = p; }
            });
            if (closest) {
                // Burst effect
                particles.forEach(p => {
                    const d = Math.hypot(p.x - clickX, p.y - clickY);
                    if (d < 150) {
                        const angle = Math.atan2(p.y - clickY, p.x - clickX);
                        const force = (150 - d) / 150 * 4;
                        p.vx += Math.cos(angle) * force;
                        p.vy += Math.sin(angle) * force;
                    }
                });
                // Show popup
                clearTimeout(popupTimer);
                if (starPopup && starName) {
                    starName.textContent = '✦ ' + closest.name + ' ✦';
                    starPopup.style.left = (e.clientX) + 'px';
                    starPopup.style.top = (e.clientY - 20) + 'px';
                    starPopup.classList.add('active');
                    popupTimer = setTimeout(() => starPopup.classList.remove('active'), 2200);
                }
            }
        });

        // Pause when hero not visible
        const heroObserver = new IntersectionObserver((entries) => {
            isHeroVisible = entries[0].isIntersecting;
        }, { threshold: 0.05 });
        heroObserver.observe(heroSection);
    }

    function resizeCanvas() {
        if (!canvas || !heroSection) return;
        const rect = heroSection.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    function createParticles() {
        particles = [];
        const w = canvas.width, h = canvas.height;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2 + 1,
                isGold: Math.random() > 0.75,
                name: lavishNames[Math.floor(Math.random() * lavishNames.length)]
            });
        }
    }

    function animateCanvas() {
        if (!ctx || !isHeroVisible) {
            requestAnimationFrame(animateCanvas);
            return;
        }
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Update & draw particles
        particles.forEach(p => {
            // Mouse repulsion
            const mdx = p.x - mouse.x;
            const mdy = p.y - mouse.y;
            const mDist = Math.hypot(mdx, mdy);
            if (mDist < MOUSE_DIST && mDist > 0) {
                const force = (MOUSE_DIST - mDist) / MOUSE_DIST * 0.15;
                p.vx += (mdx / mDist) * force;
                p.vy += (mdy / mDist) * force;
            }

            // Apply velocity with damping
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;

            // Bounce off edges
            if (p.x < 0 || p.x > w) { p.vx *= -1; p.x = Math.max(0, Math.min(w, p.x)); }
            if (p.y < 0 || p.y > h) { p.vy *= -1; p.y = Math.max(0, Math.min(h, p.y)); }

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            if (p.isGold) {
                ctx.fillStyle = 'rgba(232,196,77,0.9)';
                ctx.shadowBlur = 8;
                ctx.shadowColor = 'rgba(232,196,77,0.5)';
            } else {
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.shadowBlur = 4;
                ctx.shadowColor = 'rgba(255,255,255,0.3)';
            }
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.hypot(dx, dy);
                if (dist < CONNECTION_DIST) {
                    const alpha = (1 - dist / CONNECTION_DIST) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = particles[i].isGold || particles[j].isGold
                        ? `rgba(232,196,77,${alpha})`
                        : `rgba(255,255,255,${alpha * 0.6})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animateCanvas);
    }

    initHeroCanvas();

    document.addEventListener('click', () => {
        clearTimeout(popupTimer);
        starPopup?.classList.remove('active');
    });

    // Shooting star (on canvas area)
    setInterval(() => {
        if (!isHeroVisible) return;
        const s = document.createElement('div');
        s.className = 'shooting-star';
        s.style.cssText = `
            position:absolute; width:100px; height:2px;
            background:linear-gradient(90deg, transparent, rgba(232,196,77,0.8), transparent);
            top:${Math.random() * 40}%;
            left:${Math.random() * 40 + 60}%;
            z-index:2; pointer-events:none;
            animation:shoot 1.2s ease-out forwards;
        `;
        heroSection.appendChild(s);
        setTimeout(() => s.remove(), 1300);
    }, 5000);

    // Add keyframe for shooting star
    const shootStyle = document.createElement('style');
    shootStyle.textContent = `@keyframes shoot { from { transform:translateX(0) rotate(-25deg); opacity:1; } to { transform:translateX(-300px) rotate(-25deg); opacity:0; } }`;
    document.head.appendChild(shootStyle);

    // ========================================
    // TEXT REVEAL — Char-by-char for short text, fade for long/gradient
    // ========================================
    function revealChars(element, baseDelay = 0, charDelay = 0.03) {
        if (!element) return;
        const text = element.textContent;
        element.textContent = '';
        let delay = baseDelay;
        for (const char of text) {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.animationDelay = delay + 's';
            element.appendChild(span);
            delay += char === ' ' ? charDelay * 0.5 : charDelay;
        }
        element.classList.add('revealed');
    }

    function fadeIn(element, delay = 0) {
        if (!element) return;
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, delay * 1000);
    }

    // Staggered reveal sequence
    const heroPhoto = document.getElementById('heroPhoto');
    setTimeout(() => {
        if (heroPhoto) {
            heroPhoto.classList.add('revealed');
            heroPhoto.style.transition = 'opacity 1s ease';
        }
    }, 300);

    // Char reveal for short text lines
    document.querySelectorAll('.hero-pretitle[data-reveal]').forEach(el => revealChars(el, 0.5, 0.04));
    document.querySelectorAll('.hero-title .line[data-reveal]:not(.accent)').forEach((el, i) => revealChars(el, 0.8 + i * 0.3, 0.035));

    // Fade-in for gradient text (can't split into chars) and paragraph text
    document.querySelectorAll('.hero-title .line.accent[data-reveal]').forEach(el => fadeIn(el, 1.4));
    document.querySelectorAll('.hero-subtitle[data-reveal]').forEach(el => fadeIn(el, 1.9));
    document.querySelectorAll('.hero-actions[data-reveal]').forEach(el => fadeIn(el, 2.4));
    document.querySelectorAll('.scroll-hint[data-reveal]').forEach(el => fadeIn(el, 2.9));

    // ===== SCROLL REVEAL (Single observer, efficient) =====
    document.querySelectorAll('.section-header, .story-grid, .story-stats, .reason-card, .gallery-item, .letter-card, .wish-card-master, .future-card')
        .forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ===== SECTION STARS (Lightweight div-based) =====
    function createStars(container, count) {
        if (!container) return;
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'star' + (Math.random() > 0.8 ? ' gold' : '');
            star.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 4}s;
                animation-duration: ${2 + Math.random() * 3}s;
            `;
            star.dataset.name = lavishNames[Math.floor(Math.random() * lavishNames.length)];
            star.addEventListener('click', (e) => {
                e.stopPropagation();
                clearTimeout(popupTimer);
                if (starPopup && starName) {
                    const rect = star.getBoundingClientRect();
                    starName.textContent = '✦ ' + star.dataset.name + ' ✦';
                    starPopup.style.left = rect.left + rect.width / 2 + 'px';
                    starPopup.style.top = rect.top + 'px';
                    starPopup.classList.add('active');
                    popupTimer = setTimeout(() => starPopup.classList.remove('active'), 2000);
                }
            });
            fragment.appendChild(star);
        }
        container.appendChild(fragment);
    }

    document.querySelectorAll('.section-stars').forEach(container => {
        createStars(container, 15);
    });

    // ===== TIMELINE =====
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
                timelineObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.timeline-item').forEach((item, i) => {
        item.style.opacity = '0';
        item.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        item.style.transform = i % 2 === 0 ? 'translateX(-20px)' : 'translateX(20px)';
        timelineObserver.observe(item);
    });

    // ===== GALLERY LIGHTBOX =====
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,18,0.95);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:pointer;opacity:0;transition:opacity 0.3s ease;';
            const lb = document.createElement('img');
            lb.src = img.src;
            lb.style.cssText = 'max-width:90%;max-height:85vh;border-radius:12px;transform:scale(0.95);transition:transform 0.3s ease;box-shadow:0 30px 60px rgba(0,0,0,0.6);';
            overlay.appendChild(lb);
            document.body.appendChild(overlay);
            requestAnimationFrame(() => { overlay.style.opacity = '1'; lb.style.transform = 'scale(1)'; });
            overlay.addEventListener('click', () => { overlay.style.opacity = '0'; setTimeout(() => overlay.remove(), 300); });
        });
    });

    // ===== CELEBRATION CONFETTI =====
    function celebrate(originX, originY, count = 60) {
        const colors = ['#e8c44d', '#f5e6a3', '#d4af37', '#ffffff', '#ff6b6b', '#ffd93d'];
        const shapes = ['circle', 'rect', 'triangle'];
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            const size = Math.random() * 6 + 4;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
            const velocity = Math.random() * 12 + 6;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity - Math.random() * 8 - 4;

            p.style.cssText = `
                position:fixed; left:${originX}px; top:${originY}px;
                width:${size}px; height:${size}px; pointer-events:none; z-index:99999;
                background:${color}; opacity:1;
            `;
            if (shape === 'circle') p.style.borderRadius = '50%';
            if (shape === 'triangle') {
                p.style.background = 'transparent';
                p.style.width = '0'; p.style.height = '0';
                p.style.borderLeft = `${size/2}px solid transparent`;
                p.style.borderRight = `${size/2}px solid transparent`;
                p.style.borderBottom = `${size}px solid ${color}`;
            }

            document.body.appendChild(p);

            let x = 0, y = 0, curVx = vx, curVy = vy, rot = 0, opacity = 1;
            const startTime = performance.now();
            const duration = 1200 + Math.random() * 600;

            function anim(now) {
                const t = (now - startTime) / duration;
                if (t >= 1) { p.remove(); return; }
                curVy += 0.35; // gravity
                curVx *= 0.98; // air resistance
                x += curVx;
                y += curVy;
                rot += curVx * 2;
                opacity = 1 - t;
                p.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
                p.style.opacity = opacity;
                requestAnimationFrame(anim);
            }
            requestAnimationFrame(anim);
        }
    }

    // ===== EMAIL BLAST =====
    const btnSeal = document.getElementById('btnSeal');
    const blastOverlay = document.getElementById('blastOverlay');
    const closeBlast = document.getElementById('closeBlast');

    btnSeal?.addEventListener('click', (e) => {
        const rect = btnSeal.getBoundingClientRect();
        celebrate(rect.left + rect.width / 2, rect.top + rect.height / 2, 70);
        setTimeout(() => {
            blastOverlay?.classList.add('active');
            // Second burst from center of modal
            setTimeout(() => celebrate(window.innerWidth / 2, window.innerHeight / 2, 40), 300);
        }, 400);
    });
    closeBlast?.addEventListener('click', () => blastOverlay?.classList.remove('active'));
    blastOverlay?.addEventListener('click', e => { if (e.target === blastOverlay) blastOverlay.classList.remove('active'); });

});
