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
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', background: '#EEF2F7' }}>
      {/* Левая часть */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #013E3F 0%, #028090 50%, #02C39A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎓</div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-1px' }}>EduMatch</h1>
          <p style={{ fontSize: '18px', opacity: 0.9, lineHeight: '1.7', maxWidth: '320px' }}>
            Найди тиммейтов для проектов, хакатонов и совместной учёбы
          </p>
          <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['🚀 Создавай проекты', '👥 Находи тиммейтов', '💬 Общайся в реальном времени'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '12px', fontSize: '15px' }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Правая часть */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#013E3F', marginBottom: '8px' }}>Добро пожаловать!</h2>
          <p style={{ color: '#64748B', fontSize: '16px', marginBottom: '40px' }}>Войдите в свой аккаунт</p>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '14px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', border: '2px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', outline: 'none', background: '#F8FAFC', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.border = '2px solid #028090'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(2,128,144,0.1)'; }}
                onBlur={e => { e.target.style.border = '2px solid #E2E8F0'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }}
                required />
            </div>
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Пароль</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', border: '2px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', outline: 'none', background: '#F8FAFC', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.border = '2px solid #028090'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(2,128,144,0.1)'; }}
                onBlur={e => { e.target.style.border = '2px solid #E2E8F0'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }}
                required />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#94A3B8' : 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(2,128,144,0.4)', transition: 'all 0.2s' }}>
              {loading ? '⏳ Входим...' : 'Войти →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '28px', color: '#64748B', fontSize: '15px' }}>
            Нет аккаунта? <Link to="/register" style={{ color: '#028090', fontWeight: '700' }}>Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;