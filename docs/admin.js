// ============================================
// SiteSpark AI — Admin Dashboard Application
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initNavigation();
    initCounters();
    populateUsers();
    populateSites();
    populateDomains();
    populateModeration();
    populateFeatureFlags();
    handleHashNavigation();
});

// ---- Sidebar ----
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const collapse = document.getElementById('sidebarCollapse');
    const mobileToggle = document.getElementById('mobileSidebarToggle');

    if (collapse) {
        collapse.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            document.body.classList.toggle('sidebar-collapsed');
        });
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // Close sidebar on mobile when clicking main
        document.getElementById('main').addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    }
}

// ---- Page Navigation ----
function initNavigation() {
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            switchPage(page);

            // Close mobile sidebar
            document.getElementById('sidebar').classList.remove('open');
        });
    });
}

function switchPage(pageName) {
    // Update sidebar active state
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`[data-page="${pageName}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Show correct page
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(`page-${pageName}`);
    if (page) page.classList.add('active');

    // Update header title
    const titles = {
        dashboard: 'Dashboard',
        users: 'Users Management',
        sites: 'Sites Management',
        domains: 'Domain Management',
        revenue: 'Revenue & Billing',
        analytics: 'Analytics',
        waitlist: 'Waitlist',
        moderation: 'Content Moderation',
        features: 'Feature Flags',
        settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[pageName] || 'Dashboard';

    // Update URL hash
    window.location.hash = pageName;

    // Animate KPI counters on page show
    setTimeout(() => initCounters(), 100);
}

function handleHashNavigation() {
    const hash = window.location.hash.replace('#', '');
    if (hash) switchPage(hash);
}

window.addEventListener('hashchange', handleHashNavigation);

// ---- Counter Animation ----
function initCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
        if (el.dataset.animated) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !el.dataset.animated) {
                    el.dataset.animated = 'true';
                    const target = parseInt(el.getAttribute('data-count'));
                    animateCount(el, target);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(el);
    });
}

function animateCount(el, target) {
    let current = 0;
    const duration = 1500;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        el.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// ---- Populate Users Table ----
function populateUsers() {
    const users = [
        { name: 'Sarah Chen', email: 'sarah@example.com', plan: 'Pro', sites: 5, joined: '2 days ago', status: 'active', color: '#8B5CF6' },
        { name: 'Mike Johnson', email: 'mike@studio.io', plan: 'Free', sites: 1, joined: '5 days ago', status: 'active', color: '#06B6D4' },
        { name: 'Ana Rodriguez', email: 'ana@yoga.co', plan: 'Pro', sites: 3, joined: '1 week ago', status: 'active', color: '#10B981' },
        { name: 'David Wu', email: 'david@techcorp.dev', plan: 'Free', sites: 1, joined: '1 week ago', status: 'active', color: '#F59E0B' },
        { name: 'Lisa Park', email: 'lisa@bakery.com', plan: 'Pro', sites: 2, joined: '2 weeks ago', status: 'active', color: '#EF4444' },
        { name: 'James Morgan', email: 'james@agency.io', plan: 'Free', sites: 0, joined: '2 weeks ago', status: 'inactive', color: '#64748B' },
        { name: 'Emma Davis', email: 'emma@design.co', plan: 'Pro', sites: 7, joined: '3 weeks ago', status: 'active', color: '#EC4899' },
        { name: 'Alex Turner', email: 'alex@startup.dev', plan: 'Pro', sites: 4, joined: '1 month ago', status: 'active', color: '#8B5CF6' },
        { name: 'Priya Sharma', email: 'priya@consulting.in', plan: 'Free', sites: 1, joined: '1 month ago', status: 'active', color: '#06B6D4' },
        { name: 'Tom Wilson', email: 'tom@creative.co', plan: 'Free', sites: 0, joined: '1 month ago', status: 'inactive', color: '#F59E0B' },
    ];

    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = users.map(u => `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:10px;">
                    <div class="avatar" style="background:${u.color};">${u.name.split(' ').map(n=>n[0]).join('')}</div>
                    <div>
                        <div style="font-weight:600;font-size:0.88rem;">${u.name}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">${u.email}</div>
                    </div>
                </div>
            </td>
            <td><span class="badge badge-${u.plan.toLowerCase()}">${u.plan}</span></td>
            <td>${u.sites}</td>
            <td style="color:var(--text-muted);">${u.joined}</td>
            <td><span class="badge badge-${u.status === 'active' ? 'live' : 'draft'}">${u.status}</span></td>
            <td>
                <div style="display:flex;gap:6px;">
                    <button class="btn btn-ghost btn-sm" onclick="togglePlan(this, '${u.name}')">${u.plan === 'Pro' ? '↓ Downgrade' : '↑ Upgrade'}</button>
                    <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="this.closest('tr').style.opacity='0.3'">Ban</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function togglePlan(btn, name) {
    const isUpgrade = btn.textContent.includes('Upgrade');
    const badgeEl = btn.closest('tr').querySelector('.badge');
    if (isUpgrade) {
        badgeEl.className = 'badge badge-pro';
        badgeEl.textContent = 'Pro';
        btn.textContent = '↓ Downgrade';
    } else {
        badgeEl.className = 'badge badge-free';
        badgeEl.textContent = 'Free';
        btn.textContent = '↑ Upgrade';
    }
    showToast(`${name} plan updated to ${isUpgrade ? 'Pro' : 'Free'}`);
}

// ---- Populate Sites Grid ----
function populateSites() {
    const sites = [
        { name: 'Zen Flow Yoga', domain: 'zenflow.yoga', views: '2.3K', status: 'published', template: 'zen', bg: 'linear-gradient(135deg, #2d5016, #4a7c2e)' },
        { name: 'NexGen Labs', domain: 'nexgenlabs.dev', views: '5.1K', status: 'published', template: 'bold', bg: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
        { name: 'GrowthWave Agency', domain: 'growthwave.co', views: '890', status: 'draft', template: 'gradient', bg: 'linear-gradient(135deg, #667eea, #764ba2)' },
        { name: 'Sarah Chen Photo', domain: 'sarahchen.studio', views: '3.7K', status: 'published', template: 'minimal', bg: '#fafaf9' },
        { name: 'DJ Pulse Events', domain: 'djpulse.live', views: '1.2K', status: 'flagged', template: 'neon', bg: '#0a0a0a' },
        { name: 'Peak Fitness', domain: 'peakfit.co', views: '4.5K', status: 'published', template: 'glass', bg: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15))' },
        { name: 'Golden Crust Bakery', domain: 'goldencrust.com', views: '1.8K', status: 'published', template: 'minimal', bg: 'linear-gradient(135deg, #fef3c7, #fde68a)' },
        { name: 'Code Academy Pro', domain: 'codeacademy.dev', views: '6.2K', status: 'published', template: 'bold', bg: 'linear-gradient(135deg, #0f172a, #1e293b)' },
        { name: 'Sunset Travel', domain: 'sunset.travel', views: '950', status: 'draft', template: 'gradient', bg: 'linear-gradient(135deg, #f97316, #ea580c)' },
    ];

    const grid = document.getElementById('sitesGrid');
    if (!grid) return;

    grid.innerHTML = sites.map(s => `
        <div class="site-card">
            <div class="site-card-thumb" style="background: ${s.bg};">
                <div style="position:absolute;top:8px;right:8px;">
                    <span class="badge badge-${s.status === 'published' ? 'live' : s.status === 'flagged' ? 'flagged' : 'draft'}">${s.status}</span>
                </div>
            </div>
            <div class="site-card-body">
                <div class="site-card-name">${s.name}</div>
                <div class="site-card-domain">${s.domain}</div>
                <div class="site-card-stats">
                    <span>👁️ ${s.views} views</span>
                    <span>🎨 ${s.template}</span>
                </div>
                <div class="site-card-actions">
                    ${s.status === 'published' ? 
                        `<button class="btn btn-ghost btn-sm" onclick="this.textContent='Unpublished'; this.style.color='var(--warning)'">Unpublish</button>` :
                        s.status === 'flagged' ?
                        `<button class="btn btn-success btn-sm" onclick="this.textContent='Approved'; this.disabled=true">Approve</button>
                         <button class="btn btn-danger btn-sm" onclick="this.closest('.site-card').style.opacity='0.3'">Remove</button>` :
                        `<button class="btn btn-primary btn-sm" onclick="this.textContent='Published!'; this.disabled=true">Publish</button>`
                    }
                    <button class="btn btn-ghost btn-sm">View</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ---- Populate Domains ----
function populateDomains() {
    // Approval queue
    const approvals = [
        { domain: 'luxuryinteriors.com', user: 'Sarah Chen', cost: '$8.56', registrar: 'Porkbun' },
        { domain: 'techvault.io', user: 'David Wu', cost: '$28.88', registrar: 'Porkbun' },
        { domain: 'zenspace.yoga', user: 'Ana Rodriguez', cost: '$24.99', registrar: 'Porkbun' },
        { domain: 'creativestudio.co', user: 'Emma Davis', cost: '$11.49', registrar: 'Namecheap' },
        { domain: 'freshbakes.com', user: 'Lisa Park', cost: '$8.56', registrar: 'Porkbun' },
    ];

    const queue = document.getElementById('approvalQueue');
    if (queue) {
        queue.innerHTML = approvals.map(a => `
            <div class="approval-card" id="approval-${a.domain.replace('.','_')}">
                <div class="approval-info">
                    <div class="approval-domain">${a.domain}</div>
                    <div class="approval-detail">Requested by ${a.user} · ${a.registrar}</div>
                </div>
                <span class="approval-cost">${a.cost}</span>
                <div class="approval-actions">
                    <button class="btn btn-success btn-sm" onclick="approveDomain('${a.domain}', this)">✓ Approve</button>
                    <button class="btn btn-danger btn-sm" onclick="rejectDomain('${a.domain}', this)">✗ Reject</button>
                </div>
            </div>
        `).join('');
    }

    // All domains table
    const domains = [
        { domain: 'zenflow.yoga', registrar: 'Porkbun', cost: '$24.99/yr', dns: 'Active', expires: 'Mar 2026', owner: 'Ana Rodriguez' },
        { domain: 'nexgenlabs.dev', registrar: 'Porkbun', cost: '$10.18/yr', dns: 'Active', expires: 'Jan 2026', owner: 'David Wu' },
        { domain: 'sarahchen.studio', registrar: 'Porkbun', cost: '$19.99/yr', dns: 'Active', expires: 'Feb 2026', owner: 'Sarah Chen' },
        { domain: 'peakfit.co', registrar: 'Namecheap', cost: '$11.49/yr', dns: 'Active', expires: 'Apr 2026', owner: 'Alex Turner' },
        { domain: 'goldencrust.com', registrar: 'Porkbun', cost: '$8.56/yr', dns: 'Active', expires: 'Dec 2025', owner: 'Lisa Park' },
        { domain: 'growthwave.co', registrar: 'Namecheap', cost: '$11.49/yr', dns: 'Pending', expires: 'May 2026', owner: 'James Morgan' },
    ];

    const tbody = document.getElementById('domainsTableBody');
    if (tbody) {
        tbody.innerHTML = domains.map(d => `
            <tr>
                <td><strong>${d.domain}</strong></td>
                <td>${d.registrar}</td>
                <td>${d.cost}</td>
                <td><span class="badge badge-${d.dns === 'Active' ? 'live' : 'warning'}">${d.dns}</span></td>
                <td style="color:var(--text-muted);">${d.expires}</td>
                <td>${d.owner}</td>
            </tr>
        `).join('');
    }
}

function approveDomain(domain, btn) {
    const card = btn.closest('.approval-card');
    card.style.borderColor = 'rgba(16,185,129,0.3)';
    card.style.background = 'rgba(16,185,129,0.05)';
    card.querySelector('.approval-actions').innerHTML = '<span class="badge badge-live">✅ Approved</span>';
    showToast(`Domain ${domain} approved and registration started`);
}

function rejectDomain(domain, btn) {
    const card = btn.closest('.approval-card');
    card.style.opacity = '0.3';
    card.querySelector('.approval-actions').innerHTML = '<span class="badge badge-flagged">❌ Rejected</span>';
    showToast(`Domain ${domain} rejected`);
}

// ---- Populate Moderation ----
function populateModeration() {
    const items = [
        { name: 'DJ Pulse Events', reason: 'Auto-flagged: Potentially inappropriate content', preview: '#0a0a0a', border: 'rgba(255,0,255,0.3)' },
        { name: 'Quick Cash Pro', reason: 'User reported: Misleading financial claims', preview: 'linear-gradient(135deg, #f59e0b, #ea580c)', border: 'rgba(245,158,11,0.3)' },
        { name: 'SupplementKing', reason: 'Auto-flagged: Health claims without disclaimer', preview: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'rgba(34,197,94,0.3)' },
    ];

    const queue = document.getElementById('moderationQueue');
    if (queue) {
        queue.innerHTML = items.map(item => `
            <div class="moderation-card">
                <div class="moderation-preview" style="background:${item.preview}; border: 1px solid ${item.border};">
                    [Site Preview: ${item.name}]
                </div>
                <div class="moderation-body">
                    <div class="moderation-info">
                        <h4>${item.name}</h4>
                        <p>⚠️ ${item.reason}</p>
                    </div>
                    <div class="moderation-actions">
                        <button class="btn btn-success btn-sm" onclick="this.textContent='✅ Approved';this.disabled=true;this.closest('.moderation-card').style.borderColor='rgba(16,185,129,0.3)'">Approve</button>
                        <button class="btn btn-danger btn-sm" onclick="this.closest('.moderation-card').style.opacity='0.3'">Reject & Remove</button>
                        <button class="btn btn-ghost btn-sm">View Full Site</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// ---- Populate Feature Flags ----
function populateFeatureFlags() {
    const flags = [
        { id: 'ai_builder', name: 'AI Website Builder', desc: 'GPT-4o-mini content generation', enabled: true, rollout: 100 },
        { id: 'custom_domains', name: 'Custom Domains', desc: 'Porkbun API domain registration', enabled: true, rollout: 100 },
        { id: 'persona_sim', name: 'Persona Simulator', desc: 'CEO/Millennial/GenZ heatmaps', enabled: false, rollout: 0 },
        { id: 'three_d_blocks', name: '3D Glassmorphism Blocks', desc: 'Three.js powered 3D elements', enabled: true, rollout: 45 },
        { id: 'auto_images', name: 'AI Image Generation', desc: 'DALL-E 3 niche visuals', enabled: true, rollout: 80 },
        { id: 'referral_engine', name: 'Viral Referral Engine', desc: 'Share → 30 days pro', enabled: false, rollout: 0 },
        { id: 'a_b_testing', name: 'A/B Testing', desc: 'Automatic landing page variants', enabled: true, rollout: 25 },
        { id: 'dark_mode', name: 'Site Dark Mode', desc: 'Dark mode toggle for published sites', enabled: true, rollout: 100 },
    ];

    const list = document.getElementById('featuresList');
    if (list) {
        list.innerHTML = flags.map(f => `
            <div class="feature-flag">
                <div class="feature-info">
                    <div class="feature-name">${f.name}</div>
                    <div class="feature-desc">${f.desc}</div>
                </div>
                <div class="feature-rollout">
                    <input type="range" min="0" max="100" value="${f.rollout}" 
                           oninput="this.nextElementSibling.textContent = this.value + '%'"
                           ${!f.enabled ? 'disabled' : ''}>
                    <span class="feature-pct">${f.rollout}%</span>
                </div>
                <label class="toggle">
                    <input type="checkbox" ${f.enabled ? 'checked' : ''} 
                           onchange="showToast('${f.name} ' + (this.checked ? 'enabled' : 'disabled'));
                                     this.closest('.feature-flag').querySelector('input[type=range]').disabled = !this.checked;">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `).join('');
    }
}

// ---- Toast Notification ----
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✅</span> ${message}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: var(--bg-elevated);
        border: 1px solid var(--border-light);
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 0.88rem;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 10000;
        animation: slideUp 0.3s ease;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = '0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add toast animation
const style = document.createElement('style');
style.textContent = `@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);
