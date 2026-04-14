import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, clearSession } from '../utils/auth.js';
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
function PanelHome({ onSwitch }) {
  const [search, setSearch] = useState('');
  const [connects, setConnects] = useState({});

  function handleSearchKey(e) {
    if (e.key === 'Enter' && search.trim().length > 0) onSwitch('filter');
  }

  return (
    <section className="panel active">
      <div className="home-search-bar">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Search destinations, trips, buddies..." value={search}
          onChange={e => setSearch(e.target.value)} onKeyDown={handleSearchKey} />
      </div>
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
              {[{a:'A',name:'Arjun S.',dest:'Bali, Indonesia'},{a:'L',name:'Lena M.',dest:'Iceland'},{a:'K',name:'Kenji T.',dest:'Peru'}].map(m => (
                <div className="match-row" key={m.name}>
                  <div className="match-avatar">{m.a}</div>
                  <div className="match-info"><span className="match-name">{m.name}</span><span className="match-dest">{m.dest}</span></div>
                  <button className="btn-connect"
                    style={connects[m.name] ? {background:'#16a34a'} : {}}
                    disabled={!!connects[m.name]}
                    onClick={() => setConnects(c => ({...c, [m.name]: true}))}>
                    {connects[m.name] ? 'Sent' : 'Connect'}
                  </button>
                </div>
              ))}
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
  function toggleChip(c) { setChips(s => s.includes(c) ? s.filter(x=>x!==c) : [...s,c]); }
  function handleSubmit(e) { e.preventDefault(); onSwitch('mytrips'); }
  return (
    <section className="panel active">
      <div className="form-panel">
        <h2>Create a New Trip</h2>
        <p className="form-panel-sub">Post your trip and find buddies heading the same way.</p>
        <form className="trip-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label>From</label><input type="text" placeholder="e.g. Mumbai" /></div>
            <div className="form-group"><label>Destination</label><input type="text" placeholder="e.g. Tokyo" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Start Date</label><input type="date" /></div>
            <div className="form-group"><label>End Date</label><input type="date" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Budget (USD)</label><input type="number" placeholder="e.g. 1200" /></div>
            <div className="form-group"><label>Buddies Needed</label><input type="number" placeholder="e.g. 2" min="1" max="10" /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea rows="3" placeholder="Tell potential buddies about your trip..."></textarea></div>
          <div className="form-group">
            <label>Travel Style</label>
            <div className="style-chips">
              {['Adventure','Beach','Culture','Food','Budget','Luxury'].map(c=>(
                <span key={c} className={`style-chip${chips.includes(c)?' selected':''}`} onClick={()=>toggleChip(c)}>{c}</span>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary-dash">Post Trip</button>
        </form>
      </div>
    </section>
  );
}

// ── Panel: My Trips ───────────────────────────────────────────────────────────
function PanelMyTrips() {
  return (
    <section className="panel active">
      <h2 className="panel-heading">My Trips</h2>
      <div className="my-trips-grid">
        {[{img:'1493976040374-85c8e12f0c0e',status:'upcoming',title:'Tokyo to Kyoto',sub:'14 Jan – 28 Jan 2026 · Japan',price:'$1,400',buddies:'2 buddies'},{img:'1524492412937-b28074a5d7da',status:'upcoming',title:'Delhi to Jaipur',sub:'3 Mar – 10 Mar 2026 · India',price:'$620',buddies:'1 buddy'},{img:'1506905925346-21bda4d32df4',status:'past',title:'Alps Trek',sub:'Aug 2025 · Switzerland',price:'$2,100',buddies:'3 buddies'}].map(t=>(
          <div className="my-trip-card" key={t.title}>
            <img src={`https://images.unsplash.com/photo-${t.img}?w=400&q=80`} alt={t.title} />
            <div className="mtc-body">
              <span className={`status-chip status-${t.status==='upcoming'?'upcoming':'past'}`}>{t.status==='upcoming'?'Upcoming':'Completed'}</span>
              <h3>{t.title}</h3><p>{t.sub}</p>
              <div className="trip-meta"><span>{t.price}</span><span>{t.buddies}</span></div>
              <button className="btn-outline-dash">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Panel: Join a Trip ────────────────────────────────────────────────────────
function PanelJoin() {
  const [joined, setJoined] = useState({});
  const trips = [
    {img:'1518548419970-58e3b4079ab2',title:'Santorini, Greece',dates:'20 Feb – 28 Feb 2026',price:'$1,800',spots:'1 spot left',tags:['Beach','Sunsets'],host:'Lena M.',rating:'4.9'},
    {img:'1499856871958-5b9627545d1a',title:'Paris, France',dates:'5 Mar – 12 Mar 2026',price:'$2,200',spots:'2 spots left',tags:['Culture','Food'],host:'Arjun S.',rating:'4.7'},
    {img:'1506905925346-21bda4d32df4',title:'Swiss Alps Trek',dates:'10 Apr – 18 Apr 2026',price:'$2,500',spots:'3 spots left',tags:['Adventure','Nature'],host:'Kenji T.',rating:'5.0'},
  ];
  return (
    <section className="panel active">
      <h2 className="panel-heading">Join a Trip</h2>
      <div className="filter-bar">
        <input type="text" placeholder="Search destination..." className="filter-input" />
        <select className="filter-select"><option>Any budget</option><option>Under $500</option><option>$500-$1500</option><option>$1500+</option></select>
        <select className="filter-select"><option>Any style</option><option>Adventure</option><option>Beach</option><option>Culture</option></select>
      </div>
      <div className="join-list">
        {trips.map(t=>(
          <div className="join-card" key={t.title}>
            <img src={`https://images.unsplash.com/photo-${t.img}?w=300&q=80`} alt={t.title} />
            <div className="jc-body">
              <h3>{t.title}</h3><p>{t.dates}</p>
              <div className="trip-meta"><span>{t.price}</span><span>{t.spots}</span></div>
              <div className="dest-tags">{t.tags.map(tg=><span key={tg}>{tg}</span>)}</div>
              <p className="jc-host">Host: <strong>{t.host}</strong> &nbsp; {t.rating} / 5</p>
              <button className="btn-primary-dash join-btn"
                style={joined[t.title]?{background:'#16a34a'}:{}}
                onClick={()=>setJoined(j=>({...j,[t.title]:true}))}>
                {joined[t.title]?'Requested':'Request to Join'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Panel: Chat ───────────────────────────────────────────────────────────────
function PanelChat() {
  const [messages, setMessages] = useState([
    {type:'in',text:'Hey! Are you still up for Bali?',time:'10:32 AM'},
    {type:'out',text:'Yes! Super excited. When are you thinking?',time:'10:34 AM'},
    {type:'in',text:'Maybe late March? Found great deals on flights.',time:'10:35 AM'},
  ]);
  const [input, setInput] = useState('');
  const [activeChat, setActiveChat] = useState('Arjun S.');
  const [chatBadges, setChatBadges] = useState({'Arjun S.':2,'Kenji T.':1});
  const msgsRef = useRef(null);

  function sendMsg() {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    setMessages(m=>[...m,{type:'out',text:input.trim(),time:now}]);
    setInput('');
  }

  useEffect(() => { msgsRef.current?.scrollTo(0, msgsRef.current.scrollHeight); }, [messages]);

  const contacts = [{a:'A',name:'Arjun S.',last:'Hey! Still up for Bali?'},{a:'L',name:'Lena M.',last:'I booked the flights!'},{a:'K',name:'Kenji T.',last:'Budget for Peru?'}];

  return (
    <section className="panel active">
      <div className="chat-layout">
        <div className="chat-sidebar">
          <h3>Messages</h3>
          <div className="chat-list">
            {contacts.map(c=>(
              <div key={c.name} className={`chat-item${activeChat===c.name?' active':''}`}
                onClick={()=>{ setActiveChat(c.name); setChatBadges(b=>({...b,[c.name]:0})); }}>
                <div className="chat-avatar">{c.a}</div>
                <div className="chat-preview"><span className="chat-name">{c.name}</span><span className="chat-last">{c.last}</span></div>
                {chatBadges[c.name]>0 && <span className="chat-badge">{chatBadges[c.name]}</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="chat-main">
          <div className="chat-header-bar">
            <div className="chat-avatar">{contacts.find(c=>c.name===activeChat)?.a}</div>
            <div><span className="chat-name">{activeChat}</span><span className="chat-status">Online</span></div>
          </div>
          <div className="chat-messages" ref={msgsRef}>
            {messages.map((m,i)=>(
              <div key={i} className={`msg msg-${m.type}`}>
                <div className="msg-bubble">{m.text}</div>
                <span className="msg-time">{m.time}</span>
              </div>
            ))}
          </div>
          <div className="chat-input-bar">
            <input type="text" placeholder="Type a message..." value={input}
              onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') sendMsg(); }} />
            <button className="btn-send" onClick={sendMsg}>Send</button>
          </div>
        </div>
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
function PanelFilter() {
  const [chips, setChips] = useState([]);
  function toggleChip(c) { setChips(s => s.includes(c) ? s.filter(x=>x!==c) : [...s,c]); }
  return (
    <section className="panel active">
      <h2 className="panel-heading">Filter Trips</h2>
      <div className="filter-page">
        <div className="filter-controls">
          <h3>Filters</h3>
          <div className="form-group"><label>Destination</label><input type="text" placeholder="Where do you want to go?" /></div>
          <div className="form-group">
            <label>Travel Style</label>
            <div className="style-chips">
              {['Adventure','Beach','Culture','Food','Budget','Luxury'].map(c=>(
                <span key={c} className={`style-chip${chips.includes(c)?' selected':''}`} onClick={()=>toggleChip(c)}>{c}</span>
              ))}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Min Budget ($)</label><input type="number" placeholder="0" /></div>
            <div className="form-group"><label>Max Budget ($)</label><input type="number" placeholder="5000" /></div>
          </div>
          <div className="form-group">
            <label>Duration</label>
            <select className="filter-select" style={{width:'100%'}}>
              <option>Any</option><option>Weekend (1-3 days)</option><option>Short (4-7 days)</option>
              <option>Medium (1-2 weeks)</option><option>Long (2+ weeks)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Gender Preference</label>
            <div className="gender-options">
              {[['any','Any'],['female','Female only'],['male','Male only'],['mixed','Mixed group']].map(([v,l])=>(
                <label key={v} className="radio-label"><input type="radio" name="gender" value={v} defaultChecked={v==='any'} /> {l}</label>
              ))}
            </div>
          </div>
          <button className="btn-primary-dash" style={{width:'100%',marginTop:'0.5rem'}}>Apply Filters</button>
        </div>
        <div className="filter-empty" id="filter-results-area"></div>
      </div>
    </section>
  );
}

// ── Panel: Profile ────────────────────────────────────────────────────────────
function PanelProfile({ profile, onSave }) {
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  // sync if profile prop changes (e.g. first load)
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

        {/* ── Cover card ── */}
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
  const [pwMsg,     setPwMsg]     = useState(null); // {type:'success'|'error', text}
  const [notifs,    setNotifs]    = useState({ matches: true, messages: true, tripUpdates: true, newsletter: false });
  const [showDelete, setShowDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  function setPw(f, v) { setPasswords(p => ({ ...p, [f]: v })); setPwMsg(null); }

  function handleChangePassword(e) {
    e.preventDefault();
    const { current, next, confirm } = passwords;
    if (!current) { setPwMsg({ type: 'error', text: 'Enter your current password.' }); return; }
    if (next.length < 8) { setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' }); return; }
    if (next !== confirm) { setPwMsg({ type: 'error', text: 'Passwords do not match.' }); return; }

    // verify current password against stored hash
    try {
      const users = JSON.parse(localStorage.getItem('tb_users') || '[]');
      // inline djb2 hash
      function djb2(str) { let h = 5381; for (let i = 0; i < str.length; i++) { h = ((h << 5) + h) ^ str.charCodeAt(i); h = h >>> 0; } return String(h); }
      const idx = users.findIndex(u => u.email === profile.email);
      if (idx === -1 || users[idx].passwordHash !== djb2(current)) {
        setPwMsg({ type: 'error', text: 'Current password is incorrect.' }); return;
      }
      users[idx].passwordHash = djb2(next);
      localStorage.setItem('tb_users', JSON.stringify(users));
      setPasswords({ current: '', next: '', confirm: '' });
      setPwMsg({ type: 'success', text: 'Password updated successfully.' });
    } catch(_) {
      setPwMsg({ type: 'error', text: 'Something went wrong. Try again.' });
    }
  }

  function handleDeleteAccount() {
    if (deleteInput !== profile.name) return;
    try {
      const users = JSON.parse(localStorage.getItem('tb_users') || '[]');
      localStorage.setItem('tb_users', JSON.stringify(users.filter(u => u.email !== profile.email)));
      localStorage.removeItem('tb_profile');
      sessionStorage.removeItem('tb_session');
    } catch(_) {}
    navigate('/');
  }

  return (
    <section className="panel active">
      <div className="settings-page">

        {/* Account */}
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

        {/* Change password */}
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
            <button type="submit" className="btn-primary-dash">Update Password</button>
          </form>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <h3 className="settings-section-title">Notifications</h3>
          {[
            { key: 'matches',     label: 'New buddy matches',       sub: 'Get notified when someone matches your trip' },
            { key: 'messages',    label: 'Messages',                sub: 'Notifications for new chat messages' },
            { key: 'tripUpdates', label: 'Trip updates',            sub: 'Changes to trips you joined or created' },
            { key: 'newsletter',  label: 'Tips & inspiration',      sub: 'Occasional travel ideas from TravelBuddy' },
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

        {/* Danger zone */}
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
              <div className="delete-confirm-actions">
                <button className="btn-danger" disabled={deleteInput !== profile.name} onClick={handleDeleteAccount}>
                  Yes, delete my account
                </button>
                <button className="btn-outline-dash" onClick={() => { setShowDelete(false); setDeleteInput(''); }}>
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

  // Lifted profile state — persists across panel switches
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
    home:    <PanelHome    onSwitch={setActivePanel} />,
    create:  <PanelCreate  onSwitch={setActivePanel} />,
    mytrips: <PanelMyTrips />,
    join:    <PanelJoin />,
    chat:    <PanelChat />,
    explore: <PanelExplore />,
    filter:  <PanelFilter />,
    profile:  <PanelProfile profile={profile} onSave={saveProfile} />,
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
