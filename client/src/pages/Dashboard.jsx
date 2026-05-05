import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, clearSession } from '../utils/auth.js';
import { fetchMatches, connectUser, fetchMyTrips, createTrip, fetchTrips, joinTrip } from '../utils/api.js';
import Chat from '../components/Chat.jsx';
import '../../dashboard.css';

const PANEL_TITLES = {
  home: 'Plan your next trip', create: 'Create a Trip',
  mytrips: 'My Trips', join: 'Join a Trip',
  chat: 'Messages', explore: 'Explore Destinations', filter: 'Filter Trips',
  profile: 'My Profile', settings: 'Settings',
};

// ── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activePanel, onSwitch, collapsed, session, onLogout }) {
  const links = [
    { panel: 'home',    label: '⌂ Home' },
    { panel: 'mytrips', label: '⊞ My Trips' },
    { panel: 'join',    label: '⊕ Join a Trip' },
    { panel: 'chat',    label: '✉ Chat', badge: 3 },
  ];
  const discover = [
    { panel: 'explore', label: '◎ Explore' },
    { panel: 'filter',  label: '⊟ Filter Trips' },
  ];

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar-top">
        <a href="/" className="logo"><span className="logo-icon">✈</span>travel<span className="logo-accent">buddy</span></a>
        <a href="#" className="btn-create-trip sidebar-link" onClick={(e) => { e.preventDefault(); onSwitch('create'); }}>+ Create Trip</a>
        <nav className="sidebar-nav">
          <p className="nav-label">Menu</p>
          {links.map(l => (
            <a key={l.panel} href="#" className={`sidebar-link${activePanel === l.panel ? ' active' : ''}`}
              onClick={(e) => { e.preventDefault(); onSwitch(l.panel); }}>
              {l.label}
              {l.badge && <span className="badge">{l.badge}</span>}
            </a>
          ))}
          <p className="nav-label" style={{ marginTop: '1.5rem' }}>Discover</p>
          {discover.map(l => (
            <a key={l.panel} href="#" className={`sidebar-link${activePanel === l.panel ? ' active' : ''}`}
              onClick={(e) => { e.preventDefault(); onSwitch(l.panel); }}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="sidebar-bottom">
        <a href="#" className="sidebar-link logout-link" onClick={(e) => { e.preventDefault(); onLogout(); }}>⎋ Logout</a>
      </div>
    </aside>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ activePanel, profile, sidebarCollapsed, onToggleSidebar, onSwitch }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const navigate = useNavigate();

  function doLogout() { clearSession(); navigate('/'); }

  useEffect(() => {
    function close() { setProfileOpen(false); setNotifOpen(false); }
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  return (
    <header className="dash-header">
      <h1 className="page-title">{PANEL_TITLES[activePanel]}</h1>
      <div className="header-right">
        <button className={`icon-btn${!sidebarCollapsed ? ' active' : ''}`} onClick={onToggleSidebar} title="Toggle sidebar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
        </button>
        <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setNotifOpen(o => !o); setProfileOpen(false); }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span className="notif-dot"></span>
        </button>
        <div className="profile-chip" onClick={(e) => { e.stopPropagation(); setProfileOpen(o => !o); setNotifOpen(false); }}>
          {profile?.avatar
            ? <img src={profile.avatar} alt="avatar" className="avatar avatar--img" />
            : <div className="avatar">{profile?.name?.[0]?.toUpperCase()}</div>
          }
          <span className="profile-name">{profile?.name}</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        {profileOpen && (
          <div className="profile-dropdown">
            <a href="#" onClick={(e) => { e.preventDefault(); setProfileOpen(false); onSwitch('profile'); }}>View Profile</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setProfileOpen(false); onSwitch('settings'); }}>Settings</a>
            <a href="#" onClick={(e) => { e.preventDefault(); doLogout(); }}>Logout</a>
          </div>
        )}
      </div>
      {notifOpen && (
        <div className="notif-dropdown" onClick={(e) => e.stopPropagation()}>
          <h4>Notifications</h4>
          <div className="notif-item"><div className="notif-dot-icon"></div><div><p>Arjun S. wants to buddy up for Bali</p><span className="notif-time">2 min ago</span></div></div>
          <div className="notif-item"><div className="notif-dot-icon"></div><div><p>Your Tokyo trip has a new match</p><span className="notif-time">1 hr ago</span></div></div>
          <div className="notif-item"><div className="notif-dot-icon"></div><div><p>Lena M. sent you a message</p><span className="notif-time">3 hr ago</span></div></div>
        </div>
      )}
    </header>
  );
}

