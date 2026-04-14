/* ── Reset & Base ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #ffffff;
  --bg2:       #f7f8fa;
  --bg3:       #f0f2f5;
  --card:      #ffffff;
  --card2:     #f4f5f8;
  --border:    #e2e4ea;
  --accent:    #2d5f8a;
  --accent2:   #4a7fa5;
  --text:      #1a1a2e;
  --text-muted:#6b7280;
  --white:     #ffffff;
  --radius:    14px;
  --radius-sm: 8px;
}

html { scroll-behavior: smooth; overflow-y: auto; }

body {
  font-family: 'Inter', sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  overflow-x: hidden;
  overflow-y: auto;
}

a { text-decoration: none; color: inherit; }
ul { list-style: none; }
img { display: block; width: 100%; height: 100%; object-fit: cover; }

/* ── Navbar ── */
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text);
}
.logo-icon { font-size: 1.1rem; }
.logo-accent { color: var(--accent2); }

.nav-links {
  display: flex;
  gap: 2rem;
  margin-left: auto;
}

.nav-link {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-muted);
  transition: color 0.2s;
  position: relative;
}
.nav-link:hover, .nav-link.active { color: var(--text); }
.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -4px; left: 0; right: 0;
  height: 2px;
  background: var(--accent2);
  border-radius: 2px;
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 2rem;
}

.btn-login {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 8px 20px;
  border: 1.5px solid var(--border);
  color: var(--text);
  border-radius: 50px;
  transition: border-color 0.2s, color 0.2s;
}
.btn-login:hover { border-color: var(--accent2); color: var(--accent2); }

.btn-signup {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 8px 20px;
  background: var(--accent);
  color: var(--white);
  border-radius: 50px;
  transition: background 0.2s, transform 0.15s;
}
.btn-signup:hover { background: var(--accent2); transform: translateY(-1px); }

/* ── Buttons ── */
.btn-primary {
  display: inline-block;
  padding: 12px 28px;
  background: var(--accent);
  color: var(--white);
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 50px;
  transition: background 0.2s, transform 0.15s;
}
.btn-primary:hover { background: var(--accent2); transform: translateY(-2px); }

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
}
.btn-ghost:hover { color: var(--text); }
.play-icon {
  width: 32px; height: 32px;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6rem;
}

/* ── Hero ── */
.hero {
  min-height: 100vh;
  padding-top: 64px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  background: var(--bg);
}

.hero-bg-map {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 50% at 70% 40%, rgba(74,127,165,0.06) 0%, transparent 70%),
    radial-gradient(ellipse 40% 40% at 20% 60%, rgba(74,127,165,0.04) 0%, transparent 60%);
  pointer-events: none;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 5rem 2rem 3rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

/* Left */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 50px;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}
.badge-dot {
  width: 7px; height: 7px;
  background: var(--accent2);
  border-radius: 50%;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.hero-title {
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -1.5px;
  color: var(--text);
  margin-bottom: 1.2rem;
}
.hero-accent { color: var(--accent2); }

.hero-sub {
  font-size: 1rem;
  color: var(--text-muted);
  max-width: 440px;
  margin-bottom: 2rem;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* Right — image cards */
.hero-right {
  position: relative;
  height: 420px;
}

.img-card {
  position: absolute;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
}
.img-card img { width: 100%; height: 100%; object-fit: cover; }

.img-card--top {
  width: 240px; height: 300px;
  top: 0; left: 10%;
}
.img-card--bottom {
  width: 220px; height: 240px;
  bottom: 0; right: 5%;
}

.img-tag {
  position: absolute;
  bottom: 12px; left: 12px;
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border);
  border-radius: 50px;
  font-size: 0.75rem;
  color: var(--text);
}

.floating-card {
  position: absolute;
  top: 30%; right: 0;
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.fc-avatar { font-size: 1.4rem; }
.fc-text { display: flex; flex-direction: column; }
.fc-name { font-size: 0.8rem; font-weight: 600; color: var(--text); }
.fc-dest { font-size: 0.72rem; color: var(--text-muted); }

/* Destination strip */
.dest-strip {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 2rem 3rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.dest-badge {
  padding: 8px 18px;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 50px;
  font-size: 0.82rem;
  color: var(--text-muted);
  transition: border-color 0.2s, color 0.2s;
  cursor: pointer;
}
.dest-badge:hover { border-color: var(--accent); color: var(--text); }

/* ── Sections shared ── */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 2rem;
}

.section-label {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--accent2);
  margin-bottom: 1rem;
}

.section-title {
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -1px;
  color: var(--text);
  margin-bottom: 1rem;
  line-height: 1.2;
}

.section-sub {
  font-size: 1rem;
  color: var(--text-muted);
  max-width: 500px;
  margin-bottom: 3.5rem;
}

/* ── Explore / Features ── */
.explore { background: var(--bg2); }

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.feature-card {
  padding: 2rem;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}
.feature-card:hover {
  border-color: var(--accent2);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(74,127,165,0.1);
}
.feature-card--highlight {
  background: var(--bg3);
  border-color: rgba(74,127,165,0.25);
}

.feature-icon { font-size: 1.8rem; margin-bottom: 1rem; }
.feature-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.6rem;
}
.feature-card p { font-size: 0.875rem; color: var(--text-muted); line-height: 1.65; }

