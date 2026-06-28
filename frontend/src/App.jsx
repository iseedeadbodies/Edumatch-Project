import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import Teammates from './pages/Teammates';

function parseUserId(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id;
  } catch {
    return null;
  }
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const userId = parseUserId(token);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <BrowserRouter>
      <Navbar onLogout={handleLogout} token={token} />
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        <Route path="/projects" element={token ? <Projects userId={userId} /> : <Navigate to="/login" />} />
        <Route path="/projects/:id" element={token ? <ProjectDetail userId={userId} /> : <Navigate to="/login" />} />
        <Route path="/projects/:id/chat" element={token ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/profile" element={token ? <Profile userId={userId} /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={token ? <Dashboard userId={userId} /> : <Navigate to="/login" />} />
        <Route path="/teammates" element={token ? <Teammates /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={token ? "/projects" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;