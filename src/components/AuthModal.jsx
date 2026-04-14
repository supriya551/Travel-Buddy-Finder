import { useEffect } from 'react';
import LoginForm from './LoginForm.jsx';
import SignupForm from './SignupForm.jsx';

export default function AuthModal({ isOpen, activeTab, onTabSwitch, onClose, onSuccess }) {
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

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-tabs">
          <button className={`modal-tab${activeTab === 'login' ? ' active' : ''}`} onClick={() => onTabSwitch('login')}>Login</button>
          <button className={`modal-tab${activeTab === 'signup' ? ' active' : ''}`} onClick={() => onTabSwitch('signup')}>Sign Up</button>
        </div>
        {activeTab === 'login'
          ? <LoginForm  onSuccess={onSuccess} onSwitchToSignup={() => onTabSwitch('signup')} />
          : <SignupForm onSuccess={onSuccess} onSwitchToLogin={() => onTabSwitch('login')} />
        }
      </div>
    </div>
  );
}
