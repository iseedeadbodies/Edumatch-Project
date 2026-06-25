import { Link } from 'react-router-dom';

function Navbar({ onLogout, token }) {
  return (
    <nav style={{ padding: '10px 20px', background: '#028090', display: 'flex', gap: '20px', alignItems: 'center' }}>
      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>EduMatch</span>
      <Link to="/projects" style={{ color: 'white', textDecoration: 'none' }}>Проекты</Link>
      {token && <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>Профиль</Link>}
      {token ? (
        <button onClick={onLogout} style={{ marginLeft: 'auto', cursor: 'pointer', padding: '6px 12px' }}>Выйти</button>
      ) : (
        <>
          <Link to="/login" style={{ color: 'white', textDecoration: 'none', marginLeft: 'auto' }}>Войти</Link>
          <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Регистрация</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;