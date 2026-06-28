import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEF2F7' }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '96px', marginBottom: '8px' }}>🚀</div>
        <h1 style={{ fontSize: '96px', fontWeight: '900', background: 'linear-gradient(135deg, #028090, #02C39A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px', letterSpacing: '-4px' }}>404</h1>
        <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#013E3F', marginBottom: '12px' }}>Страница не найдена</h2>
        <p style={{ color: '#64748B', fontSize: '16px', marginBottom: '40px', maxWidth: '320px', margin: '0 auto 40px' }}>
          Похоже, эта страница улетела в космос вместе с тиммейтами 🛸
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/projects')}
            style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 20px rgba(2,128,144,0.4)' }}>
            На главную
          </button>
          <button onClick={() => navigate(-1)}
            style={{ padding: '14px 32px', background: 'white', color: '#64748B', border: '2px solid #E2E8F0', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;