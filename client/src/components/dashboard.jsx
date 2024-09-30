import React from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();

    // Handlers for navigation buttons
    const handleAccountManagement = () => {
        navigate('/account');
    };

    const handleMyTodoLists = () => {
        navigate('/todos');
    };

    const handleGroups = () => {
        navigate('/groups');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/')
    }

    return (
        <div className="dashboard-container">
            <h1>Welcome to Your Dashboard</h1>
            <div className="dashboard-menu">
                <button onClick={handleAccountManagement}>Account Management</button>
                <button onClick={handleMyTodoLists}>My Todo Lists</button>
                <button onClick={handleGroups}>Groups</button>
            </div>
            <button className='logout-button' onClick={() => handleLogout()}>Log out</button>
        </div>
    );
};

export default Dashboard;