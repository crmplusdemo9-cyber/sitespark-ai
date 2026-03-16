// ============================================
// SiteSpark AI — Interactive Demo Application
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCounterAnimation();
    initScrollAnimations();
    initBuilderDemo();
    initTemplateSelection();
    initDomainChecker();
    initDeviceSwitcher();
    initWaitlistForm();
    initColorPicker();
});

// ---- Navigation ----
function initNavigation() {
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('mobileToggle');
    const links = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    });

    if (toggle) {
        toggle.addEventListener('click', () => {
            links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
            links.style.position = 'absolute';
            links.style.top = '100%';
            links.style.left = '0';
            links.style.right = '0';
            links.style.background = 'rgba(10,10,15,0.95)';
            links.style.flexDirection = 'column';
            links.style.padding = '20px';
            links.style.gap = '16px';
            links.style.backdropFilter = 'blur(20px)';
            links.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
        });
    }
}

// ---- Counter Animation ----
function initCounterAnimation() {
    const counters = document.querySelectorAll('[data-target]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

function animateCounter(el, target) {
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        el.textContent = Math.floor(current).toLocaleString();
    }, 25);
}

// ---- Scroll Animations ----
function initScrollAnimations() {
    const elements = document.querySelectorAll('.step-card, .template-showcase-card, .price-card, .cta-card');
    elements.forEach(el => el.classList.add('fade-in'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => observer.observe(el));
}

// ---- Builder Demo ----
let currentStep = 1;
let builderData = {
    description: '',
    template: 'glass',
    headline: '',
    subheadline: '',
    cta: '',
    color: '#8B5CF6',
    domain: ''
};

// Content presets based on business descriptions
const contentPresets = {
    'yoga': {
        headline: 'Find Your Inner Balance',
        subheadline: 'Transformative yoga sessions for mind, body, and soul. Join classes in Portland or online.',
        cta: 'Book a Session',
        features: [
            { icon: '🧘', title: 'Private Sessions', desc: 'One-on-one guided practice' },
            { icon: '📱', title: 'Online Classes', desc: 'Practice from anywhere' },
            { icon: '🌿', title: 'Wellness Plans', desc: 'Holistic health programs' }
        ]
    },
    'photo': {
        headline: 'Moments Worth Keeping',
        subheadline: 'Award-winning wedding & portrait photography in NYC. Every frame tells your story.',
        cta: 'View Portfolio',
        features: [
            { icon: '📸', title: 'Weddings', desc: 'Full day coverage' },
            { icon: '🖼️', title: 'Portraits', desc: 'Studio & location shoots' },
            { icon: '✨', title: 'Editing', desc: 'Professional retouching' }
        ]
    },
    'fitness': {
        headline: 'Transform Your Body',
        subheadline: 'Personal training and online coaching programs designed to get real results.',
        cta: 'Start Training',
        features: [
            { icon: '💪', title: '1:1 Training', desc: 'Customized workouts' },
            { icon: '📊', title: 'Nutrition Plans', desc: 'Macro-optimized meals' },
            { icon: '🏆', title: 'Challenges', desc: '30-day transformations' }
        ]
    },
    'marketing': {
        headline: 'Grow Your Business',
        subheadline: 'Data-driven digital marketing that delivers measurable ROI for small businesses.',
        cta: 'Get Free Audit',
        features: [
            { icon: '📱', title: 'Social Media', desc: 'Content & management' },
            { icon: '🔍', title: 'SEO', desc: 'Rank higher on Google' },
            { icon: '📧', title: 'Email Marketing', desc: 'Automated campaigns' }
        ]
    },
    'bakery': {
        headline: 'Baked with Love',
        subheadline: 'Artisan breads, pastries, and cakes made fresh daily. Order online for delivery.',
        cta: 'Order Now',
        features: [
            { icon: '🧁', title: 'Custom Cakes', desc: 'For every occasion' },
            { icon: '🥐', title: 'Daily Fresh', desc: 'Baked every morning' },
            { icon: '🚚', title: 'Delivery', desc: 'To your doorstep' }
        ]
    },
    'tech': {
        headline: 'Build the Future',
        subheadline: 'Mobile app development studio creating innovative solutions for tomorrow\'s challenges.',
        cta: 'Start a Project',
        features: [
            { icon: '📱', title: 'Mobile Apps', desc: 'iOS & Android' },
            { icon: '🌐', title: 'Web Apps', desc: 'Full-stack development' },
            { icon: '🤖', title: 'AI Integration', desc: 'Smart features built-in' }
        ]
    },
    'default': {
        headline: 'Welcome to Our World',
        subheadline: 'We help you achieve your goals with innovative solutions tailored to your needs.',
        cta: 'Get Started',
        features: [
            { icon: '⚡', title: 'Fast', desc: 'Lightning quick results' },
            { icon: '🎯', title: 'Precise', desc: 'Tailored to you' },
            { icon: '🛡️', title: 'Reliable', desc: 'Trust our expertise' }
        ]
    }
};

function initBuilderDemo() {
    // Quick picks
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.getElementById('businessDesc').value = chip.getAttribute('data-desc');
        });
    });

    // Generate button
    const genBtn = document.getElementById('generateBtn');
    if (genBtn) {
        genBtn.addEventListener('click', () => {
            const desc = document.getElementById('businessDesc').value.trim();
            if (!desc) {
                document.getElementById('businessDesc').focus();
                document.getElementById('businessDesc').style.borderColor = '#EF4444';
                setTimeout(() => {
                    document.getElementById('businessDesc').style.borderColor = '';
                }, 2000);
                return;
            }

            builderData.description = desc;

            // Detect business type
            const descLower = desc.toLowerCase();
            let preset;
            if (descLower.includes('yoga') || descLower.includes('wellness') || descLower.includes('meditation')) {
                preset = contentPresets.yoga;
            } else if (descLower.includes('photo') || descLower.includes('wedding')) {
                preset = contentPresets.photo;
            } else if (descLower.includes('fitness') || descLower.includes('trainer') || descLower.includes('gym')) {
                preset = contentPresets.fitness;
            } else if (descLower.includes('marketing') || descLower.includes('agency') || descLower.includes('digital')) {
                preset = contentPresets.marketing;
            } else if (descLower.includes('bakery') || descLower.includes('cake') || descLower.includes('cafe')) {
                preset = contentPresets.bakery;
            } else if (descLower.includes('tech') || descLower.includes('app') || descLower.includes('startup') || descLower.includes('software')) {
                preset = contentPresets.tech;
            } else {
                preset = contentPresets.default;
            }

            // Show generating animation
            genBtn.innerHTML = '<span class="spinner"></span> AI Generating...';
            genBtn.disabled = true;

            setTimeout(() => {
                builderData.headline = preset.headline;
                builderData.subheadline = preset.subheadline;
                builderData.cta = preset.cta;
                builderData.features = preset.features;

                // Fill customize fields
                document.getElementById('custHeadline').value = preset.headline;
                document.getElementById('custSubhead').value = preset.subheadline;
                document.getElementById('custCta').value = preset.cta;

                // Update preview
                updateLivePreview();

                // Go to step 2
                genBtn.innerHTML = '<span>⚡</span> Generate with AI';
                genBtn.disabled = false;
                goToStep(2);
            }, 1500);
        });
    }
}

