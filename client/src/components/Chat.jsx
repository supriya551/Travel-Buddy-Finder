import { useState, useRef, useEffect } from 'react';
import socket from '../utils/socket.js';
import { getSession } from '../utils/auth.js';

const CONTACTS = [
  { a: 'A', name: 'Arjun S.' },
  { a: 'L', name: 'Lena M.' },
  { a: 'K', name: 'Kenji T.' },
];

// Stable room id from two participant names
function getRoomId(a, b) {
  return [a, b].sort().join('::');
}

export default function Chat() {
  const session = getSession();
  const myName  = session?.name || 'Me';

  const [activeChat,  setActiveChat]  = useState(CONTACTS[0].name);
  const [messageMap,  setMessageMap]  = useState({}); // { [roomId]: [...msgs] }
  const [input,       setInput]       = useState('');
  const [connected,   setConnected]   = useState(socket.connected);
  const msgsRef = useRef(null);

  const roomId = getRoomId(myName, activeChat);

  // Track connection status
  useEffect(() => {
    function onConnect()    { setConnected(true); }
    function onDisconnect() { setConnected(false); }
    socket.on('connect',    onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect',    onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  // Join room + load history whenever active chat changes
  useEffect(() => {
    socket.emit('join_room', { roomId });

    function onHistory(msgs) {
      setMessageMap(m => ({ ...m, [roomId]: msgs }));
    }

    function onReceive(msg) {
      setMessageMap(m => ({
        ...m,
        [roomId]: [...(m[roomId] || []), msg],
      }));
    }

    socket.on('history',         onHistory);
    socket.on('receive_message', onReceive);

    return () => {
      socket.off('history',         onHistory);
      socket.off('receive_message', onReceive);
    };
  }, [roomId]);

  // Auto-scroll on new messages
  useEffect(() => {
    msgsRef.current?.scrollTo(0, msgsRef.current.scrollHeight);
  }, [messageMap, activeChat]);

  function sendMsg() {
    if (!input.trim() || !connected) return;
    socket.emit('send_message', { roomId, sender: myName, text: input.trim() });
    setInput('');
  }

  const messages      = messageMap[roomId] || [];
  const activeContact = CONTACTS.find(c => c.name === activeChat);

  return (
    <section className="panel active">
      <div className="chat-layout">

        {/* Contact list */}
        <div className="chat-sidebar">
          <h3>Messages</h3>
          <div className="chat-list">
            {CONTACTS.map(c => (
              <div
                key={c.name}
                className={`chat-item${activeChat === c.name ? ' active' : ''}`}
                onClick={() => setActiveChat(c.name)}
              >
                <div className="chat-avatar">{c.a}</div>
                <div className="chat-preview">
                  <span className="chat-name">{c.name}</span>
                  <span className="chat-last">
                    {(messageMap[getRoomId(myName, c.name)] || []).slice(-1)[0]?.text || 'No messages yet'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div className="chat-main">
          <div className="chat-header-bar">
            <div className="chat-avatar">{activeContact?.a}</div>
            <div>
              <span className="chat-name">{activeChat}</span>
              <span className="chat-status">{connected ? 'Online' : 'Connecting...'}</span>
            </div>
          </div>

          <div className="chat-messages" ref={msgsRef}>
            {messages.length === 0 && (
              <p style={{ textAlign: 'center', color: '#aaa', marginTop: '2rem' }}>
                No messages yet. Say hi!
              </p>
            )}
            {messages.map((m) => {
              const isOwn = m.sender === myName;
              return (
                <div key={m.id} className={`msg msg-${isOwn ? 'out' : 'in'}`}>
                  {!isOwn && <span className="msg-sender">{m.sender}</span>}
                  <div className="msg-bubble">{m.text}</div>
                  <span className="msg-time">{m.time}</span>
                </div>
              );
            })}
          </div>

          <div className="chat-input-bar">
            <input
              type="text"
              placeholder={connected ? 'Type a message...' : 'Connecting to chat...'}
              value={input}
              disabled={!connected}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMsg(); }}
            />
            <button className="btn-send" onClick={sendMsg} disabled={!connected}>
              Send
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
