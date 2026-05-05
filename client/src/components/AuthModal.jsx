import { useState, useEffect } from 'react';
import LoginForm  from './LoginForm.jsx';
import SignupForm from './SignupForm.jsx';
import OtpForm   from './OtpForm.jsx';

export default function AuthModal({ isOpen, activeTab, onTabSwitch, onClose, onSuccess }) {
  const [view,     setView]     = useState(activeTab || 'login'); // 'login' | 'signup' | 'otp'
  const [otpEmail, setOtpEmail] = useState('');

  // Sync view with activeTab prop when modal opens
  useEffect(() => {
    if (isOpen) setView(activeTab || 'login');
  }, [isOpen, activeTab]);

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSignupSuccess({ email }) {
    setOtpEmail(email);
    setView('otp');
  }

  function handleTabSwitch(tab) {
    setView(tab);
    onTabSwitch?.(tab);
  }

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Hide tabs during OTP step */}
        {view !== 'otp' && (
          <div className="modal-tabs">
            <button className={`modal-tab${view === 'login'  ? ' active' : ''}`} onClick={() => handleTabSwitch('login')}>Login</button>
            <button className={`modal-tab${view === 'signup' ? ' active' : ''}`} onClick={() => handleTabSwitch('signup')}>Sign Up</button>
          </div>
        )}

        {view === 'login'  && <LoginForm  onSuccess={onSuccess} onSwitchToSignup={() => handleTabSwitch('signup')} />}
        {view === 'signup' && <SignupForm onSuccess={handleSignupSuccess} onSwitchToLogin={() => handleTabSwitch('login')} />}
        {view === 'otp'    && <OtpForm   email={otpEmail} onSuccess={onSuccess} onBack={() => setView('signup')} />}
      </div>
    </div>
  );
}
