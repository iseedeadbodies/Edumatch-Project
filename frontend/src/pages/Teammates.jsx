import { useState, useEffect } from 'react';
import api from '../api/axios';

const ALL_SKILLS = ['React', 'Vue', 'Angular', 'Node.js', 'Go', 'Python', 'Java', 'C++', 'PostgreSQL', 'MongoDB', 'Docker', 'Figma'];

function Teammates() {
  const [users, setUsers] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (skill = '') => {
    try {
      const res = await api.get('/users', { params: { skills: skill } });
      setUsers(res.data.users || []);
    } catch {
      console.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSkillFilter = (skill) => {
    const newSkill = selectedSkill === skill ? '' : skill;
    setSelectedSkill(newSkill);
    fetchUsers(newSkill);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', minHeight: 'calc(100vh - 64px)', background: '#EEF2F7' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#013E3F', marginBottom: '4px' }}>Поиск тиммейтов</h1>
        <p style={{ color: '#64748B', fontSize: '15px' }}>Найди студентов с нужными навыками</p>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Фильтр по навыкам</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ALL_SKILLS.map(skill => (
            <span key={skill} onClick={() => handleSkillFilter(skill)} style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
              background: selectedSkill === skill ? '#028090' : '#F1F5F9',
              color: selectedSkill === skill ? 'white' : '#64748B',
            }}>{skill}</span>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#64748B', textAlign: 'center' }}>Загрузка...</p>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <h3 style={{ color: '#013E3F', marginBottom: '8px' }}>Никого не найдено</h3>
          <p style={{ color: '#64748B' }}>Попробуй выбрать другой навык</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {users.map(u => (
            <div key={u.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #028090, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '700', flexShrink: 0 }}>
                  {u.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: '700', color: '#013E3F', fontSize: '15px', marginBottom: '2px' }}>{u.full_name}</p>
                  {u.university && <p style={{ fontSize: '12px', color: '#64748B' }}>🎓 {u.university}, {u.course} курс</p>}
                </div>
              </div>
              {u.about_me && (
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {u.about_me}
                </p>
              )}
              {u.skills?.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {u.skills.map(s => (
                    <span key={s} style={{ background: '#E0F7F5', color: '#028090', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Teammates;