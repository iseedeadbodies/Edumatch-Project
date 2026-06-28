import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const SKILLS_LIST = ['React', 'Vue', 'Angular', 'Node.js', 'Go', 'Python', 'Java', 'C++', 'PostgreSQL', 'MongoDB', 'Docker', 'Figma'];

function Profile({ userId }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    api.get('/users/me').then((res) => {
      setUser(res.data);
      setFullName(res.data.full_name || '');
      setUniversity(res.data.university || '');
      setCourse(res.data.course || '');
      setAboutMe(res.data.about_me || '');
      setSkills(res.data.skills || []);
    }).catch(() => setError('Ошибка загрузки профиля'));

    api.get('/projects').then((res) => {
      const all = res.data.projects || [];
      setMyProjects(all.filter(p => p.owner_id === userId));
    });
  }, [userId]);

  const toggleSkill = (skill) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const res = await api.put('/users/me', { full_name: fullName, university, course: Number(course), about_me: aboutMe, skills });
      setUser(res.data);
      setEditing(false);
      setSuccess('Профиль обновлён!');
    } catch {
      setError('Ошибка сохранения');
    }
  };

  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', background: '#EEF2F7' }}>
      <p style={{ color: '#64748B' }}>Загрузка...</p>
    </div>
  );

  const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#FAFAFA' };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px', minHeight: 'calc(100vh - 64px)', background: '#EEF2F7' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#013E3F', marginBottom: '24px' }}>Мой профиль</h1>

      {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>⚠️ {error}</div>}
      {success && <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>✅ {success}</div>}

      {!editing ? (
        <div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #028090, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '700' }}>
                {user.full_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#013E3F', marginBottom: '2px' }}>{user.full_name}</h2>
                <p style={{ color: '#64748B', fontSize: '14px' }}>{user.email}</p>
              </div>
            </div>
            {user.university && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '14px', marginBottom: '8px' }}>
                <span>🎓</span><span>{user.university}, {user.course} курс</span>
              </div>
            )}
            {user.about_me && <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6', marginTop: '12px', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>{user.about_me}</p>}
          </div>

          {user.skills?.length > 0 && (
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Навыки</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {user.skills.map(s => (
                  <span key={s} style={{ background: '#E0F7F5', color: '#028090', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {myProjects.length > 0 && (
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                Мои проекты ({myProjects.length})
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {myProjects.map(p => (
                  <div key={p.id} style={{ padding: '16px', border: '1.5px solid #E0F7F5', borderRadius: '12px', background: '#F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#013E3F' }}>{p.title}</h4>
                      <button onClick={() => navigate(`/projects/${p.id}/chat`)}
                        style={{ padding: '5px 12px', background: '#013E3F', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        💬 Чат
                      </button>
                    </div>
                    {p.tech_stack?.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {p.tech_stack.map(t => (
                          <span key={t} style={{ background: '#E0F7F5', color: '#028090', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setEditing(true)} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(2,128,144,0.3)' }}>
            ✏️ Редактировать профиль
          </button>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Имя</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle}
                  onFocus={e => { e.target.style.border = '1.5px solid #028090'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.border = '1.5px solid #E2E8F0'; e.target.style.background = '#FAFAFA'; }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Университет</label>
                <input value={university} onChange={e => setUniversity(e.target.value)} style={inputStyle}
                  onFocus={e => { e.target.style.border = '1.5px solid #028090'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.border = '1.5px solid #E2E8F0'; e.target.style.background = '#FAFAFA'; }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Курс</label>
                <input type="number" min="1" max="6" value={course} onChange={e => setCourse(e.target.value)} style={inputStyle}
                  onFocus={e => { e.target.style.border = '1.5px solid #028090'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.border = '1.5px solid #E2E8F0'; e.target.style.background = '#FAFAFA'; }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>О себе</label>
                <textarea value={aboutMe} onChange={e => setAboutMe(e.target.value)} style={{ ...inputStyle, height: '90px', resize: 'vertical' }}
                  onFocus={e => { e.target.style.border = '1.5px solid #028090'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.border = '1.5px solid #E2E8F0'; e.target.style.background = '#FAFAFA'; }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Навыки</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {SKILLS_LIST.map(s => (
                    <span key={s} onClick={() => toggleSkill(s)} style={{
                      padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
                      background: skills.includes(s) ? '#028090' : '#F1F5F9',
                      color: skills.includes(s) ? 'white' : '#64748B',
                    }}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(2,128,144,0.3)' }}>
                  Сохранить
                </button>
                <button type="button" onClick={() => setEditing(false)} style={{ flex: 1, padding: '12px', background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                  Отмена
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Profile;