import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import historyBg from '../assets/history.jpg';

const History = () => {
  const { user, logout } = useContext(AuthContext);
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('/tasks');
        const doneTasks = res.data.filter(t => t.status === 'DONE');
        // Sort by completedAt descending, fallback to updatedAt for older tasks
        doneTasks.sort((a, b) => {
          const dateA = new Date(a.completedAt || a.updatedAt || 0);
          const dateB = new Date(b.completedAt || b.updatedAt || 0);
          return dateB - dateA;
        });
        setCompletedTasks(doneTasks);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, []);

  return (
    <div className="app-container" style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.65)), url(${historyBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <nav className="navbar" style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(8px)' }}>
        <div className="navbar-brand">TaskMaster - History</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Back to Dashboard</Link>
          <span style={{ fontSize: '0.875rem' }}>Hi, {user.name}</span>
          <button onClick={logout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>

      <main className="main-content" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#2c3e50' }}>History of Completed Work</h2>
        
        {completedTasks.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem', fontSize: '1.1rem' }}>
            No completed tasks yet. Keep up the good work!
          </div>
        ) : (
          <div className="history-list">
            {completedTasks.map(task => (
              <div key={task._id} className="history-card" style={{ 
                padding: '1.25rem', 
                marginBottom: '1rem', 
                border: '1px solid #e1e4e8', 
                borderRadius: '8px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#28a745', fontWeight: 'bold' }}>
                  ✓ Done
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', paddingRight: '4rem' }}>{task.title}</h3>
                {task.description && (
                  <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.95rem' }}>{task.description}</p>
                )}
                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', color: '#555', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                  <span>
                    <strong style={{ color: '#333' }}>Completed On:</strong> {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : (task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'Unknown')}
                  </span>
                  {task.endDate && (
                    <span>
                      <strong style={{ color: '#333' }}>Due Date:</strong> {new Date(task.endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
