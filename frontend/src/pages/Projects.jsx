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
    padding: '12px 16px', border: '1.5px solid #E2E8F0', borderRadius: '10px',
    fontSize: '14px', outline: 'none', background: '#FAFAFA', width: '100%',
  };

  const formContent = (onSubmit, submitLabel) => (
    <form onSubmit={onSubmit}>
      <div style={{ display: 'grid', gap: '14px' }}>
        <input placeholder="Название проекта *" value={title} onChange={e => setTitle(e.target.value)}
          style={inputStyle} onFocus={e => { e.target.style.border = '1.5px solid #028090'; e.target.style.background = 'white'; }}
          onBlur={e => { e.target.style.border = '1.5px solid #E2E8F0'; e.target.style.background = '#FAFAFA'; }} required />
        <textarea placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)}
          style={{ ...inputStyle, height: '90px', resize: 'vertical' }}
          onFocus={e => { e.target.style.border = '1.5px solid #028090'; e.target.style.background = 'white'; }}
          onBlur={e => { e.target.style.border = '1.5px solid #E2E8F0'; e.target.style.background = '#FAFAFA'; }} />
        <input placeholder="Стек (React, Go, PostgreSQL)" value={techStack} onChange={e => setTechStack(e.target.value)}
          style={inputStyle} onFocus={e => { e.target.style.border = '1.5px solid #028090'; e.target.style.background = 'white'; }}
          onBlur={e => { e.target.style.border = '1.5px solid #E2E8F0'; e.target.style.background = '#FAFAFA'; }} />
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
          style={inputStyle} onFocus={e => { e.target.style.border = '1.5px solid #028090'; e.target.style.background = 'white'; }}
          onBlur={e => { e.target.style.border = '1.5px solid #E2E8F0'; e.target.style.background = '#FAFAFA'; }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
            {submitLabel}
          </button>
          <button type="button" onClick={() => { setShowForm(false); setEditingProject(null); setTitle(''); setDescription(''); setTechStack(''); setDeadline(''); }}
            style={{ padding: '12px 20px', background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
            Отмена
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', minHeight: 'calc(100vh - 64px)', background: '#EEF2F7' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#013E3F', marginBottom: '4px' }}>Проекты</h1>
          <p style={{ color: '#64748B', fontSize: '15px' }}>Найди команду или создай свой проект</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingProject(null); setTitle(''); setDescription(''); setTechStack(''); setDeadline(''); }}
          style={{ background: showForm ? '#64748B' : 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: showForm ? 'none' : '0 4px 15px rgba(2,128,144,0.3)' }}>
          {showForm ? '✕ Отмена' : '+ Создать проект'}
        </button>
      </div>

      {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>⚠️ {error}</div>}

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input placeholder="🔍 Поиск по названию..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
          onFocus={e => e.target.style.border = '1.5px solid #028090'}
          onBlur={e => e.target.style.border = '1.5px solid #E2E8F0'} />
        <input placeholder="Стек (React, Go...)" value={stack} onChange={e => setStack(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
          onFocus={e => e.target.style.border = '1.5px solid #028090'}
          onBlur={e => e.target.style.border = '1.5px solid #E2E8F0'} />
        <button type="submit" style={{ padding: '12px 24px', background: '#028090', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
          Найти
        </button>
      </form>

      {showForm && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#013E3F', marginBottom: '20px' }}>Новый проект</h3>
          {formContent(handleCreate, 'Создать проект')}
        </div>
      )}

      {editingProject && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '2px solid #028090' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#013E3F', marginBottom: '20px' }}>✏️ Редактировать проект</h3>
          {formContent(handleUpdate, 'Сохранить изменения')}
        </div>
      )}

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
          <h3 style={{ color: '#013E3F', marginBottom: '8px' }}>Проектов пока нет</h3>
          <p style={{ color: '#64748B' }}>Создай первый проект и найди тиммейтов!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {projects.map((p) => {
            const isOwner = p.owner_id === userId;
            return (
              <div key={p.id} style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: isOwner ? '2px solid #02C39A' : '1px solid #F1F5F9', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#013E3F' }}>{p.title}</h3>
                  {isOwner && (
                    <span style={{ background: '#E0F7F5', color: '#028090', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>
                      МОЙ ПРОЕКТ
                    </span>
                  )}
                </div>
                {p.description && <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '12px', lineHeight: '1.5' }}>{p.description}</p>}
                {p.tech_stack?.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {p.tech_stack.map(t => (
                      <span key={t} style={{ background: '#E0F7F5', color: '#028090', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{t}</span>
                    ))}
                  </div>
                )}
                {p.deadline && (
                  <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px' }}>
                    📅 Дедлайн: {new Date(p.deadline).toLocaleDateString('ru-RU')}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => navigate(`/projects/${p.id}`)}
  style={{ padding: '8px 16px', background: '#F8FAFC', color: '#013E3F', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
  👁 Подробнее
</button>
                  <button onClick={() => navigate(`/projects/${p.id}/chat`)}
                    style={{ padding: '8px 16px', background: '#013E3F', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    💬 Чат
                  </button>
                  {isOwner ? (
                    <>
                      <button onClick={() => handleEdit(p)}
                        style={{ padding: '8px 16px', background: '#F0F9FF', color: '#0284C7', border: '1px solid #BAE6FD', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        ✏️ Редактировать
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                        style={{ padding: '8px 16px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        🗑️ Удалить
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleApply(p.id)}
                      style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #028090, #02C39A)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                      Откликнуться
                    </button>
                  )}
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