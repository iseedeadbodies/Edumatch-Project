import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

function Chat() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Загружаем историю сообщений
    api.get(`/projects/${id}/messages`).then((res) => {
      setMessages(res.data.messages || []);
    });

    // Подключаемся к WebSocket
    const token = localStorage.getItem('token');
    const ws = new WebSocket(`ws://localhost:8080/ws/projects/${id}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setMessages((prev) => [...prev, msg]);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
    };
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
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h2>Чат проекта</h2>
      <p style={{ color: connected ? 'green' : 'red', fontSize: '13px' }}>
        {connected ? '● Подключено' : '● Отключено'}
      </p>

      <div style={{ border: '1px solid #ddd', borderRadius: '8px', height: '400px', overflowY: 'auto', padding: '16px', marginBottom: '16px', background: '#fafafa' }}>
        {messages.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center' }}>Сообщений пока нет</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: '#999' }}>
                {m.user_id.slice(0, 8)}... · {new Date(m.created_at).toLocaleTimeString('ru-RU')}
              </span>
              <p style={{ margin: '2px 0 0 0', background: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #eee' }}>
                {m.content}
              </p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Введите сообщение..."
          style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#028090', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Отправить
        </button>
      </form>
    </div>
  );
}

export default Chat;