import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      onLogin(res.data.token);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h2>Вход в EduMatch</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
            required />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <input type="password" placeholder="Пароль" value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
            required />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#028090', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
          Войти
        </button>
      </form>
      <p style={{ marginTop: '16px' }}>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
    </div>
  );
}

export default Login;