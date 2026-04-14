import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import AuthModal from '../components/AuthModal.jsx';
import '../../style.css';

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const exploreRef = useRef(null);
  const navigate   = useNavigate();

  function openModal(tab = 'login') { setActiveTab(tab); setModalOpen(true); }
  function closeModal()             { setModalOpen(false); }

  function handleExploreClick(e) {
    e.preventDefault();
    exploreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleAuthSuccess() {
    closeModal();
    navigate('/dashboard');
  }

  return (
    <>
      <Navbar onOpenLogin={() => openModal('login')} onOpenSignup={() => openModal('signup')} onExploreClick={handleExploreClick} />

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-bg-map"></div>
        <div className="hero-container">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Explore the world together
            </div>
            <h1 className="hero-title">
              Find your perfect<br />
              <span className="hero-accent">travel companion</span><br />
              anywhere
            </h1>
            <p className="hero-sub">
              Connect with like-minded travelers heading to the same destination.
              Share experiences, split costs, and make memories that last a lifetime.
            </p>
            <div className="hero-actions">
              <a href="#" className="btn-primary" onClick={(e) => { e.preventDefault(); openModal('signup'); }}>Get Started</a>
              <a href="#explore" className="btn-ghost" onClick={handleExploreClick}>
                <span className="play-icon">▶</span> See How It Works
              </a>
            </div>
          </div>
          <div className="hero-right">
            <div className="img-card img-card--top">
              <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80" alt="Mountain traveler" />
              <div className="img-tag img-tag--location"><span>📍</span> Patagonia, Argentina</div>
            </div>
            <div className="img-card img-card--bottom">
              <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80" alt="Travel adventure" />
              <div className="img-tag img-tag--buddy"><span>👥</span> 3 buddies matched</div>
            </div>
            <div className="floating-card">
              <div className="fc-avatar">✈</div>
              <div className="fc-text">
                <span className="fc-name">New match!</span>
                <span className="fc-dest">Tokyo → Kyoto</span>
              </div>
            </div>
          </div>
        </div>
        <div className="dest-strip">
          {['🏔 Adventure','🏖 Beach','🏙 City Breaks','🌿 Nature','🎭 Culture','🍜 Food Tours'].map(b => (
            <div className="dest-badge" key={b}>{b}</div>
          ))}
        </div>
      </section>

      {/* EXPLORE */}
      <section className="explore" id="explore" ref={exploreRef}>
        <div className="section-container">
          <div className="section-label">Why Travel Buddy?</div>
          <h2 className="section-title">Travel smarter,<br /><span className="hero-accent">not alone</span></h2>
          <p className="section-sub">Everything you need to find the right travel companion — safely and effortlessly.</p>
          <div className="features-grid">
            {[
              { icon:'🔍', title:'Smart Matching',       desc:'Our algorithm pairs you with travelers who share your style, budget, and destination — no awkward mismatches.', highlight: false },
              { icon:'🛡️', title:'Verified Profiles',    desc:'Every user goes through identity verification so you always know who you\'re traveling with.', highlight: true },
              { icon:'💬', title:'In-App Messaging',     desc:'Plan your trip together with built-in chat. Share itineraries, tips, and excitement before you even board.', highlight: false },
              { icon:'💸', title:'Split Costs',          desc:'Accommodation, transport, tours — split everything fairly and travel further for less.', highlight: false },
              { icon:'🗺️', title:'Destination Explorer', desc:'Browse trending destinations and see how many travelers are heading there right now.', highlight: true },
              { icon:'⭐', title:'Reviews & Ratings',    desc:'After every trip, leave honest reviews. Build your traveler reputation and trust score.', highlight: false },
            ].map(f => (
              <div className={`feature-card${f.highlight ? ' feature-card--highlight' : ''}`} key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="section-container">
          <div className="section-label">The Process</div>
          <h2 className="section-title">Three steps to your<br /><span className="hero-accent">next adventure</span></h2>
          <div className="steps">
            <div className="step"><div className="step-num">01</div><h3>Create your profile</h3><p>Tell us your travel style, preferred destinations, budget range, and what kind of buddy you're looking for.</p></div>
            <div className="step-arrow">→</div>
            <div className="step"><div className="step-num">02</div><h3>Get matched</h3><p>Browse curated matches or let our algorithm find the perfect travel companion for your next trip.</p></div>
            <div className="step-arrow">→</div>
            <div className="step"><div className="step-num">03</div><h3>Travel together</h3><p>Connect, plan, and set off. Share the journey and come back with stories — and a new friend.</p></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="section-container cta-inner">
          <h2>Ready to find your<br /><span className="hero-accent">travel buddy?</span></h2>
          <p>Join thousands of travelers already connecting on the platform.</p>
          <div className="cta-actions">
            <a href="#" className="btn-primary" onClick={(e) => { e.preventDefault(); openModal('signup'); }}>Create Free Account</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-nav">
        <div className="footer-container">
          <a href="#" className="logo logo--footer">
            <span className="logo-icon">✈</span>
            <span>travel<span className="logo-accent">buddy</span></span>
          </a>
          <ul className="footer-links">
            <li><a href="#" className="nav-link active">Home</a></li>
            <li><a href="#explore" className="nav-link" onClick={handleExploreClick}>Explore</a></li>
            <li><a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); openModal('login'); }}>Login</a></li>
            <li><a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); openModal('signup'); }}>Sign Up</a></li>
          </ul>
          <p className="footer-copy">© 2026 TravelBuddy. All rights reserved.</p>
        </div>
      </footer>

      <AuthModal
        isOpen={modalOpen}
        activeTab={activeTab}
        onTabSwitch={setActiveTab}
        onClose={closeModal}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
