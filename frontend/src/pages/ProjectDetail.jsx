import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function ProjectDetail({ userId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, membersRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/projects/${id}/members`),
        ]);
        setProject(projectRes.data);
        setMembers(membersRes.data.members || []);
      } catch {
        setError('Ошибка загрузки проекта');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleApply = async () => {
    try {
      await api.post(`/projects/${id}/apply`);
      alert('Заявка отправлена!');
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', background: '#EEF2F7' }}>
      <p style={{ color: '#64748B' }}>Загрузка...</p>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', background: '#EEF2F7' }}>
      <p style={{ color: '#DC2626' }}>{error}</p>
    </div>
  );

  const isOwner = project?.owner_id === userId;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', minHeight: 'calc(100vh - 64px)', background: '#EEF2F7' }}>
      <button onClick={() => navigate('/projects')} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>
        ← Назад
      </button>

      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: isOwner ? '2px solid #02C39A' : '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#013E3F' }}>{project?.title}</h1>
          {isOwner && (
            <span style={{ background: '#E0F7F5', color: '#028090', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>МОЙ ПРОЕКТ</span>
          )}
        </div>

        {project?.description && (
          <p style={{ color: '#64748B', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px' }}>{project.description}</p>
        )}

        {project?.tech_stack?.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Стек технологий</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {project.tech_stack.map(t => (
                <span key={t} style={{ background: '#E0F7F5', color: '#028090', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {project?.deadline && (
          <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '24px' }}>
            📅 Дедлайн: {new Date(project.deadline).toLocaleDateString('ru-RU')}
          </p>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate(`/projects/${id}/chat`)}
            style={{ padding: '12px 24px', background: '#013E3F', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
            💬 Чат проекта
          </button>
          {!isOwner && (
            <button onClick={handleApply}
              style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(2,128,144,0.3)' }}>
              Откликнуться
            </button>
          )}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#013E3F', marginBottom: '16px' }}>
          Участники команды {members.length > 0 && `(${members.length})`}
        </h2>
        {members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#94A3B8' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>👥</div>
            <p>Пока нет принятых участников</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {members.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #028090, #02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '700', flexShrink: 0 }}>
                  {m.full_name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '700', color: '#013E3F', fontSize: '15px', marginBottom: '2px' }}>{m.full_name}</p>
                  {m.university && <p style={{ fontSize: '13px', color: '#64748B' }}>🎓 {m.university}, {m.course} курс</p>}
                  {m.skills?.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {m.skills.slice(0, 4).map(s => (
                        <span key={s} style={{ background: '#E0F7F5', color: '#028090', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetail;