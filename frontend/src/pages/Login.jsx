import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      onLogin(res.data.token);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#EEF2F7' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '44px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#013E3F', marginBottom: '8px' }}>Добро пожаловать</h1>
          <p style={{ color: '#64748B', fontSize: '15px' }}>Войдите в свой аккаунт EduMatch</p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '15px', outline: 'none', background: '#FAFAFA' }}
              onFocus={e => { e.target.style.border = '1.5px solid #028090'; e.target.style.background = 'white'; }}
              onBlur={e => { e.target.style.border = '1.5px solid #E2E8F0'; e.target.style.background = '#FAFAFA'; }}
              required />
          </div>
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Пароль</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '15px', outline: 'none', background: '#FAFAFA' }}
              onFocus={e => { e.target.style.border = '1.5px solid #028090'; e.target.style.background = 'white'; }}
              onBlur={e => { e.target.style.border = '1.5px solid #E2E8F0'; e.target.style.background = '#FAFAFA'; }}
              required />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(2,128,144,0.3)' }}>
            {loading ? 'Входим...' : 'Войти →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#64748B', fontSize: '14px' }}>
          Нет аккаунта? <Link to="/register" style={{ color: '#028090', fontWeight: '700' }}>Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;