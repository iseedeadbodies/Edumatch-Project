import { useState, useEffect } from 'react';
import api from '../api/axios';

const SKILLS_LIST = ['React', 'Vue', 'Angular', 'Node.js', 'Go', 'Python', 'Java', 'C++', 'PostgreSQL', 'MongoDB', 'Docker', 'Figma'];

function Profile() {
  const [user, setUser] = useState(null);
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
  }, []);

  const toggleSkill = (skill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.put('/users/me', {
        full_name: fullName,
        university,
        course: Number(course),
        about_me: aboutMe,
        skills,
      });
      setUser(res.data);
      setEditing(false);
      setSuccess('Профиль обновлён!');
    } catch {
      setError('Ошибка сохранения');
    }
  };

  if (!user) return <p style={{ padding: '40px', fontFamily: 'Arial' }}>Загрузка...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h2>Мой профиль</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {!editing ? (
        <div>
          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 8px 0' }}>{user.full_name}</h3>
            <p style={{ color: '#666', margin: '0 0 4px 0' }}>{user.email}</p>
            {user.university && <p style={{ margin: '0 0 4px 0' }}>🎓 {user.university}, {user.course} курс</p>}
            {user.about_me && <p style={{ margin: '8px 0 0 0' }}>{user.about_me}</p>}
          </div>

          {user.skills?.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <strong>Навыки:</strong>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {user.skills.map((s) => (
                  <span key={s} style={{ background: '#E0F7F5', color: '#028090', padding: '4px 10px', borderRadius: '4px', fontSize: '13px' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setEditing(true)}
            style={{ padding: '10px 20px', background: '#028090', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Редактировать
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '12px' }}>
            <label>Имя</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px', marginTop: '4px' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label>Университет</label>
            <input value={university} onChange={(e) => setUniversity(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px', marginTop: '4px' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label>Курс</label>
            <input type="number" min="1" max="6" value={course} onChange={(e) => setCourse(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px', marginTop: '4px' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label>О себе</label>
            <textarea value={aboutMe} onChange={(e) => setAboutMe(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', height: '80px', border: '1px solid #ddd', borderRadius: '4px', marginTop: '4px' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Навыки</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
              {SKILLS_LIST.map((s) => (
                <span key={s} onClick={() => toggleSkill(s)}
                  style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer',
                    background: skills.includes(s) ? '#028090' : '#f0f0f0',
                    color: skills.includes(s) ? 'white' : '#333' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ padding: '10px 20px', background: '#028090', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Сохранить
            </button>
            <button type="button" onClick={() => setEditing(false)}
              style={{ padding: '10px 20px', background: '#ddd', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Отмена
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Profile;