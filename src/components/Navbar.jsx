import { useEffect, useRef } from 'react';

export default function Navbar({ onOpenLogin, onOpenSignup, onExploreClick }) {
  const navRef = useRef(null);

  useEffect(() => {
    function onScroll() {
      if (navRef.current)
        navRef.current.style.boxShadow = window.scrollY > 10 ? '0 4px 24px rgba(0,0,0,0.08)' : 'none';
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="navbar" ref={navRef} id="top-navbar">
      <div className="nav-container">
        <a href="#" className="logo">
          <span className="logo-icon">✈</span>
          <span>travel<span className="logo-accent">buddy</span></span>
        </a>
        <ul className="nav-links">
          <li><a href="#" className="nav-link active">Home</a></li>
          <li><a href="#explore" className="nav-link" onClick={onExploreClick}>Explore</a></li>
        </ul>
        <div className="nav-auth">
          <a href="#" className="btn-login" onClick={(e) => { e.preventDefault(); onOpenLogin(); }}>Login</a>
          <a href="#" className="btn-signup" onClick={(e) => { e.preventDefault(); onOpenSignup(); }}>Sign Up</a>
        </div>
      </div>
    </nav>
  );
}
