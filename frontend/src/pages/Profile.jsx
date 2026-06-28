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
    api.get('/users/me').then(res => {
      setUser(res.data);
      setFullName(res.data.full_name || '');
      setUniversity(res.data.university || '');
      setCourse(res.data.course || '');
      setAboutMe(res.data.about_me || '');
      setSkills(res.data.skills || []);
    }).catch(() => setError('Ошибка загрузки профиля'));

    api.get('/projects').then(res => {
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
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
        <p style={{ color: '#64748B', fontSize: '16px' }}>Загрузка...</p>
      </div>
    </div>
  );

  const inputStyle = { width: '100%', padding: '12px 16px', border: '2px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#F8FAFC' };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px', minHeight: 'calc(100vh - 64px)', background: '#EEF2F7' }}>
      <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#013E3F', marginBottom: '28px', letterSpacing: '-1px' }}>Мой профиль</h1>

      {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '14px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px' }}>⚠️ {error}</div>}
      {success && <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A', padding: '14px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px' }}>✅ {success}</div>}

      {!editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Карточка профиля */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(135deg, #013E3F, #028090)' }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '20px', marginBottom: '20px', paddingTop: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #02C39A, #028090)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', fontWeight: '800', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', flexShrink: 0 }}>
                {user.full_name?.[0]?.toUpperCase()}
              </div>
              <div style={{ paddingBottom: '4px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#013E3F', marginBottom: '2px' }}>{user.full_name}</h2>
                <p style={{ color: '#64748B', fontSize: '14px' }}>{user.email}</p>
              </div>
            </div>
            {user.university && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '14px', marginBottom: '12px', padding: '10px 14px', background: '#F8FAFC', borderRadius: '10px' }}>
                🎓 <span>{user.university}, {user.course} курс</span>
              </div>
            )}
            {user.about_me && (
              <p style={{ color: '#374151', fontSize: '15px', lineHeight: '1.7', padding: '14px', background: '#F8FAFC', borderRadius: '10px' }}>{user.about_me}</p>
            )}
          </div>

          {/* Навыки */}
          {user.skills?.length > 0 && (
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Навыки</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {user.skills.map(s => (
                  <span key={s} style={{ background: 'linear-gradient(135deg, #E0F7F5, #B2EBF2)', color: '#028090', padding: '7px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', border: '1px solid #B2EBF2' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Мои проекты */}
          {myProjects.length > 0 && (
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                Мои проекты ({myProjects.length})
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {myProjects.map(p => (
                  <div key={p.id} style={{ padding: '16px 20px', border: '2px solid #E0F7F5', borderRadius: '14px', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#013E3F', marginBottom: '6px' }}>{p.title}</h4>
                      {p.tech_stack?.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {p.tech_stack.slice(0, 3).map(t => (
                            <span key={t} style={{ background: '#E0F7F5', color: '#028090', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => navigate(`/projects/${p.id}/chat`)}
                      style={{ padding: '8px 16px', background: '#013E3F', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      💬 Чат
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setEditing(true)} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 20px rgba(2,128,144,0.4)' }}>
            ✏️ Редактировать профиль
          </button>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#013E3F', marginBottom: '24px' }}>✏️ Редактирование</h2>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gap: '18px' }}>
              {[
                { label: 'Имя', value: fullName, onChange: setFullName, type: 'text' },
                { label: 'Университет', value: university, onChange: setUniversity, type: 'text' },
                { label: 'Курс', value: course, onChange: setCourse, type: 'number' },
              ].map(field => (
                <div key={field.label}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{field.label}</label>
                  <input type={field.type} value={field.value} onChange={e => field.onChange(e.target.value)} style={inputStyle}
                    onFocus={e => { e.target.style.border = '2px solid #028090'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(2,128,144,0.1)'; }}
                    onBlur={e => { e.target.style.border = '2px solid #E2E8F0'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>О себе</label>
                <textarea value={aboutMe} onChange={e => setAboutMe(e.target.value)} style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
                  onFocus={e => { e.target.style.border = '2px solid #028090'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(2,128,144,0.1)'; }}
                  onBlur={e => { e.target.style.border = '2px solid #E2E8F0'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Навыки</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {SKILLS_LIST.map(s => (
                    <span key={s} onClick={() => toggleSkill(s)} style={{
                      padding: '7px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
                      background: skills.includes(s) ? 'linear-gradient(135deg, #028090, #02C39A)' : '#F1F5F9',
                      color: skills.includes(s) ? 'white' : '#64748B',
                      boxShadow: skills.includes(s) ? '0 4px 12px rgba(2,128,144,0.3)' : 'none',
                    }}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 20px rgba(2,128,144,0.4)' }}>
                  Сохранить
                </button>
                <button type="button" onClick={() => setEditing(false)} style={{ flex: 1, padding: '14px', background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
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