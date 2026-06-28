import { Link } from 'react-router-dom';

function Navbar({ onLogout, token }) {
  return (
    <nav style={{
      background: 'linear-gradient(135deg, #013E3F 0%, #028090 100%)',
      padding: '0 40px',
      display: 'flex',
      alignItems: 'center',
      height: '64px',
      boxShadow: '0 4px 20px rgba(1,62,63,0.25)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/projects" style={{ textDecoration: 'none' }}>
        <span style={{ color: 'white', fontWeight: '800', fontSize: '22px', letterSpacing: '-0.5px' }}>
          Edu<span style={{ color: '#02C39A' }}>Match</span>
        </span>
      </Link>
      <div style={{ display: 'flex', gap: '4px', marginLeft: '32px' }}>
        <Link to="/projects" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>
          Проекты
        </Link>
        {token && (
          <Link to="/teammates" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>
            Тиммейты
          </Link>
        )}
        {token && (
          <Link to="/dashboard" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>
            Дашборд
          </Link>
        )}
        {token && (
          <Link to="/profile" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>
            Профиль
          </Link>
        )}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
        {token ? (
          <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
            Выйти
          </button>
        ) : (
          <>
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>
              Войти
            </Link>
            <Link to="/register" style={{ background: '#02C39A', color: 'white', textDecoration: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }}>
              Регистрация
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;