/* ── How It Works ── */
.how-it-works { background: var(--bg3); }

.steps {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.step {
  flex: 1;
  padding: 2rem;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.step-num {
  font-size: 2.5rem;
  font-weight: 800;
  color: rgba(74,127,165,0.2);
  margin-bottom: 1rem;
  line-height: 1;
}
.step h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.6rem;
}
.step p { font-size: 0.875rem; color: var(--text-muted); line-height: 1.65; }

.step-arrow {
  font-size: 1.5rem;
  color: var(--border);
  padding-top: 2.5rem;
  flex-shrink: 0;
}

/* ── CTA ── */
.cta-section {
  background: var(--bg2);
  border-top: 1px solid var(--border);
}
.cta-inner {
  text-align: center;
  padding-top: 5rem;
  padding-bottom: 5rem;
}
.cta-inner h2 {
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -1px;
  color: var(--text);
  margin-bottom: 1rem;
  line-height: 1.2;
}
.cta-inner p { color: var(--text-muted); margin-bottom: 2rem; }
.cta-actions { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }

/* ── Footer Navbar ── */
.footer-nav {
  background: var(--bg);
  border-top: 1px solid var(--border);
  padding: 2rem 0;
}
.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}
.logo--footer { font-size: 1rem; }
.footer-links {
  display: flex;
  gap: 2rem;
  margin-left: auto;
}
.footer-copy {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-left: auto;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .hero-container { grid-template-columns: 1fr; gap: 3rem; }
  .hero-right { height: 320px; }
  .img-card--top { width: 180px; height: 230px; }
  .img-card--bottom { width: 170px; height: 190px; }
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .steps { flex-direction: column; }
  .step-arrow { transform: rotate(90deg); align-self: center; padding-top: 0; }
}

@media (max-width: 600px) {
  .nav-links { display: none; }
  .features-grid { grid-template-columns: 1fr; }
  .footer-links { gap: 1rem; }
  .footer-copy { margin-left: 0; width: 100%; }
}

/* ── Auth Modal ── */
.modal-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(4px);
  z-index: 200;
  align-items: center;
  justify-content: center;
}
.modal-overlay.open { display: flex; }

.modal {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  position: relative;
  box-shadow: 0 24px 64px rgba(0,0,0,0.15);
  animation: slideUp 0.25s ease;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.modal-close {
  position: absolute;
  top: 1.2rem; right: 1.2rem;
  background: var(--bg3);
  border: none;
  border-radius: 50%;
  width: 32px; height: 32px;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--text-muted);
  transition: background 0.2s;
}
.modal-close:hover { background: var(--border); }

.modal-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.8rem;
  background: var(--bg3);
  border-radius: 50px;
  padding: 4px;
}
.modal-tab {
  flex: 1;
  padding: 8px;
  border: none;
  background: transparent;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.modal-tab.active {
  background: var(--white);
  color: var(--text);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.auth-form h2 {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 0.3rem;
}
.form-sub { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem; }

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 1rem;
}
.form-group label { font-size: 0.82rem; font-weight: 600; color: var(--text); }
.form-group input {
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--text);
  background: var(--bg);
  outline: none;
  transition: border-color 0.2s;
}
.form-group input:focus { border-color: var(--accent2); }

.btn-full { width: 100%; text-align: center; margin-top: 0.5rem; }

.form-switch {
  font-size: 0.82rem;
  color: var(--text-muted);
  text-align: center;
  margin-top: 1rem;
}
.form-switch a { color: var(--accent2); font-weight: 600; }

.hidden { display: none !important; }

/* ── Auth error messages ── */
.auth-error {
  color: #dc2626;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
}
