import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Dashboard({ userId }) {
  const navigate = useNavigate();
  const [myProjects, setMyProjects] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [incomingApps, setIncomingApps] = useState([]);
  const [activeTab, setActiveTab] = useState('projects');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [projectsRes, appsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/applications/me'),
      ]);
      const all = projectsRes.data.projects || [];
      const mine = all.filter(p => p.owner_id === userId);
      setMyProjects(mine);
      setMyApplications(appsRes.data.applications || []);

      // Загружаем входящие заявки для всех моих проектов
      const incoming = [];
      for (const p of mine) {
        try {
          const res = await api.get(`/projects/${p.id}/applications`);
          const apps = res.data.applications || [];
          apps.forEach(a => incoming.push({ ...a, projectTitle: p.title }));
        } catch {}
      }
      setIncomingApps(incoming);
    } catch {
      console.error('Ошибка загрузки дашборда');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [userId]);

  const handleLeave = async (projectId) => {
    if (!window.confirm('Выйти из проекта?')) return;
    try {
      await api.delete(`/projects/${projectId}/leave`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка');
    }
  };

  const handleAccept = async (appId) => {
    try {
      await api.put(`/applications/${appId}/accept`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка');
    }
  };

  const handleReject = async (appId) => {
    try {
      await api.put(`/applications/${appId}/reject`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка');
    }
  };

  const statusColor = (status) => {
    if (status === 'accepted') return { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', label: '✅ Принята' };
    if (status === 'rejected') return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: '❌ Отклонена' };
    return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', label: '⏳ На рассмотрении' };
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', background: '#EEF2F7' }}>
      <p style={{ color: '#64748B' }}>Загрузка...</p>
    </div>
  );

  const pendingCount = incomingApps.filter(a => a.status === 'pending').length;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', minHeight: 'calc(100vh - 64px)', background: '#EEF2F7' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#013E3F', marginBottom: '4px' }}>Дашборд</h1>
        <p style={{ color: '#64748B', fontSize: '15px' }}>Управляй своими проектами и заявками</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Мои проекты', value: myProjects.length, icon: '🚀', color: '#028090' },
          { label: 'Мои заявки', value: myApplications.length, icon: '📋', color: '#7C3AED' },
          { label: 'Принято', value: myApplications.filter(a => a.status === 'accepted').length, icon: '✅', color: '#16A34A' },
          { label: 'Входящих', value: pendingCount, icon: '📩', color: '#D97706' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'white', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '28px' }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: 'fit-content' }}>
        {[
          { key: 'projects', label: '🚀 Мои проекты' },
          { key: 'applications', label: '📋 Мои заявки' },
          { key: 'incoming', label: `📩 Входящие${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 20px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            background: activeTab === tab.key ? 'linear-gradient(135deg, #028090, #02C39A)' : 'transparent',
            color: activeTab === tab.key ? 'white' : '#64748B',
            transition: 'all 0.2s',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'projects' && (
        <div>
          {myProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
              <h3 style={{ color: '#013E3F', marginBottom: '8px' }}>У тебя пока нет проектов</h3>
              <p style={{ color: '#64748B', marginBottom: '20px' }}>Создай первый проект и найди тиммейтов</p>
              <button onClick={() => navigate('/projects')} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                Перейти к проектам
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {myProjects.map(p => (
                <div key={p.id} style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '2px solid #02C39A' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#013E3F' }}>{p.title}</h3>
                    <span style={{ background: '#E0F7F5', color: '#028090', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>МОЙ ПРОЕКТ</span>
                  </div>
                  {p.description && <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '12px', lineHeight: '1.5' }}>{p.description}</p>}
                  {p.tech_stack?.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {p.tech_stack.map(t => (
                        <span key={t} style={{ background: '#E0F7F5', color: '#028090', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{t}</span>
                      ))}
                    </div>
                  )}
                  {p.deadline && <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px' }}>📅 Дедлайн: {new Date(p.deadline).toLocaleDateString('ru-RU')}</p>}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => navigate(`/projects/${p.id}/chat`)}
                      style={{ padding: '8px 16px', background: '#013E3F', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                      💬 Чат
                    </button>
                    <button onClick={() => navigate('/projects')}
                      style={{ padding: '8px 16px', background: '#F0F9FF', color: '#0284C7', border: '1px solid #BAE6FD', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                      ✏️ Редактировать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'applications' && (
        <div>
          {myApplications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h3 style={{ color: '#013E3F', marginBottom: '8px' }}>Заявок пока нет</h3>
              <p style={{ color: '#64748B', marginBottom: '20px' }}>Найди интересный проект и откликнись</p>
              <button onClick={() => navigate('/projects')} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                Найти проект
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {myApplications.map(a => {
                const s = statusColor(a.status);
                return (
                  <div key={a.id} style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#013E3F', marginBottom: '4px' }}>
                        Проект: {a.project_id.slice(0, 8)}...
                      </p>
                      <p style={{ fontSize: '13px', color: '#64748B' }}>
                        Подана: {new Date(a.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                        {s.label}
                      </span>
                      {(a.status === 'pending' || a.status === 'accepted') && (
                        <button onClick={() => handleLeave(a.project_id)}
                          style={{ padding: '6px 14px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                          {a.status === 'pending' ? 'Отозвать' : 'Выйти'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'incoming' && (
        <div>
          {incomingApps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📩</div>
              <h3 style={{ color: '#013E3F', marginBottom: '8px' }}>Входящих заявок нет</h3>
              <p style={{ color: '#64748B' }}>Заявки от других пользователей появятся здесь</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {incomingApps.map(a => {
                const s = statusColor(a.status);
                return (
                  <div key={a.id} style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: '700', color: '#013E3F', marginBottom: '4px' }}>
                          Проект: {a.projectTitle}
                        </p>
                        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '4px' }}>
                          От пользователя: {a.user_id.slice(0, 8)}...
                        </p>
                        <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                          {new Date(a.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                          {s.label}
                        </span>
                        {a.status === 'pending' && (
                          <>
                            <button onClick={() => handleAccept(a.id)}
                              style={{ padding: '8px 16px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                              ✅ Принять
                            </button>
                            <button onClick={() => handleReject(a.id)}
                              style={{ padding: '8px 16px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                              ❌ Отклонить
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;