function goToStep(step) {
    currentStep = step;

    // Update step indicators
    document.querySelectorAll('.b-step').forEach(s => {
        const sNum = parseInt(s.getAttribute('data-bstep'));
        s.classList.remove('active', 'done');
        if (sNum === step) s.classList.add('active');
        if (sNum < step) s.classList.add('done');
    });

    // Show/hide content
    for (let i = 1; i <= 5; i++) {
        const el = document.getElementById(`builderStep${i}`);
        if (el) el.classList.toggle('hidden', i !== step);
    }

    // Update preview on step changes
    if (step >= 2) updateLivePreview();

    // Update publish summary
    if (step === 5) {
        const templates = { glass: 'Glassmorphism', minimal: 'Minimal Clean', bold: 'Bold & Dark', gradient: 'Gradient Flow', zen: 'Zen Nature', neon: 'Neon Cyber' };
        document.getElementById('pubTemplate').textContent = templates[builderData.template] || 'Glassmorphism';
        document.getElementById('pubDomain').textContent = builderData.domain || 'yoursite.sitespark.app';
    }
}

function updateLivePreview() {
    const preview = document.getElementById('livePreview');
    const color = builderData.color || '#8B5CF6';
    const template = builderData.template || 'glass';

    let bgStyle = '';
    let heroStyle = '';

    switch (template) {
        case 'glass':
            bgStyle = `background: linear-gradient(135deg, ${color}15, ${color}05)`;
            heroStyle = `background: linear-gradient(135deg, ${color}20, ${color}08); backdrop-filter: blur(20px); border: 1px solid ${color}30;`;
            break;
        case 'minimal':
            bgStyle = 'background: #fafaf9; color: #1a1a1a;';
            heroStyle = 'background: #f5f5f4; border: 1px solid #e7e5e4;';
            break;
        case 'bold':
            bgStyle = 'background: linear-gradient(135deg, #1a1a2e, #16213e);';
            heroStyle = `background: linear-gradient(135deg, ${color}30, ${color}10); border: 1px solid ${color}40;`;
            break;
        case 'gradient':
            bgStyle = `background: linear-gradient(135deg, ${color}, ${adjustColor(color, 40)});`;
            heroStyle = 'background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);';
            break;
        case 'zen':
            bgStyle = 'background: linear-gradient(135deg, #1a2e1a, #0a1a0a);';
            heroStyle = 'background: rgba(45,80,22,0.3); border: 1px solid rgba(74,124,46,0.3);';
            break;
        case 'neon':
            bgStyle = 'background: #050505;';
            heroStyle = `border: 1px solid ${color}80; box-shadow: 0 0 30px ${color}20, inset 0 0 30px ${color}08;`;
            break;
    }

    const features = builderData.features || contentPresets.default.features;
    const textColor = template === 'minimal' ? 'color: #1a1a1a;' : '';
    const subColor = template === 'minimal' ? 'color: #64748b;' : '';

    preview.innerHTML = `
        <div class="generated-site" style="${bgStyle}">
            <div class="gs-nav">
                <span class="gs-nav-brand" style="${textColor}">${getBusinessName()}</span>
                <div class="gs-nav-links">
                    <span>About</span>
                    <span>Services</span>
                    <span>Contact</span>
                </div>
            </div>
            <div class="gs-hero" style="${heroStyle}; border-radius: 12px; padding: 32px 20px; margin-bottom: 16px;">
                <h2 style="font-size: 1.3rem; margin-bottom: 8px; ${textColor}">${builderData.headline || 'Your Headline'}</h2>
                <p style="font-size: 0.82rem; margin-bottom: 16px; ${subColor}">${builderData.subheadline || 'Your subheadline goes here'}</p>
                <button class="gs-cta" style="background: ${color};">${builderData.cta || 'Get Started'}</button>
            </div>
            <div class="gs-features">
                ${features.map(f => `
                    <div class="gs-feature">
                        <div class="gs-feature-icon">${f.icon}</div>
                        <h4 style="${textColor}">${f.title}</h4>
                        <p>${f.desc}</p>
                    </div>
                `).join('')}
            </div>
            <div class="gs-footer">
                © 2025 ${getBusinessName()} · Built with SiteSpark AI
            </div>
        </div>
    `;
}

function getBusinessName() {
    const desc = builderData.description.toLowerCase();
    if (desc.includes('yoga')) return 'Zen Flow Yoga';
    if (desc.includes('photo')) return 'Lens & Light Studio';
    if (desc.includes('fitness') || desc.includes('trainer')) return 'Peak Performance';
    if (desc.includes('marketing') || desc.includes('agency')) return 'GrowthWave';
    if (desc.includes('bakery') || desc.includes('cafe')) return 'Golden Crust Bakery';
    if (desc.includes('tech') || desc.includes('app')) return 'NexGen Labs';
    return 'Your Brand';
}

function adjustColor(hex, amount) {
    hex = hex.replace('#', '');
    const num = parseInt(hex, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// ---- Template Selection ----
function initTemplateSelection() {
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            builderData.template = card.getAttribute('data-template');
            updateLivePreview();
        });
    });

    // Live field updates
    ['custHeadline', 'custSubhead', 'custCta'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                if (id === 'custHeadline') builderData.headline = el.value;
                if (id === 'custSubhead') builderData.subheadline = el.value;
                if (id === 'custCta') builderData.cta = el.value;
                updateLivePreview();
            });
        }
    });
}

// ---- Color Picker ----
function initColorPicker() {
    const picker = document.getElementById('custColor');
    const value = document.getElementById('colorValue');
    if (picker) {
        picker.addEventListener('input', () => {
            builderData.color = picker.value;
            if (value) value.textContent = picker.value;
            updateLivePreview();
        });
    }
}

