import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import TaskModal from './TaskModal';
import TodoReviewModal from './TodoReviewModal';
import taskBg from '../assets/task.png';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showAchievement = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const location = useLocation();
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/tasks');
      setTasks(res.data);
      
      if (sessionStorage.getItem('justLoggedIn') === 'true') {
        const pendingTasks = res.data.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS');
        if (pendingTasks.length > 0) {
          setShowReviewModal(true);
        }
        sessionStorage.removeItem('justLoggedIn');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    // Check previous status
    const task = tasks.find(t => t._id === taskId);
    const previousStatus = task ? task.status : null;

    // Optimistic update
    const updatedTasks = tasks.map(t => 
      t._id === taskId ? { ...t, status } : t
    );
    setTasks(updatedTasks);

    try {
      await axios.put(`/tasks/${taskId}`, { status });
      if (status === 'DONE' && previousStatus !== 'DONE') {
        showAchievement(`Achievement Unlocked: Completed "${task.title}"! 🎉`);
      }
    } catch (err) {
      console.error(err);
      fetchTasks(); // Revert on failure
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleReviewSave = async (updates) => {
    let completedCount = 0;
    const updatePromises = Object.entries(updates).map(([taskId, status]) => {
      const task = tasks.find(t => t._id === taskId);
      if (task && task.status !== status) {
        if (status === 'DONE') completedCount++;
        return axios.put(`/tasks/${taskId}`, { status });
      }
      return null;
    }).filter(Boolean);
    
    try {
      await Promise.all(updatePromises);
      fetchTasks();
      if (completedCount > 0) {
        showAchievement(`Achievement Unlocked: Completed ${completedCount} task(s)! 🎉`);
      }
    } catch (err) {
      console.error(err);
    }
    setShowReviewModal(false);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`/tasks/${id}`);
        setTasks(tasks.filter(t => t._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const onSave = async (taskData) => {
    if (editingTask) {
      try {
        const previousStatus = editingTask.status;
        const res = await axios.put(`/tasks/${editingTask._id}`, taskData);
        setTasks(tasks.map(t => t._id === editingTask._id ? res.data : t));
        if (taskData.status === 'DONE' && previousStatus !== 'DONE') {
          showAchievement(`Achievement Unlocked: Completed "${taskData.title}"! 🎉`);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        const res = await axios.post('/tasks', taskData);
        setTasks([res.data, ...tasks]);
        if (taskData.status === 'DONE') {
          showAchievement(`Achievement Unlocked: Completed "${taskData.title}" immediately! 🎉`);
        }
      } catch (err) {
        console.error(err);
      }
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'TODO': return 'To Do';
      case 'IN_PROGRESS': return 'In Progress';
      case 'DONE': return 'Done';
      default: return status;
    }
  };

  const columns = ['TODO', 'IN_PROGRESS', 'DONE'];

  return (
    <div className="app-container" style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.65)), url(${taskBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <nav className="navbar" style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(8px)' }}>
        <div className="navbar-brand">TaskMaster</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/history" className="btn btn-secondary" style={{ textDecoration: 'none' }}>History</Link>
          <span style={{ fontSize: '0.875rem' }}>Hi, {user.name}</span>
          <button onClick={logout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>

      <main className="main-content">
        <div className="dashboard-header">
          <h2>Your Tasks</h2>
          <button 
            className="btn btn-primary"
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
          >
            + New Task
          </button>
        </div>

        <div className="task-board">
          {columns.map(status => (
            <div 
              key={status} 
              className="task-column"
              onDrop={(e) => handleDrop(e, status)}
              onDragOver={handleDragOver}
            >
              <div className="task-column-header">
                {getStatusLabel(status)}
                <span className="task-count">
                  {tasks.filter(t => t.status === status).length}
                </span>
              </div>
              
              <div className="task-list">
                {tasks.filter(t => t.status === status).map(task => (
                  <div 
                    key={task._id} 
                    className="task-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                  >
                    <div className="task-card-title">{task.title}</div>
                    {task.description && (
                      <div className="task-card-desc">{task.description}</div>
                    )}
                    {task.endDate && (
                      <div className="task-card-date" style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                        Due: {new Date(task.endDate).toLocaleDateString()}
                      </div>
                    )}
                    <div className="task-card-footer">
                      <span className={`status-badge status-${status.toLowerCase()}`}>
                        {getStatusLabel(status)}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => handleEdit(task)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => handleDelete(task._id)}
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {isModalOpen && (
        <TaskModal 
          task={editingTask} 
          onSave={onSave} 
          onClose={() => { setIsModalOpen(false); setEditingTask(null); }} 
        />
      )}

      {showReviewModal && (
        <TodoReviewModal 
          tasks={tasks.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS')} 
          onSave={handleReviewSave} 
          onClose={() => setShowReviewModal(false)} 
        />
      )}

      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
