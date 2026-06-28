import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Projects({ userId }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [stack, setStack] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [deadline, setDeadline] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects', { params: { search, stack } });
      setProjects(res.data.projects || []);
    } catch {
      setError('Ошибка загрузки проектов');
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchProjects(); };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', {
        title, description,
        tech_stack: techStack.split(',').map(s => s.trim()).filter(Boolean),
        deadline: deadline || null,
      });
      setShowForm(false);
      setTitle(''); setDescription(''); setTechStack(''); setDeadline('');
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка создания');
    }
  };

  const handleEdit = (p) => {
    setEditingProject(p);
    setTitle(p.title);
    setDescription(p.description || '');
    setTechStack(p.tech_stack?.join(', ') || '');
    setDeadline(p.deadline ? p.deadline.split('T')[0] : '');
    setShowForm(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${editingProject.id}`, {
        title, description,
        tech_stack: techStack.split(',').map(s => s.trim()).filter(Boolean),
        deadline: deadline || null,
      });
      setEditingProject(null);
      setTitle(''); setDescription(''); setTechStack(''); setDeadline('');
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка обновления');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить проект?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка удаления');
    }
  };

  const handleApply = async (id) => {
    try {
      await api.post(`/projects/${id}/apply`);
      alert('Заявка отправлена!');
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка');
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', border: '2px solid #E2E8F0',
    borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#F8FAFC',
  };

  const formContent = (onSubmit, submitLabel) => (
    <form onSubmit={onSubmit}>
      <div style={{ display: 'grid', gap: '14px' }}>
        <input placeholder="Название проекта *" value={title} onChange={e => setTitle(e.target.value)}
          style={inputStyle}
          onFocus={e => { e.target.style.border = '2px solid #028090'; e.target.style.background = 'white'; }}
          onBlur={e => { e.target.style.border = '2px solid #E2E8F0'; e.target.style.background = '#F8FAFC'; }} required />
        <textarea placeholder="Описание проекта" value={description} onChange={e => setDescription(e.target.value)}
          style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
          onFocus={e => { e.target.style.border = '2px solid #028090'; e.target.style.background = 'white'; }}
          onBlur={e => { e.target.style.border = '2px solid #E2E8F0'; e.target.style.background = '#F8FAFC'; }} />
        <input placeholder="Стек технологий (React, Go, PostgreSQL)" value={techStack} onChange={e => setTechStack(e.target.value)}
          style={inputStyle}
          onFocus={e => { e.target.style.border = '2px solid #028090'; e.target.style.background = 'white'; }}
          onBlur={e => { e.target.style.border = '2px solid #E2E8F0'; e.target.style.background = '#F8FAFC'; }} />
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
          style={inputStyle}
          onFocus={e => { e.target.style.border = '2px solid #028090'; e.target.style.background = 'white'; }}
          onBlur={e => { e.target.style.border = '2px solid #E2E8F0'; e.target.style.background = '#F8FAFC'; }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(2,128,144,0.3)' }}>
            {submitLabel}
          </button>
          <button type="button" onClick={() => { setShowForm(false); setEditingProject(null); setTitle(''); setDescription(''); setTechStack(''); setDeadline(''); }}
            style={{ padding: '13px 20px', background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
            Отмена
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px', minHeight: 'calc(100vh - 64px)', background: '#EEF2F7' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#013E3F', marginBottom: '4px', letterSpacing: '-1px' }}>Проекты</h1>
          <p style={{ color: '#64748B', fontSize: '16px' }}>Найди команду или создай свой проект</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingProject(null); setTitle(''); setDescription(''); setTechStack(''); setDeadline(''); }}
          style={{ background: showForm ? '#64748B' : 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', padding: '13px 28px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: showForm ? 'none' : '0 4px 20px rgba(2,128,144,0.4)' }}>
          {showForm ? '✕ Отмена' : '+ Создать проект'}
        </button>
      </div>

      {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '14px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>⚠️ {error}</div>}

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
        <input placeholder="🔍  Поиск по названию..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '13px 16px', border: '2px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', outline: 'none', background: 'white' }}
          onFocus={e => { e.target.style.border = '2px solid #028090'; e.target.style.boxShadow = '0 0 0 4px rgba(2,128,144,0.1)'; }}
          onBlur={e => { e.target.style.border = '2px solid #E2E8F0'; e.target.style.boxShadow = 'none'; }} />
        <input placeholder="Стек (React, Go...)" value={stack} onChange={e => setStack(e.target.value)}
          style={{ flex: 1, padding: '13px 16px', border: '2px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', outline: 'none', background: 'white' }}
          onFocus={e => { e.target.style.border = '2px solid #028090'; e.target.style.boxShadow = '0 0 0 4px rgba(2,128,144,0.1)'; }}
          onBlur={e => { e.target.style.border = '2px solid #E2E8F0'; e.target.style.boxShadow = 'none'; }} />
        <button type="submit" style={{ padding: '13px 28px', background: '#013E3F', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
          Найти
        </button>
      </form>

      {showForm && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', marginBottom: '28px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '2px solid #E0F7F5' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#013E3F', marginBottom: '24px' }}>✨ Новый проект</h3>
          {formContent(handleCreate, 'Создать проект')}
        </div>
      )}

      {editingProject && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', marginBottom: '28px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '2px solid #028090' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#013E3F', marginBottom: '24px' }}>✏️ Редактировать проект</h3>
          {formContent(handleUpdate, 'Сохранить изменения')}
        </div>
      )}

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚀</div>
          <h3 style={{ color: '#013E3F', fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Проектов пока нет</h3>
          <p style={{ color: '#64748B', fontSize: '16px' }}>Создай первый проект и найди тиммейтов!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {projects.map((p) => {
            const isOwner = p.owner_id === userId;
            return (
              <div key={p.id} style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: isOwner ? '2px solid #02C39A' : '2px solid transparent', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#013E3F', cursor: 'pointer' }} onClick={() => navigate(`/projects/${p.id}`)}>
                    {p.title}
                  </h3>
                  {isOwner && (
                    <span style={{ background: 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                      МОЙ ПРОЕКТ
                    </span>
                  )}
                </div>
                {p.description && <p style={{ color: '#64748B', fontSize: '15px', marginBottom: '16px', lineHeight: '1.6' }}>{p.description}</p>}
                {p.tech_stack?.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {p.tech_stack.map(t => (
                      <span key={t} style={{ background: '#E0F7F5', color: '#028090', padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{t}</span>
                    ))}
                  </div>
                )}
                {p.deadline && (
                  <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📅 Дедлайн: {new Date(p.deadline).toLocaleDateString('ru-RU')}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => navigate(`/projects/${p.id}`)}
                    style={{ padding: '9px 18px', background: '#F8FAFC', color: '#013E3F', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    👁 Подробнее
                  </button>
                  <button onClick={() => navigate(`/projects/${p.id}/chat`)}
                    style={{ padding: '9px 18px', background: '#013E3F', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    💬 Чат
                  </button>
                  {isOwner ? (
                    <>
                      <button onClick={() => handleEdit(p)}
                        style={{ padding: '9px 18px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        ✏️ Редактировать
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                        style={{ padding: '9px 18px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        🗑️ Удалить
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleApply(p.id)}
                      style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(2,128,144,0.3)' }}>
                      Откликнуться
                    </button>
                  )}
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/projects/${p.id}`); alert('Ссылка скопирована!'); }}
                    style={{ padding: '9px 18px', background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    🔗
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Projects;