import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get(`/projects/${id}/messages`).then(res => {
      setMessages(res.data.messages || []);
    });

    const token = localStorage.getItem('token');
    const ws = new WebSocket(`ws://localhost:8080/ws/projects/${id}?token=${token}`);
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
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px', minHeight: 'calc(100vh - 64px)', background: '#EEF2F7' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '14px', color: '#64748B' }}>
          ← Назад
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#013E3F' }}>Чат проекта</h1>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: connected ? '#16A34A' : '#DC2626', background: connected ? '#F0FDF4' : '#FEF2F2', padding: '4px 12px', borderRadius: '20px', border: `1px solid ${connected ? '#BBF7D0' : '#FECACA'}` }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: connected ? '#16A34A' : '#DC2626', display: 'inline-block' }} />
          {connected ? 'Онлайн' : 'Офлайн'}
        </span>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', height: '420px', overflowY: 'auto', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
            <p>Сообщений пока нет. Напишите первым!</p>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #028090, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '700' }}>
                  {m.user_id.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {new Date(m.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ marginLeft: '36px', background: '#F8FAFC', padding: '10px 14px', borderRadius: '0 12px 12px 12px', fontSize: '14px', color: '#1E293B', lineHeight: '1.5', border: '1px solid #F1F5F9' }}>
                {m.content}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Написать сообщение..."
          style={{ flex: 1, padding: '13px 16px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
          onFocus={e => e.target.style.border = '1.5px solid #028090'}
          onBlur={e => e.target.style.border = '1.5px solid #E2E8F0'} />
        <button type="submit" style={{ padding: '13px 24px', background: 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(2,128,144,0.3)' }}>
          Отправить
        </button>
      </form>
    </div>
  );
}

export default Chat;