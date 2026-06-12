import { useState } from 'react';

const TodoReviewModal = ({ tasks, onSave, onClose }) => {
  const [updates, setUpdates] = useState({});

  const handleStatusChange = (taskId, newStatus) => {
    setUpdates(prev => ({
      ...prev,
      [taskId]: newStatus
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(updates);
  };

  if (tasks.length === 0) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%' }}>
        <div className="modal-header">
          <h3>Review Your Pending Tasks</h3>
        </div>
        
        <div style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
          Welcome back! Here are the tasks you are currently working on or have yet to start. Please review and update their statuses if they have changed.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="task-review-list" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem' }}>
            {tasks.map(task => (
              <div key={task._id} style={{ marginBottom: '1rem', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--background)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>{task.title}</h4>
                {task.description && <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{task.description}</p>}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ fontWeight: '500', fontSize: '0.875rem', color: 'var(--text-main)' }}>Status:</label>
                  <select 
                    value={updates[task._id] || task.status} 
                    onChange={e => handleStatusChange(task._id, e.target.value)}
                    style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-main)' }}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          
          <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">
              Confirm and Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoReviewModal;