// ── Panel: Home ───────────────────────────────────────────────────────────────
function PanelHome({ onSwitch, searchQuery, setSearchQuery }) {
  const [search, setSearch] = useState('');
  const [matches, setMatches] = useState([]);
  const [connects, setConnects] = useState({});
  const [matchesError, setMatchesError] = useState(null);
  const [searchResults, setSearchResults] = useState(null); // null = not searched yet
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchMatches()
      .then(data => setMatches(data))
      .catch(() => setMatchesError('Could not load buddy matches.'));
  }, []);

  async function handleSearchKey(e) {
    if (e.key === 'Enter' && search.trim().length > 0) {
      setSearchLoading(true);
      try {
        const results = await fetchTrips({ destination: search.trim() });
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }
    if (e.key === 'Escape') {
      setSearch('');
      setSearchResults(null);
    }
  }

  function clearSearch() {
    setSearch('');
    setSearchResults(null);
  }

  async function handleConnect(match) {
    try {
      await connectUser(match.id);
      setConnects(c => ({ ...c, [match.id]: true }));
    } catch (err) {
      if (err.status === 409) {
        setConnects(c => ({ ...c, [match.id]: true }));
      }
    }
  }

  return (
    <section className="panel active">
      <div className="home-search-bar" style={{ position: 'relative' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Search destinations, trips, buddies..." value={search}
          onChange={e => { setSearch(e.target.value); if (!e.target.value) setSearchResults(null); }}
          onKeyDown={handleSearchKey} />
        {search && (
          <button onClick={clearSearch} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '1rem', padding: 0 }}>✕</button>
        )}
      </div>

      {/* Inline search results */}
      {searchLoading && (
        <p className="panel-loading" style={{ marginBottom: '1rem' }}>Searching…</p>
      )}
      {searchResults !== null && !searchLoading && (
        <div className="section-block" style={{ marginBottom: '1.5rem' }}>
          <div className="block-header">
            <h2>Search results for "{search}"</h2>
            <a href="#" className="see-all" onClick={e => { e.preventDefault(); clearSearch(); }}>Clear</a>
          </div>
          {searchResults.length === 0 ? (
            <p className="panel-empty">No trips found for "{search}".</p>
          ) : (
            <div className="join-list" style={{ marginTop: '0.75rem' }}>
              {searchResults.map(t => {
                const start = t.startDate ? new Date(t.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
                const end   = t.endDate   ? new Date(t.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                return (
                  <div className="join-card" key={t.id}>
                    <div className="jc-body">
                      <h3>{t.title || t.destination}</h3>
                      <p>{start}{end ? ` – ${end}` : ''}</p>
                      <div className="trip-meta"><span>${t.budget}</span><span>{t.destination}</span></div>
                      {t.styles?.length > 0 && <div className="dest-tags">{t.styles.map(s => <span key={s}>{s}</span>)}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      <div className="panel-grid">
        <div className="col-main">
          {/* Travelers heading out */}
          <div className="section-block">
            <div className="block-header"><h2>Travelers heading out soon</h2><a href="#" className="see-all">See all</a></div>
            <div className="traveler-row">
              {[{img:'1506905925346-21bda4d32df4',u:'A',lbl:'Alps, Switzerland'},{img:'1493976040374-85c8e12f0c0e',u:'R',lbl:'Kyoto, Japan'},{img:'1524492412937-b28074a5d7da',u:'M',lbl:'Jaipur, India'},{img:'1499856871958-5b9627545d1a',u:'L',lbl:'Paris, France'},{img:'1518548419970-58e3b4079ab2',u:'K',lbl:'Santorini, Greece'}].map(t => (
                <div className="traveler-card" key={t.lbl}>
                  <img src={`https://images.unsplash.com/photo-${t.img}?w=200&q=80`} alt={t.lbl} />
                  <div className="tc-user">{t.u}</div>
                  <div className="tc-label">{t.lbl}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Upcoming Trips */}
          <div className="section-block">
            <div className="block-header"><h2>Upcoming Trips</h2><a href="#" className="see-all" onClick={(e)=>{e.preventDefault();onSwitch('mytrips')}}>View all</a></div>
            <div className="trip-cards-row">
              <div className="trip-card">
                <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80" alt="Tokyo" />
                <div className="trip-card-body">
                  <div className="trip-dates"><span className="date-chip">14 Jan</span><span className="date-chip">28 Jan</span></div>
                  <h3>Tokyo to Kyoto</h3><p>Japan · 14 days</p>
                  <div className="trip-meta"><span>$1,400</span><div className="buddy-avatars"><div className="ba">R</div><div className="ba">S</div></div></div>
                </div>
              </div>
              <div className="trip-card">
                <img src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80" alt="India" />
                <div className="trip-card-body">
                  <div className="trip-dates"><span className="date-chip">3 Mar</span><span className="date-chip">10 Mar</span></div>
                  <h3>Delhi to Jaipur</h3><p>India · 7 days</p>
                  <div className="trip-meta"><span>$620</span><div className="buddy-avatars"><div className="ba">M</div></div></div>
                </div>
              </div>
            </div>
          </div>
          {/* Suggested */}
          <div className="section-block">
            <div className="block-header"><h2>Suggested for you</h2><a href="#" className="see-all" onClick={(e)=>{e.preventDefault();onSwitch('explore')}}>Explore more</a></div>
            <div className="dest-list">
              {[{img:'1499856871958-5b9627545d1a',title:'Eiffel Tower, Paris',desc:'An iconic landmark with stunning city views and vibrant surroundings.',tags:['Culture','Photography','City']},{img:'1518548419970-58e3b4079ab2',title:'Oia, Santorini',desc:'White-washed cliffs, blue domes, and breathtaking sunsets over the Aegean.',tags:['Beach','Sunsets','Food']}].map(d => (
                <div className="dest-row" key={d.title}>
                  <img src={`https://images.unsplash.com/photo-${d.img}?w=120&q=80`} alt={d.title} />
                  <div className="dest-info">
                    <h4>{d.title}</h4><p>{d.desc}</p>
                    <div className="dest-tags">{d.tags.map(t=><span key={t}>{t}</span>)}</div>
                  </div>
                  <div className="dest-actions">
                    <button className="icon-btn-sm" title="Save"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
                    <button className="icon-btn-sm" title="View"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Right col */}
        <div className="col-side">
          <div className="side-card">
            <h3>New Buddy Matches</h3>
            <div className="match-list">
              {matchesError ? (
                <p className="panel-error">{matchesError}</p>
              ) : matches.length === 0 ? (
                <p className="panel-empty">No buddy matches yet. Create a trip to find travel companions!</p>
              ) : (
                matches.map(m => (
                  <div className="match-row" key={m.id}>
                    <div className="match-avatar">{m.name?.[0]?.toUpperCase()}</div>
                    <div className="match-info">
                      <span className="match-name">{m.name}</span>
                      <span className="match-dest">{m.matchedDestination}</span>
                    </div>
                    <button className="btn-connect"
                      style={connects[m.id] ? {background:'#16a34a'} : {}}
                      disabled={!!connects[m.id]}
                      onClick={() => handleConnect(m)}>
                      {connects[m.id] ? 'Sent' : 'Connect'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="side-card">
            <h3>Trip Stats</h3>
            <div className="stats-grid">
              {[{n:'2',l:'Upcoming'},{n:'1',l:'Completed'},{n:'3',l:'Buddies'},{n:'5',l:'Countries'}].map(s=>(
                <div className="stat-box" key={s.l}><span className="stat-num">{s.n}</span><span className="stat-lbl">{s.l}</span></div>
              ))}
            </div>
            <div className="stats-extra">
              <div className="stat-bar-row"><span className="stat-bar-lbl">Miles Traveled</span><span className="stat-bar-val">4,820 mi</span></div>
              <div className="stat-bar-track"><div className="stat-bar-fill" style={{width:'62%'}}></div></div>
              <div className="stat-bar-row" style={{marginTop:'0.6rem'}}><span className="stat-bar-lbl">Total Saved</span><span className="stat-bar-val">$340</span></div>
              <div className="stat-bar-track"><div className="stat-bar-fill stat-bar-fill--green" style={{width:'40%'}}></div></div>
              <div className="stat-rating"><span className="stat-bar-lbl">Traveler Rating</span><span className="stat-stars">★★★★★ <span className="stat-bar-val">4.9</span></span></div>
            </div>
          </div>
          <div className="side-card quick-actions-card">
            <h3>Quick Actions</h3>
            <div className="quick-actions-list">
              {[{panel:'create',icon:'✏️',title:'Post a Trip',sub:'Share your next adventure'},{panel:'join',icon:'👥',title:'Find Buddies',sub:'Browse open trips'},{panel:'explore',icon:'🌍',title:'Explore',sub:'Discover destinations'},{panel:'chat',icon:'💬',title:'Messages',sub:'3 unread chats'}].map(q=>(
                <button key={q.panel} className="quick-action-btn" onClick={() => onSwitch(q.panel)}>
                  <span className="qa-icon">{q.icon}</span>
                  <div className="qa-text"><span className="qa-title">{q.title}</span><span className="qa-sub">{q.sub}</span></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Panel: Create Trip ────────────────────────────────────────────────────────
function PanelCreate({ onSwitch }) {
  const [chips, setChips] = useState([]);
  const [form, setForm] = useState({
    from: '', destination: '', startDate: '', endDate: '',
    budget: '', buddiesNeeded: '', description: '', genderPreference: 'any',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function toggleChip(c) { setChips(s => s.includes(c) ? s.filter(x=>x!==c) : [...s,c]); }
  function set(field, val) { setForm(f => ({ ...f, [field]: val })); setError(null); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createTrip({
        title: form.from && form.destination ? `${form.from} to ${form.destination}` : form.destination,
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        budget: Number(form.budget),
        buddiesNeeded: form.buddiesNeeded ? Number(form.buddiesNeeded) : 1,
        description: form.description,
        styles: chips,
        genderPreference: form.genderPreference || 'any',
      });
      onSwitch('mytrips');
    } catch (err) {
      setError(err.message || 'Failed to create trip.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel active">
      <div className="form-panel">
        <h2>Create a New Trip</h2>
        <p className="form-panel-sub">Post your trip and find buddies heading the same way.</p>
        <form className="trip-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label>From</label><input type="text" placeholder="e.g. Mumbai" value={form.from} onChange={e => set('from', e.target.value)} /></div>
            <div className="form-group"><label>Destination *</label><input type="text" placeholder="e.g. Tokyo" value={form.destination} onChange={e => set('destination', e.target.value)} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Start Date *</label><input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} required /></div>
            <div className="form-group"><label>End Date *</label><input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Budget (USD) *</label><input type="number" placeholder="e.g. 1200" value={form.budget} onChange={e => set('budget', e.target.value)} required /></div>
            <div className="form-group"><label>Buddies Needed</label><input type="number" placeholder="e.g. 2" min="1" max="10" value={form.buddiesNeeded} onChange={e => set('buddiesNeeded', e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea rows="3" placeholder="Tell potential buddies about your trip..." value={form.description} onChange={e => set('description', e.target.value)}></textarea></div>
          <div className="form-group">
            <label>Travel Style</label>
            <div className="style-chips">
              {['Adventure','Beach','Culture','Food','Budget','Luxury'].map(c=>(
                <span key={c} className={`style-chip${chips.includes(c)?' selected':''}`} onClick={()=>toggleChip(c)}>{c}</span>
              ))}
            </div>
          </div>
          {error && <p className="panel-error">{error}</p>}
          <button type="submit" className="btn-primary-dash" disabled={loading}>
            {loading ? 'Posting…' : 'Post Trip'}
          </button>
        </form>
      </div>
    </section>
  );
}

// ── Trip Detail Modal ─────────────────────────────────────────────────────────
function TripDetailModal({ trip, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!trip) return null;

  const start = trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
  const end   = trip.endDate   ? new Date(trip.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
  const isUpcoming = new Date(trip.startDate) > new Date();

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: '520px', width: '100%' }}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div style={{ padding: '0.5rem 0 1.25rem' }}>
          <span className={`status-chip status-${isUpcoming ? 'upcoming' : 'past'}`} style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
            {isUpcoming ? 'Upcoming' : 'Completed'}
          </span>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>{trip.title || trip.destination}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>📍 {trip.destination}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div className="trip-detail-stat">
            <span className="trip-detail-label">Start Date</span>
            <span className="trip-detail-value">{start}</span>
          </div>
          <div className="trip-detail-stat">
            <span className="trip-detail-label">End Date</span>
            <span className="trip-detail-value">{end}</span>
          </div>
          <div className="trip-detail-stat">
            <span className="trip-detail-label">Budget</span>
            <span className="trip-detail-value">${trip.budget?.toLocaleString()}</span>
          </div>
          <div className="trip-detail-stat">
            <span className="trip-detail-label">Buddies Needed</span>
            <span className="trip-detail-value">{trip.buddiesNeeded || 1}</span>
          </div>
          <div className="trip-detail-stat">
            <span className="trip-detail-label">Join Requests</span>
            <span className="trip-detail-value">{trip.joinRequests?.length || 0}</span>
          </div>
          <div className="trip-detail-stat">
            <span className="trip-detail-label">Gender Preference</span>
            <span className="trip-detail-value" style={{ textTransform: 'capitalize' }}>{trip.genderPreference || 'Any'}</span>
          </div>
        </div>

        {trip.styles?.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <span className="trip-detail-label">Travel Style</span>
            <div className="dest-tags" style={{ marginTop: '0.4rem' }}>
              {trip.styles.map(s => <span key={s}>{s}</span>)}
            </div>
          </div>
        )}

        {trip.description && (
          <div style={{ marginBottom: '1rem' }}>
            <span className="trip-detail-label">Description</span>
            <p style={{ marginTop: '0.4rem', fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6 }}>{trip.description}</p>
          </div>
        )}

        <button className="btn-primary btn-full" onClick={onClose} style={{ marginTop: '0.5rem' }}>Close</button>
      </div>
    </div>
  );
}

// ── Panel: My Trips ───────────────────────────────────────────────────────────
function PanelMyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    fetchMyTrips()
      .then(data => { setTrips(data); setLoading(false); })
      .catch(err => { setError(err.message || 'Failed to load trips.'); setLoading(false); });
  }, []);

  function tripStatus(startDate) {
    return new Date(startDate) > new Date() ? 'upcoming' : 'past';
  }

  if (loading) return <section className="panel active"><p className="panel-loading">Loading your trips…</p></section>;

  return (
    <section className="panel active">
      <h2 className="panel-heading">My Trips</h2>
      {error && <p className="panel-error">{error}</p>}
      {!error && trips.length === 0 && (
        <p className="panel-empty">You haven't created any trips yet. <a href="#" onClick={e => e.preventDefault()}>Create your first trip!</a></p>
      )}
      <div className="my-trips-grid">
        {trips.map(t => {
          const status = tripStatus(t.startDate);
          const start = t.startDate ? new Date(t.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
          const end   = t.endDate   ? new Date(t.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
          return (
            <div className="my-trip-card" key={t.id}>
              <div className="mtc-body">
                <span className={`status-chip status-${status === 'upcoming' ? 'upcoming' : 'past'}`}>
                  {status === 'upcoming' ? 'Upcoming' : 'Completed'}
                </span>
                <h3>{t.title || t.destination}</h3>
                <p>{start}{end ? ` – ${end}` : ''}{t.destination ? ` · ${t.destination}` : ''}</p>
                <div className="trip-meta">
                  <span>${t.budget}</span>
                  <span>{t.joinRequests?.length || 0} joined</span>
                </div>
                <button className="btn-outline-dash" onClick={() => setSelectedTrip(t)}>View Details</button>
              </div>
            </div>
          );
        })}
      </div>
      {selectedTrip && <TripDetailModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />}
    </section>
  );
}

// ── Panel: Join a Trip ────────────────────────────────────────────────────────
function PanelJoin() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joined, setJoined] = useState({});

  useEffect(() => {
    fetchTrips()
      .then(data => { setTrips(data); setLoading(false); })
      .catch(err => { setError(err.message || 'Failed to load trips.'); setLoading(false); });
  }, []);

  async function handleJoin(trip) {
    try {
      await joinTrip(trip.id);
      setJoined(j => ({ ...j, [trip.id]: true }));
    } catch (err) {
      if (err.status === 409) {
        setJoined(j => ({ ...j, [trip.id]: true }));
      } else {
        setError(err.message || 'Failed to join trip.');
      }
    }
  }

  if (loading) return <section className="panel active"><p className="panel-loading">Loading trips…</p></section>;

  return (
    <section className="panel active">
      <h2 className="panel-heading">Join a Trip</h2>
      {error && <p className="panel-error">{error}</p>}
      {!error && trips.length === 0 && (
        <p className="panel-empty">No trips available right now. Check back soon!</p>
      )}
      <div className="join-list">
        {trips.map(t => {
          const start = t.startDate ? new Date(t.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
          const end   = t.endDate   ? new Date(t.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
          return (
            <div className="join-card" key={t.id}>
              <div className="jc-body">
                <h3>{t.title || t.destination}</h3>
                <p>{start}{end ? ` – ${end}` : ''}</p>
                <div className="trip-meta">
                  <span>${t.budget}</span>
                  <span>{t.buddiesNeeded ? `${t.buddiesNeeded} buddies needed` : ''}</span>
                </div>
                {t.styles?.length > 0 && (
                  <div className="dest-tags">{t.styles.map(s => <span key={s}>{s}</span>)}</div>
                )}
                <p className="jc-host">Destination: <strong>{t.destination}</strong></p>
                <button className="btn-primary-dash join-btn"
                  style={joined[t.id] ? {background:'#16a34a'} : {}}
                  disabled={!!joined[t.id]}
                  onClick={() => handleJoin(t)}>
                  {joined[t.id] ? 'Requested' : 'Request to Join'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Panel: Explore ────────────────────────────────────────────────────────────
function PanelExplore() {
  const cards = [
    {img:'1499856871958-5b9627545d1a',title:'Paris, France',sub:'Culture · Food · Architecture'},
    {img:'1493976040374-85c8e12f0c0e',title:'Kyoto, Japan',sub:'Culture · Nature · History'},
    {img:'1518548419970-58e3b4079ab2',title:'Santorini, Greece',sub:'Beach · Sunsets · Food'},
    {img:'1506905925346-21bda4d32df4',title:'Swiss Alps',sub:'Adventure · Nature · Trekking'},
    {img:'1524492412937-b28074a5d7da',title:'Jaipur, India',sub:'Culture · History · Food'},
    {img:'1537996194471-e657df975ab4',title:'Bali, Indonesia',sub:'Beach · Nature · Wellness'},
  ];
  return (
    <section className="panel active">
      <h2 className="panel-heading">Explore Destinations</h2>
      <div className="explore-grid">
        {cards.map(c=>(
          <div className="explore-card" key={c.title}>
            <img src={`https://images.unsplash.com/photo-${c.img}?w=500&q=80`} alt={c.title} />
            <div className="explore-overlay">
              <h3>{c.title}</h3><p>{c.sub}</p>
              <button className="btn-outline-dash btn-sm">View Trips</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Panel: Filter ─────────────────────────────────────────────────────────────
function PanelFilter({ searchQuery }) {
  const [chips, setChips] = useState([]);
  const [destination, setDestination] = useState(searchQuery || '');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [duration, setDuration] = useState('any');
  const [gender, setGender] = useState('any');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function toggleChip(c) { setChips(s => s.includes(c) ? s.filter(x=>x!==c) : [...s,c]); }

  async function doFetch(dest) {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (dest)      filters.destination = dest;
      if (chips[0])  filters.style = chips[0];
      if (minBudget) filters.minBudget = minBudget;
      if (maxBudget) filters.maxBudget = maxBudget;
      if (duration && duration !== 'any') filters.duration = duration;
      if (gender && gender !== 'any')     filters.gender = gender;
      const data = await fetchTrips(filters);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch trips.');
    } finally {
      setLoading(false);
    }
  }

  // Auto-fire when searchQuery prop is set on mount
  useEffect(() => {
    if (searchQuery) {
      setDestination(searchQuery);
      doFetch(searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  function handleApply(e) {
    e.preventDefault();
    doFetch(destination);
  }

  return (
    <section className="panel active">
      <h2 className="panel-heading">Filter Trips</h2>
      <div className="filter-page">
        <div className="filter-controls">
          <h3>Filters</h3>
          <div className="form-group">
            <label>Destination</label>
            <input type="text" placeholder="Where do you want to go?" value={destination} onChange={e => setDestination(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Travel Style</label>
            <div className="style-chips">
              {['Adventure','Beach','Culture','Food','Budget','Luxury'].map(c=>(
                <span key={c} className={`style-chip${chips.includes(c)?' selected':''}`} onClick={()=>toggleChip(c)}>{c}</span>
              ))}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Min Budget ($)</label><input type="number" placeholder="0" value={minBudget} onChange={e => setMinBudget(e.target.value)} /></div>
            <div className="form-group"><label>Max Budget ($)</label><input type="number" placeholder="5000" value={maxBudget} onChange={e => setMaxBudget(e.target.value)} /></div>
          </div>
          <div className="form-group">
            <label>Duration</label>
            <select className="filter-select" style={{width:'100%'}} value={duration} onChange={e => setDuration(e.target.value)}>
              <option value="any">Any</option>
              <option value="weekend">Weekend (1-3 days)</option>
              <option value="short">Short (4-7 days)</option>
              <option value="medium">Medium (1-2 weeks)</option>
              <option value="long">Long (2+ weeks)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Gender Preference</label>
            <div className="gender-options">
              {[['any','Any'],['female','Female only'],['male','Male only'],['mixed','Mixed group']].map(([v,l])=>(
                <label key={v} className="radio-label">
                  <input type="radio" name="gender" value={v} checked={gender === v} onChange={() => setGender(v)} /> {l}
                </label>
              ))}
            </div>
          </div>
          <button className="btn-primary-dash" style={{width:'100%',marginTop:'0.5rem'}} onClick={handleApply} disabled={loading}>
            {loading ? 'Searching…' : 'Apply Filters'}
          </button>
        </div>
        <div className="filter-results-area" id="filter-results-area">
          {error && <p className="panel-error">{error}</p>}
          {results === null && !loading && (
            <p className="panel-empty">Use the filters on the left to find trips.</p>
          )}
          {results !== null && results.length === 0 && !loading && (
            <p className="panel-empty">No trips found matching your filters.</p>
          )}
          {results !== null && results.length > 0 && (
            <div className="join-list">
              {results.map(t => {
                const start = t.startDate ? new Date(t.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
                const end   = t.endDate   ? new Date(t.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                return (
                  <div className="join-card" key={t.id}>
                    <div className="jc-body">
                      <h3>{t.title || t.destination}</h3>
                      <p>{start}{end ? ` – ${end}` : ''}</p>
                      <div className="trip-meta">
                        <span>${t.budget}</span>
                        {t.buddiesNeeded && <span>{t.buddiesNeeded} buddies needed</span>}
                      </div>
                      {t.styles?.length > 0 && (
                        <div className="dest-tags">{t.styles.map(s => <span key={s}>{s}</span>)}</div>
                      )}
                      <p className="jc-host">Destination: <strong>{t.destination}</strong></p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Panel: Profile ────────────────────────────────────────────────────────────
function PanelProfile({ profile, onSave }) {
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { setForm({ ...profile }); }, [profile]);

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); setSaved(false); }
  function toggleStyle(s)  { setForm(f => ({ ...f, styles: f.styles.includes(s) ? f.styles.filter(x=>x!==s) : [...f.styles, s] })); setSaved(false); }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setForm(f => ({ ...f, avatar: ev.target.result })); setSaved(false); };
    reader.readAsDataURL(file);
  }

  function handleSave(e) {
    e.preventDefault();
    onSave(form);
    setSaved(true);
  }

  const initial = form.name?.[0]?.toUpperCase() || '?';

  return (
    <section className="panel active">
      <div className="profile-page">
        <div className="profile-cover-card">
          <div className="profile-cover-art">
            <div className="cover-orb cover-orb--1"></div>
            <div className="cover-orb cover-orb--2"></div>
            <div className="cover-orb cover-orb--3"></div>
            <span className="cover-emoji">✈️</span>
          </div>
          <div className="profile-cover-content">
            <div className="profile-avatar-upload" onClick={() => fileInputRef.current?.click()} title="Change photo">
              {form.avatar
                ? <img src={form.avatar} alt="Profile" className="profile-avatar-img" />
                : <div className="profile-avatar-lg">{initial}</div>
              }
              <div className="profile-avatar-overlay">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageChange} />
            </div>
            <div className="profile-cover-info">
              <h2>{form.name || 'Your Name'}</h2>
              <p>{form.location ? `📍 ${form.location}` : 'Add your location'}</p>
              {form.bio && <p className="cover-bio">{form.bio}</p>}
              <div className="cover-chips">
                {form.styles.slice(0,3).map(s => <span key={s} className="cover-chip">{s}</span>)}
              </div>
            </div>
            <div className="cover-btn-group">
              <button className="cover-edit-btn" onClick={() => fileInputRef.current?.click()}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                Change photo
              </button>
              {form.avatar && (
                <button className="cover-remove-btn" onClick={() => { setForm(f => ({ ...f, avatar: null })); setSaved(false); }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="profile-body">
          <form className="profile-form" onSubmit={handleSave}>
            <div className="profile-section">
              <h3 className="profile-section-title">Basic Info</h3>
              <div className="form-row">
                <div className="form-group"><label>Full Name</label><input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" /></div>
                <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Location</label><input type="text" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Mumbai, India" /></div>
                <div className="form-group"><label>Languages</label><input type="text" value={form.languages} onChange={e => set('languages', e.target.value)} placeholder="e.g. English, Hindi" /></div>
              </div>
              <div className="form-group"><label>Bio</label><textarea rows="3" value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell other travelers a bit about yourself..." /></div>
            </div>

            <div className="profile-section">
              <h3 className="profile-section-title">Travel Style</h3>
              <p className="profile-section-sub">Pick the styles that match how you travel</p>
              <div className="style-chips">
                {['Adventure','Beach','Culture','Food','Budget','Luxury','Nature','City Breaks','Backpacking','Road Trips'].map(s => (
                  <span key={s} className={`style-chip${form.styles.includes(s) ? ' selected' : ''}`} onClick={() => toggleStyle(s)}>{s}</span>
                ))}
              </div>
            </div>

            <div className="profile-section">
              <h3 className="profile-section-title">Social Links</h3>
              <div className="form-row">
                <div className="form-group"><label>Instagram</label><input type="text" value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@yourhandle" /></div>
                <div className="form-group"><label>Twitter / X</label><input type="text" value={form.twitter} onChange={e => set('twitter', e.target.value)} placeholder="@yourhandle" /></div>
              </div>
            </div>

            <div className="profile-save-row">
              <button type="submit" className="btn-primary-dash">Save Changes</button>
              {saved && <span className="profile-saved-msg">✓ Profile saved</span>}
            </div>
          </form>

          <div className="profile-stats-col">
            <div className="side-card">
              <h3>Your Stats</h3>
              <div className="stats-grid">
                {[{n:'2',l:'Upcoming'},{n:'1',l:'Completed'},{n:'3',l:'Buddies'},{n:'5',l:'Countries'}].map(s=>(
                  <div className="stat-box" key={s.l}><span className="stat-num">{s.n}</span><span className="stat-lbl">{s.l}</span></div>
                ))}
              </div>
              <div className="stats-extra">
                <div className="stat-bar-row"><span className="stat-bar-lbl">Miles Traveled</span><span className="stat-bar-val">4,820 mi</span></div>
                <div className="stat-bar-track"><div className="stat-bar-fill" style={{width:'62%'}}></div></div>
                <div className="stat-rating" style={{marginTop:'0.75rem'}}><span className="stat-bar-lbl">Traveler Rating</span><span className="stat-stars">★★★★★ <span className="stat-bar-val">4.9</span></span></div>
              </div>
            </div>
            <div className="side-card" style={{marginTop:'1rem'}}>
              <h3>Badges</h3>
              <div className="badge-list">
                {[{icon:'🌍',label:'5 Countries'},{icon:'✈️',label:'3 Trips'},{icon:'🤝',label:'3 Buddies'},{icon:'⭐',label:'Top Rated'}].map(b=>(
                  <div className="badge-item" key={b.label}><span className="badge-icon">{b.icon}</span><span className="badge-label">{b.label}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Panel: Settings ───────────────────────────────────────────────────────────
function PanelSettings({ profile, onSave }) {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg,     setPwMsg]     = useState(null);
  const [notifs,    setNotifs]    = useState({ matches: true, messages: true, tripUpdates: true, newsletter: false });
  const [showDelete, setShowDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deletePass,  setDeletePass]  = useState('');
  const [deleteMsg,   setDeleteMsg]   = useState(null);
  const [pwLoading,   setPwLoading]   = useState(false);
  const [delLoading,  setDelLoading]  = useState(false);

  function setPw(f, v) { setPasswords(p => ({ ...p, [f]: v })); setPwMsg(null); }

  async function handleChangePassword(e) {
    e.preventDefault();
    const { current, next, confirm } = passwords;
    if (!current)          { setPwMsg({ type: 'error', text: 'Enter your current password.' }); return; }
    if (next.length < 8)   { setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' }); return; }
    if (next !== confirm)  { setPwMsg({ type: 'error', text: 'Passwords do not match.' }); return; }

    setPwLoading(true);
    try {
      const { changePassword } = await import('../utils/auth.js');
      await changePassword(current, next);
      setPasswords({ current: '', next: '', confirm: '' });
      setPwMsg({ type: 'success', text: 'Password updated successfully.' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message });
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteInput !== profile.name) return;
    if (!deletePass) { setDeleteMsg({ type: 'error', text: 'Enter your password to confirm.' }); return; }

    setDelLoading(true);
    try {
      const { deleteAccount, clearSession } = await import('../utils/auth.js');
      await deleteAccount(deletePass);
      clearSession();
      navigate('/');
    } catch (err) {
      setDeleteMsg({ type: 'error', text: err.message });
      setDelLoading(false);
    }
  }

  return (
    <section className="panel active">
      <div className="settings-page">
        <div className="settings-section">
          <h3 className="settings-section-title">Account</h3>
          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-label">Email address</span>
              <span className="settings-row-value">{profile.email || '—'}</span>
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-label">Display name</span>
              <span className="settings-row-value">{profile.name || '—'}</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Change Password</h3>
          <form className="settings-form" onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" placeholder="••••••••" value={passwords.current} onChange={e => setPw('current', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>New Password</label>
                <input type="password" placeholder="Min 8 characters" value={passwords.next} onChange={e => setPw('next', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Repeat new password" value={passwords.confirm} onChange={e => setPw('confirm', e.target.value)} />
              </div>
            </div>
            {pwMsg && <p className={pwMsg.type === 'success' ? 'settings-msg-ok' : 'settings-msg-err'}>{pwMsg.text}</p>}
            <button type="submit" className="btn-primary-dash" disabled={pwLoading}>
              {pwLoading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Notifications</h3>
          {[
            { key: 'matches',     label: 'New buddy matches',  sub: 'Get notified when someone matches your trip' },
            { key: 'messages',    label: 'Messages',           sub: 'Notifications for new chat messages' },
            { key: 'tripUpdates', label: 'Trip updates',       sub: 'Changes to trips you joined or created' },
            { key: 'newsletter',  label: 'Tips & inspiration', sub: 'Occasional travel ideas from TravelBuddy' },
          ].map(n => (
            <div className="settings-toggle-row" key={n.key}>
              <div>
                <span className="settings-row-label">{n.label}</span>
                <span className="settings-row-sub">{n.sub}</span>
              </div>
              <button
                className={`toggle-btn${notifs[n.key] ? ' toggle-btn--on' : ''}`}
                onClick={() => setNotifs(s => ({ ...s, [n.key]: !s[n.key] }))}
                type="button"
              >
                <span className="toggle-knob"></span>
              </button>
            </div>
          ))}
        </div>

        <div className="settings-section settings-danger-zone">
          <h3 className="settings-section-title settings-danger-title">Danger Zone</h3>
          {!showDelete ? (
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Delete account</span>
                <span className="settings-row-sub">Permanently remove your account and all data. This cannot be undone.</span>
              </div>
              <button className="btn-danger" onClick={() => setShowDelete(true)}>Delete Account</button>
            </div>
          ) : (
            <div className="delete-confirm-box">
              <p className="delete-confirm-text">
                Type <strong>{profile.name}</strong> to confirm deletion. This is permanent.
              </p>
              <input
                type="text"
                className="delete-confirm-input"
                placeholder={`Type "${profile.name}" to confirm`}
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
              />
              <input
                type="password"
                className="delete-confirm-input"
                placeholder="Enter your password"
                value={deletePass}
                onChange={e => { setDeletePass(e.target.value); setDeleteMsg(null); }}
                style={{ marginTop: '0.5rem' }}
              />
              {deleteMsg && <p className={deleteMsg.type === 'success' ? 'settings-msg-ok' : 'settings-msg-err'}>{deleteMsg.text}</p>}
              <div className="delete-confirm-actions">
                <button className="btn-danger" disabled={deleteInput !== profile.name || delLoading} onClick={handleDeleteAccount}>
                  {delLoading ? 'Deleting…' : 'Yes, delete my account'}
                </button>
                <button className="btn-outline-dash" onClick={() => { setShowDelete(false); setDeleteInput(''); setDeletePass(''); setDeleteMsg(null); }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Dashboard root ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const session  = getSession();
  const navigate = useNavigate();
  const [activePanel,      setActivePanel]      = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  // Lifted search query — shared between PanelHome and PanelFilter
  const [searchQuery, setSearchQuery] = useState('');

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('tb_profile');
      return saved ? JSON.parse(saved) : {
        name: session?.name || '', email: session?.email || '',
        bio: '', location: '', languages: '', styles: [],
        instagram: '', twitter: '', avatar: null,
      };
    } catch(_) {
      return { name: session?.name || '', email: session?.email || '',
        bio: '', location: '', languages: '', styles: [],
        instagram: '', twitter: '', avatar: null };
    }
  });

  function saveProfile(updated) {
    setProfile(updated);
    try {
      localStorage.setItem('tb_profile', JSON.stringify(updated));
      sessionStorage.setItem('tb_session', JSON.stringify({ name: updated.name, email: updated.email }));
    } catch(_) {}
  }

  function handleLogout() { clearSession(); navigate('/'); }

  const panels = {
    home:     <PanelHome    onSwitch={setActivePanel} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />,
    create:   <PanelCreate  onSwitch={setActivePanel} />,
    mytrips:  <PanelMyTrips />,
    join:     <PanelJoin />,
    chat:     <Chat />,
    explore:  <PanelExplore />,
    filter:   <PanelFilter  searchQuery={searchQuery} />,
    profile:  <PanelProfile  profile={profile} onSave={saveProfile} />,
    settings: <PanelSettings profile={profile} onSave={saveProfile} />,
  };

  return (
    <div className="dashboard-root">
      <Sidebar
        activePanel={activePanel}
        onSwitch={setActivePanel}
        collapsed={sidebarCollapsed}
        session={session}
        onLogout={handleLogout}
      />
      <div className={`main-wrap${sidebarCollapsed ? ' main-wrap--expanded' : ''}`}>
        <Header
          activePanel={activePanel}
          profile={profile}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(c => !c)}
          onSwitch={setActivePanel}
        />
        <main className="dash-content">
          {panels[activePanel]}
        </main>
      </div>
    </div>
  );
}
