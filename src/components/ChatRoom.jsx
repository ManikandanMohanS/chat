import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaTrash, FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

function ChatRoom() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, [messages]);

  const handleLogout = () => {
    signOut(auth).catch(error => console.error('Logout error:', error));
  };

  const handleSendMessage = async () => {
    if (!currentUser || message.trim() === '') return;
    try {
      await addDoc(collection(db, 'messages'), {
        text: message.trim(),
        senderUid: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        createdAt: serverTimestamp(),
      });
      setMessage('');
      setSelectedMessageId(null);
      setShowEmojiPicker(false); // close emoji picker after send
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
      setSelectedMessageId(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getAvatar = (nameOrEmail, bgColor = '#6c757d') => {
    const char = nameOrEmail?.charAt(0)?.toUpperCase() || '?';
    return (
      <div
        className="rounded-circle text-white d-flex justify-content-center align-items-center me-2"
        style={{
          width: 35,
          height: 35,
          backgroundColor: bgColor,
          fontSize: 16,
          fontWeight: 'bold',
        }}
      >
        {char}
      </div>
    );
  };

  const getAvatarColor = (uid) => {
    const colors = ['#6c5ce7', '#e84393', '#00b894', '#fdcb6e', '#0984e3', '#e17055'];
    let sum = 0;
    for (let i = 0; i < uid.length; i++) sum += uid.charCodeAt(i);
    return colors[sum % colors.length];
  };

  return (
    <div className="container-fluid bg-black text-white min-vh-100 d-flex flex-column p-0">
      {/* Fixed Navbar */}
      <nav className="navbar navbar-dark bg-dark px-3" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 20 }}>
        <span className="navbar-brand mb-0 h4">Namma Chat</span>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </nav>

      {/* Chat Window */}
      <div
        className="flex-grow-1 overflow-auto px-3 pb-5 pt-5 mt-5"
        id="chat-window"
        style={{ marginTop: '60px', marginBottom: '90px' }}
      >
        {messages.map((msg, idx) => {
          const isMe = msg.senderUid === currentUser?.uid;
          const isSelected = selectedMessageId === msg.id;
          const prevMsg = messages[idx - 1];
          const showAvatar = !prevMsg || prevMsg.senderUid !== msg.senderUid;
          const avatarColor = getAvatarColor(msg.senderUid);

          return (
            <div
              key={msg.id}
              className={`d-flex position-relative ${isMe ? 'justify-content-end' : 'justify-content-start'}`}
              style={{
                marginTop: showAvatar ? '1rem' : '0.3rem',
                marginBottom: '0.25rem',
              }}
              onClick={() => isMe && setSelectedMessageId(msg.id === selectedMessageId ? null : msg.id)}
            >
              {isSelected && isMe && (
                <button
                  className="btn btn-sm btn-outline-danger position-absolute"
                  style={{ top: -28, right: 0, zIndex: 1 }}
                  onClick={() => handleDeleteMessage(msg.id)}
                >
                  <FaTrash className="me-1" /> Delete
                </button>
              )}

              <div className="d-flex" style={{ maxWidth: '75%' }}>
                {/* Avatar column (desktop) */}
                <div className="d-none d-md-flex" style={{ alignItems: 'flex-end', width: 40 }}>
                  {!isMe && showAvatar ? getAvatar(msg.senderName, avatarColor) : <div style={{ width: 35 }} />}
                </div>

                {/* Message bubble */}
                <div className="d-flex flex-column align-items-start">
                  {/* Avatar for mobile view */}
                  {showAvatar && !isMe && (
                    <div className="d-block d-md-none align-items-center mb-1">
                      {getAvatar(msg.senderName, avatarColor)}
                    </div>
                  )}
                  {showAvatar && isMe && (
                    <div className="d-block d-md-none align-self-end mb-1">
                      {getAvatar(msg.senderName, avatarColor)}
                    </div>
                  )}

                  <div
                    className="rounded"
                    style={{
                      padding: '8px 24px',
                      fontSize: '1.2rem',
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      background: isMe
                        ? 'linear-gradient(to right, #ff00cc, #333399)'
                        : '#2c3e50',
                      color: 'white',
                      borderRadius: '20px',
                      borderTopLeftRadius: isMe ? '20px' : '5px',
                      borderTopRightRadius: isMe ? '5px' : '20px',
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '2px' }}>
                      {isMe ? 'You' : msg.senderName}
                    </div>
                    <div style={{ fontWeight: 500 }}>{msg.text}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Send Bar */}
      <div
        className="px-3 py-2 mb-0"
        style={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(33, 37, 41, 0.85)',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.4)',
          zIndex: 10,
          marginBottom: '5px',
        }}
      >
        {showEmojiPicker && (
          <div className="mb-2 position-absolute" style={{ bottom: '60px', zIndex: 15 }}>
            <EmojiPicker
              theme="dark"
              onEmojiClick={(e) => setMessage(prev => prev + e.emoji)}
            />
          </div>
        )}
        <div className="d-flex align-items-center rounded-pill px-3" style={{ background: '#1c1c1c', border: '1px solid #444' }}>
          <button
            className="btn btn-sm text-white"
            onClick={() => setShowEmojiPicker(prev => !prev)}
          >
            <FaSmile />
          </button>
          <input
            type="text"
            className="form-control bg-transparent border-0 text-white"
            placeholder="Type a message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            style={{
              boxShadow: 'none',
              fontSize: '1rem',
              padding: '0.5rem 0.75rem',
            }}
          />
          <button
            className="btn btn-sm ms-2 text-white"
            style={{
              background: 'linear-gradient(135deg, #ff00cc, #333399)',
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              fontWeight: 'bold',
              transition: 'transform 0.2s',
            }}
            onClick={handleSendMessage}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatRoom;
