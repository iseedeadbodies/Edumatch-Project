import { useState, useEffect } from 'react';
import api from '../api/axios';

const ALL_SKILLS = ['React', 'Vue', 'Angular', 'Node.js', 'Go', 'Python', 'Java', 'C++', 'PostgreSQL', 'MongoDB', 'Docker', 'Figma'];

function Teammates() {
  const [users, setUsers] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (skill = '') => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { skills: skill } });
      setUsers(res.data.users || []);
    } catch {
      console.error('Ошибка');
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
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px', minHeight: 'calc(100vh - 64px)', background: '#EEF2F7' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#013E3F', marginBottom: '4px', letterSpacing: '-1px' }}>Поиск тиммейтов</h1>
        <p style={{ color: '#64748B', fontSize: '16px' }}>Найди студентов с нужными навыками для твоего проекта</p>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Фильтр по навыкам</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ALL_SKILLS.map(skill => (
            <span key={skill} onClick={() => handleSkillFilter(skill)} style={{
              padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
              background: selectedSkill === skill ? 'linear-gradient(135deg, #028090, #02C39A)' : '#F1F5F9',
              color: selectedSkill === skill ? 'white' : '#64748B',
              boxShadow: selectedSkill === skill ? '0 4px 12px rgba(2,128,144,0.3)' : 'none',
              transform: selectedSkill === skill ? 'translateY(-1px)' : 'none',
            }}>{skill}</span>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
          <p style={{ color: '#64748B' }}>Загрузка...</p>
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>👥</div>
          <h3 style={{ color: '#013E3F', fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Никого не найдено</h3>
          <p style={{ color: '#64748B' }}>Попробуй выбрать другой навык</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {users.map(u => (
            <div key={u.id} style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '2px solid transparent', transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.border = '2px solid #E0F7F5'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.border = '2px solid transparent'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #028090, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '22px', fontWeight: '800', flexShrink: 0 }}>
                  {u.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: '700', color: '#013E3F', fontSize: '16px', marginBottom: '2px' }}>{u.full_name}</p>
                  {u.university && <p style={{ fontSize: '13px', color: '#64748B' }}>🎓 {u.university}{u.course ? `, ${u.course} курс` : ''}</p>}
                </div>
              </div>
              {u.about_me && (
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6', marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {u.about_me}
                </p>
              )}
              {u.skills?.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {u.skills.map(s => (
                    <span key={s} style={{ background: s === selectedSkill ? 'linear-gradient(135deg, #028090, #02C39A)' : '#E0F7F5', color: s === selectedSkill ? 'white' : '#028090', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>{s}</span>
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