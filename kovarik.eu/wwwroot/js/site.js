// ============================================
// kovarik.eu — Site JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // THEME TOGGLE (light / dark)
    // ============================================
    const themeToggle = document.getElementById('themeToggle');
    const metaThemeColor = document.getElementById('metaThemeColor');
    const themeColors = { dark: '#0f0f1a', light: '#f8f9fb' };

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-bs-theme', theme);
        if (metaThemeColor) metaThemeColor.setAttribute('content', themeColors[theme] || themeColors.dark);
        if (themeToggle) {
            themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
        }
    };

    // Initialize from the value the inline head script already set
    const initialTheme = document.documentElement.getAttribute('data-bs-theme') || 'dark';
    applyTheme(initialTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-bs-theme') === 'light' ? 'light' : 'dark';
            const next = current === 'light' ? 'dark' : 'light';
            applyTheme(next);
            try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
        });
    }

    // Follow OS changes only when user has not chosen explicitly
    if (window.matchMedia) {
        const mq = window.matchMedia('(prefers-color-scheme: light)');
        const listener = (e) => {
            try {
                if (localStorage.getItem('theme')) return;
            } catch (err) { /* ignore */ }
            applyTheme(e.matches ? 'light' : 'dark');
        };
        if (mq.addEventListener) mq.addEventListener('change', listener);
        else if (mq.addListener) mq.addListener(listener);
    }

    // ---- Scroll-based fade-in animations ----
    const fadeElements = document.querySelectorAll('.fade-in');
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => fadeObserver.observe(el));

    // ---- Navbar scroll effect ----
    const navbar = document.getElementById('mainNav');
    const onScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ---- Active nav link highlight on scroll ----
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('#mainNav .nav-link');

    const highlightNav = () => {
        const scrollPos = window.scrollY + 120;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    const href = link.getAttribute('href');
                    if (href === '#' + id || href === '/#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };
    window.addEventListener('scroll', highlightNav, { passive: true });
    highlightNav();

    // ---- Close mobile nav on link click ----
    const navCollapse = document.getElementById('navbarNav');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navCollapse.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
                if (bsCollapse) bsCollapse.hide();
            }
        });
    });

    // ============================================
    // SCROLL PROGRESS INDICATOR
    // ============================================
    const scrollProgress = document.getElementById('scrollProgress');
    if (scrollProgress) {
        const updateProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            scrollProgress.style.width = progress + '%';
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    // ============================================
    // TYPING EFFECT
    // ============================================
    const typingEl = document.getElementById('typingText');
    if (typingEl) {
        const dataPhrases = (typingEl.getAttribute('data-phrases') || '').split('|').filter(Boolean);
        const phrases = dataPhrases.length ? dataPhrases : [
            '.NET Developer',
            'AI Enthusiast',
            'Web Architect',
            'Angular Developer',
            'C# Expert'
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 80;

        const typeLoop = () => {
            const currentPhrase = phrases[phraseIndex];

            if (isDeleting) {
                typingEl.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 40;
            } else {
                typingEl.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 80;
            }

            if (!isDeleting && charIndex === currentPhrase.length) {
                // Pause at end of phrase
                typingSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typingSpeed = 400;
            }

            setTimeout(typeLoop, typingSpeed);
        };

        // Start typing after a short delay
        setTimeout(typeLoop, 1200);
    }

    // ============================================
    // PARTICLE CANVAS BACKGROUND
    // ============================================
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;
        let width, height;

        const resize = () => {
            const hero = canvas.parentElement;
            width = canvas.width = hero.offsetWidth;
            height = canvas.height = hero.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const particleCount = Math.min(80, Math.floor(window.innerWidth / 15));
        const connectionDist = 150;
        const mouseRadius = 200;
        let mouse = { x: -9999, y: -9999 };

        canvas.parentElement.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        canvas.parentElement.addEventListener('mouseleave', () => {
            mouse.x = -9999;
            mouse.y = -9999;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 1.5 + 0.5;
                // Random color between accent and accent-secondary
                this.hue = Math.random() > 0.5 ? 190 : 270;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Subtle mouse repulsion
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouseRadius) {
                    const force = (mouseRadius - dist) / mouseRadius * 0.02;
                    this.vx += dx * force;
                    this.vy += dy * force;
                }

                // Speed limit
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > 1.5) {
                    this.vx = (this.vx / speed) * 1.5;
                    this.vy = (this.vy / speed) * 1.5;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.hue === 190
                    ? 'rgba(0, 212, 255, 0.6)'
                    : 'rgba(124, 58, 237, 0.5)';
                ctx.fill();
            }
        }

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Update and draw particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDist) {
                        const opacity = (1 - dist / connectionDist) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(animate);
        };

        // Only animate when hero is visible (performance)
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animate();
                } else {
                    cancelAnimationFrame(animationId);
                }
            });
        }, { threshold: 0 });

        heroObserver.observe(canvas.parentElement);
    }

    // ============================================
    // COMMAND PALETTE (Ctrl + K / Cmd + K)
    // ============================================
    const cmdkBackdrop = document.getElementById('cmdkBackdrop');
    const cmdkPanel = document.getElementById('cmdkPanel');
    const cmdkInput = document.getElementById('cmdkInput');
    const cmdkList = document.getElementById('cmdkList');
    const cmdkOpen = document.getElementById('cmdkOpen');
    const cmdkEmpty = document.getElementById('cmdkEmpty');

    if (cmdkBackdrop && cmdkInput && cmdkList) {
        const items = Array.from(cmdkList.querySelectorAll('.cmdk-item'));
        const groups = Array.from(cmdkList.querySelectorAll('[data-group]'));
        let activeIdx = 0;
        let lastFocused = null;

        const stripDiacritics = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const norm = (s) => stripDiacritics((s || '').toLowerCase()).trim();

        const itemHaystack = items.map(el => {
            const label = el.querySelector('span')?.textContent || '';
            const keywords = el.getAttribute('data-keywords') || '';
            return norm(label + ' ' + keywords);
        });

        const visibleItems = () => items.filter(el => !el.hidden);

        const setActive = (idx) => {
            const vis = visibleItems();
            if (!vis.length) { activeIdx = -1; return; }
            activeIdx = (idx + vis.length) % vis.length;
            items.forEach(el => el.classList.remove('active'));
            const target = vis[activeIdx];
            target.classList.add('active');
            target.scrollIntoView({ block: 'nearest' });
        };

        const filter = (q) => {
            const needle = norm(q);
            items.forEach((el, i) => {
                el.hidden = needle.length > 0 && !itemHaystack[i].includes(needle);
            });
            // Hide groups whose items are all hidden
            groups.forEach(g => {
                const any = Array.from(g.querySelectorAll('.cmdk-item')).some(el => !el.hidden);
                g.hidden = !any;
            });
            const anyVisible = visibleItems().length > 0;
            if (cmdkEmpty) cmdkEmpty.hidden = anyVisible;
            setActive(0);
        };

        const openPalette = () => {
            lastFocused = document.activeElement;
            cmdkBackdrop.hidden = false;
            requestAnimationFrame(() => cmdkBackdrop.classList.add('open'));
            cmdkInput.value = '';
            filter('');
            setTimeout(() => cmdkInput.focus(), 30);
            document.body.style.overflow = 'hidden';
        };

        const closePalette = () => {
            cmdkBackdrop.classList.remove('open');
            setTimeout(() => { cmdkBackdrop.hidden = true; }, 180);
            document.body.style.overflow = '';
            if (lastFocused && typeof lastFocused.focus === 'function') {
                try { lastFocused.focus(); } catch (e) { /* ignore */ }
            }
        };

        const runItem = (el) => {
            if (!el) return;
            const action = el.getAttribute('data-action');
            const href = el.getAttribute('data-href');
            closePalette();
            if (action === 'toggle-theme') {
                if (themeToggle) themeToggle.click();
                return;
            }
            if (action === 'scroll-top') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            if (href) {
                if (href.startsWith('mailto:') || href.startsWith('http')) {
                    window.location.href = href;
                } else if (href.startsWith('/#')) {
                    // Same-page hash navigation
                    const hash = href.slice(1);
                    if (window.location.pathname === '/' || window.location.pathname === '') {
                        const target = document.querySelector(hash);
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            history.replaceState(null, '', hash);
                            return;
                        }
                    }
                    window.location.href = href;
                } else {
                    window.location.href = href;
                }
            }
        };

        // Open via button
        if (cmdkOpen) cmdkOpen.addEventListener('click', openPalette);

        // Global shortcut: Ctrl+K / Cmd+K  (and "/" outside inputs)
        document.addEventListener('keydown', (e) => {
            const isMod = e.ctrlKey || e.metaKey;
            const tag = (e.target && e.target.tagName) || '';
            const inEditable = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable);

            if (isMod && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                if (cmdkBackdrop.hidden) openPalette(); else closePalette();
                return;
            }
            if (e.key === '/' && !inEditable && cmdkBackdrop.hidden) {
                e.preventDefault();
                openPalette();
            }
        });

        // Backdrop click closes
        cmdkBackdrop.addEventListener('click', (e) => {
            if (e.target === cmdkBackdrop) closePalette();
        });

        // Input handling
        cmdkInput.addEventListener('input', (e) => filter(e.target.value));
        cmdkInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { e.preventDefault(); closePalette(); return; }
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIdx + 1); return; }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIdx - 1); return; }
            if (e.key === 'Enter') {
                e.preventDefault();
                const vis = visibleItems();
                if (vis[activeIdx]) runItem(vis[activeIdx]);
            }
        });

        // Mouse hover sets active
        items.forEach((el, idx) => {
            el.addEventListener('mousemove', () => {
                const vis = visibleItems();
                const i = vis.indexOf(el);
                if (i >= 0 && i !== activeIdx) setActive(i);
            });
            el.addEventListener('click', () => runItem(el));
        });
    }

});