// ---- Domain Checker ----
function initDomainChecker() {
    const checkBtn = document.getElementById('checkDomain');
    if (checkBtn) {
        checkBtn.addEventListener('click', checkDomainAvailability);
    }
}

function checkDomainAvailability() {
    const input = document.getElementById('domainInput');
    const tld = document.getElementById('domainTld');
    const results = document.getElementById('domainResults');
    const name = input.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

    if (!name) {
        input.focus();
        return;
    }

    const domain = name + tld.value;
    builderData.domain = domain;

    results.innerHTML = '<div style="padding:12px; color: var(--text-muted); font-size: 0.85rem;"><span class="spinner"></span> Checking availability...</div>';

    // Simulate domain check
    setTimeout(() => {
        const prices = { '.com': '$8.56', '.io': '$28.88', '.co': '$11.49', '.dev': '$10.18', '.yoga': '$24.99', '.studio': '$19.99' };
        const price = prices[tld.value] || '$9.99';
        const available = Math.random() > 0.3; // 70% available for demo

        if (available) {
            results.innerHTML = `
                <div class="domain-result available">
                    <div>
                        <strong style="color: var(--success);">✅ ${domain}</strong>
                        <span style="font-size: 0.75rem; color: var(--text-muted);"> — Available!</span>
                    </div>
                    <span style="color: var(--success); font-weight: 700;">${price}/yr</span>
                </div>
                <div class="domain-result available" style="opacity: 0.7;">
                    <div>
                        <strong>✅ ${name}.co</strong>
                        <span style="font-size: 0.75rem; color: var(--text-muted);"> — Available</span>
                    </div>
                    <span style="font-weight: 600;">$11.49/yr</span>
                </div>
            `;
        } else {
            results.innerHTML = `
                <div class="domain-result taken">
                    <div>
                        <strong>❌ ${domain}</strong>
                        <span style="font-size: 0.75rem;"> — Taken</span>
                    </div>
                </div>
                <div class="domain-result available">
                    <div>
                        <strong style="color: var(--success);">✅ ${name}-studio${tld.value}</strong>
                        <span style="font-size: 0.75rem; color: var(--text-muted);"> — Available!</span>
                    </div>
                    <span style="color: var(--success); font-weight: 700;">${price}/yr</span>
                </div>
            `;
        }
    }, 1200);
}

// ---- Device Switcher ----
function initDeviceSwitcher() {
    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const frame = document.getElementById('previewFrame');
            const device = btn.getAttribute('data-device');
            frame.className = 'preview-frame';
            if (device !== 'desktop') frame.classList.add(device);
        });
    });

    // Publish button
    const pubBtn = document.getElementById('publishBtn');
    if (pubBtn) {
        pubBtn.addEventListener('click', () => {
            pubBtn.innerHTML = '<span class="spinner"></span> Publishing...';
            pubBtn.disabled = true;

            const status = document.getElementById('publishStatus');

            setTimeout(() => {
                status.classList.remove('hidden');
                status.classList.add('success');
                status.innerHTML = `
                    🎉 <strong>Site Published!</strong><br>
                    <span style="font-size: 0.85rem;">Your site is live at <a href="#" style="color: var(--primary-light); text-decoration: underline;">${builderData.domain || 'yoursite.sitespark.app'}</a></span>
                `;
                pubBtn.innerHTML = '✅ Published!';
                pubBtn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
            }, 2000);
        });
    }
}

// ---- Waitlist Form ----
function initWaitlistForm() {
    const form = document.getElementById('waitlistForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('waitlistEmail').value;
            const btn = form.querySelector('button');
            btn.innerHTML = '<span class="spinner"></span>';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = '✅ Joined!';
                btn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
                document.getElementById('waitlistEmail').value = '';
                setTimeout(() => {
                    btn.innerHTML = 'Join Waitlist';
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }, 1000);
        });
    }
}
