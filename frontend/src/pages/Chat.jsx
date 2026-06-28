import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [project, setProject] = useState(null);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get(`/projects/${id}`).then(res => setProject(res.data)).catch(() => {});
    api.get(`/projects/${id}/messages`).then(res => {
      setMessages(res.data.messages || []);
    });

    const token = localStorage.getItem('token');
    const wsUrl = process.env.NODE_ENV === 'production'
      ? `wss://edumatch-project.onrender.com/ws/projects/${id}?token=${token}`
      : `ws://localhost:8080/ws/projects/${id}?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setMessages(prev => [...prev, msg]);
    };
    ws.onclose = () => setConnected(false);
    return () => ws.close();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ content: input }));
    setInput('');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px', minHeight: 'calc(100vh - 64px)', background: '#EEF2F7' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'white', border: '2px solid #E2E8F0', borderRadius: '10px', padding: '9px 16px', cursor: 'pointer', fontSize: '14px', color: '#64748B', fontWeight: '600' }}>
          ← Назад
        </button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#013E3F' }}>
            {project?.title || 'Чат проекта'}
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B' }}>Общайтесь с командой в реальном времени</p>
        </div>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: connected ? '#16A34A' : '#DC2626', background: connected ? '#F0FDF4' : '#FEF2F2', padding: '6px 14px', borderRadius: '20px', border: `1px solid ${connected ? '#BBF7D0' : '#FECACA'}` }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: connected ? '#16A34A' : '#DC2626', display: 'inline-block', animation: connected ? 'pulse 2s infinite' : 'none' }} />
          {connected ? 'Онлайн' : 'Офлайн'}
        </span>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', height: '460px', overflowY: 'auto', padding: '24px', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#64748B', marginBottom: '8px' }}>Начните общение</h3>
            <p style={{ fontSize: '14px' }}>Напишите первое сообщение команде!</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={m.id} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `hsl(${parseInt(m.user_id.slice(0,8), 16) % 360}, 60%, 45%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                  {m.user_id.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500' }}>
                  {new Date(m.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ marginLeft: '42px', background: '#F8FAFC', padding: '12px 16px', borderRadius: '4px 16px 16px 16px', fontSize: '15px', color: '#1E293B', lineHeight: '1.6', border: '1px solid #F1F5F9', maxWidth: '85%' }}>
                {m.content}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px' }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Написать сообщение..."
          style={{ flex: 1, padding: '14px 18px', border: '2px solid #E2E8F0', borderRadius: '14px', fontSize: '15px', outline: 'none', background: 'white' }}
          onFocus={e => { e.target.style.border = '2px solid #028090'; e.target.style.boxShadow = '0 0 0 4px rgba(2,128,144,0.1)'; }}
          onBlur={e => { e.target.style.border = '2px solid #E2E8F0'; e.target.style.boxShadow = 'none'; }} />
        <button type="submit" style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(2,128,144,0.4)', whiteSpace: 'nowrap' }}>
          Отправить →
        </button>
      </form>
    </div>
  );
}

export default Chat;