import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ToDoList.css';
import { useNavigate } from 'react-router-dom';

const ToDoLists = () => {
    const [groups, setGroups] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [taskType, setTaskType] = useState('personal'); // personal or group
    const [selectedGroup, setSelectedGroup] = useState('');
    const [view, setView] = useState('menu'); // menu, create, view
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        if (view === 'create') {
            fetchGroups();
        }
        if (view === 'view') {
            fetchTasks();
        }
    }, [view]);

    // Function to fetch user's groups for task creation
    const fetchGroups = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('You need to login to access your groups.');
            return;
        }

        try {
            const response = await axios.get('http://localhost:3113/groups', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setGroups(response.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
            setMessage('Error fetching groups.');
        }
    };

    // Function to fetch all tasks for the user
    const fetchTasks = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('You need to login to view your tasks.');
            return;
        }

        try {
            const response = await axios.get('http://localhost:3113/tasks', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTasks(response.data); // Update tasks state with fetched tasks
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setMessage('Error fetching tasks. Please log in again.');
        }
    };

    // Function to create a task
    const handleCreateTask = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post(
                'http://localhost:3113/tasks/create',
                {
                    title,
                    description,
                    dueDate,
                    groupId: taskType === 'group' ? selectedGroup : null, // Use groupId if it's a group task
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 201) {
                setMessage('Task created successfully!');
                setTitle('');
                setDescription('');
                setDueDate('');
                setSelectedGroup('');
                setView('menu'); // Go back to the menu after creating a task
            }
        } catch (error) {
            setMessage('Failed to create task. Please try again.');
            console.error('Error creating task:', error);
        }
    };

    // Function to delete a task
    const handleDeleteTask = async (taskId) => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.delete(`http://localhost:3113/tasks/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                setMessage('Task deleted successfully!');
                fetchTasks(); // Refresh the task list after deletion
            }
        } catch (error) {
            setMessage('Failed to delete task. Please try again.');
            console.error('Error deleting task:', error);
        }
    };

    // Function to handle view change
    const handleViewChange = (selectedView) => {
        setView(selectedView);
        setMessage('');
    };

    return (
        <div className="todo-container">
            <button className='go-back' onClick={() => (navigate('/dashboard'))}>Go back</button>
            <h2>To-Do List Management</h2>

            {/* Menu View */}
            {view === 'menu' && (
                <div className="menu-buttons">
                    <button onClick={() => handleViewChange('create')} className="menu-button">
                        Create Task
                    </button>
                    <button onClick={() => handleViewChange('view')} className="menu-button">
                        View Tasks
                    </button>
                </div>
            )}

            {/* Create Task View */}
            {view === 'create' && (
                <div>
                    <button onClick={() => handleViewChange('menu')} className="back-button">
                        Back to Menu
                    </button>
                    <form onSubmit={handleCreateTask} className="form-section">
                        <h3>Create a New Task</h3>

                        <div className="form-group">
                            <label>Task Type</label>
                            <select
                                value={taskType}
                                onChange={(e) => setTaskType(e.target.value)}
                                required
                            >
                                <option value="personal">Personal Task</option>
                                <option value="group">Group Task</option>
                            </select>
                        </div>

                        {taskType === 'group' && (
                            <div className="form-group">
                                <label>Select Group</label>
                                <select
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select a group</option>
                                    {groups.map((group) => (
                                        <option key={group.group_id} value={group.group_id}>
                                            {group.group_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                        <button type="submit">Create Task</button>
                    </form>
                </div>
            )}

            {/* View Tasks View */}
            {view === 'view' && (
                <div>
                    <button onClick={() => handleViewChange('menu')} className="back-button">
                        Back to Menu
                    </button>
                    <h3>Your Tasks</h3>
                    {tasks.length > 0 ? (
                        <ul className="task-list">
                            {tasks.map((task) => (
                                <li key={task.task_id}>
                                    {task.group_id && (
                                        <p>Group: <strong>{task.group_name}</strong></p>
                                    )}
                                    <h4>{task.title}</h4>
                                    <p>{task.description}</p>
                                    <p>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</p>
                                    <button onClick={() => handleDeleteTask(task.task_id)} className="delete-button">
                                        Delete Task
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>You have no tasks yet.</p>
                    )}
                </div>
            )}

            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default ToDoLists;