import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [stack, setStack] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [deadline, setDeadline] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects', { params: { search, stack } });
      setProjects(res.data.projects || []);
    } catch (err) {
      setError('Ошибка загрузки проектов');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', {
        title,
        description,
        tech_stack: techStack.split(',').map((s) => s.trim()).filter(Boolean),
        deadline: deadline || null,
      });
      setShowForm(false);
      setTitle('');
      setDescription('');
      setTechStack('');
      setDeadline('');
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка создания проекта');
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
      alert(err.response?.data?.error || 'Ошибка отправки заявки');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h2>Проекты</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input placeholder="Поиск по названию" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
        <input placeholder="Фильтр по стеку (React, Go...)" value={stack} onChange={(e) => setStack(e.target.value)}
          style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
        <button type="submit" style={{ padding: '8px 16px', background: '#028090', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Найти
        </button>
      </form>

      <button onClick={() => setShowForm(!showForm)}
        style={{ marginBottom: '20px', padding: '10px 20px', background: '#02C39A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        {showForm ? 'Отмена' : '+ Создать проект'}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} style={{ background: '#f9f9f9', padding: '20px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3 style={{ marginTop: 0 }}>Новый проект</h3>
          <div style={{ marginBottom: '10px' }}>
            <input placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} required />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <textarea placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', height: '80px', border: '1px solid #ddd', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input placeholder="Стек через запятую (React, Go, PostgreSQL)" value={techStack} onChange={(e) => setTechStack(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />
          </div>
          <button type="submit" style={{ padding: '10px 20px', background: '#028090', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Создать
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <p style={{ color: '#666' }}>Проектов пока нет. Создай первый!</p>
      ) : (
        projects.map((p) => (
          <div key={p.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#013E3F' }}>{p.title}</h3>
            <p style={{ color: '#666', margin: '0 0 8px 0' }}>{p.description}</p>
            {p.tech_stack?.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {p.tech_stack.map((t) => (
                  <span key={t} style={{ background: '#E0F7F5', color: '#028090', padding: '2px 8px', borderRadius: '4px', fontSize: '13px' }}>{t}</span>
                ))}
              </div>
            )}
            {p.deadline && (
              <p style={{ fontSize: '13px', color: '#999', margin: '0 0 8px 0' }}>
                Дедлайн: {new Date(p.deadline).toLocaleDateString('ru-RU')}
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => navigate(`/projects/${p.id}/chat`)}
                style={{ padding: '6px 12px', background: '#02C39A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Чат
              </button>
              <button onClick={() => handleApply(p.id)}
                style={{ padding: '6px 12px', background: '#028090', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Откликнуться
              </button>
              <button onClick={() => handleDelete(p.id)}
                style={{ padding: '6px 12px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Удалить
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Projects;