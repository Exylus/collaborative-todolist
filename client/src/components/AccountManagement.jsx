import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DeleteAccountModal from './Modal';
import './AccountManagement.css';

const AccountManagement = () => {
    const [userData, setUserData] = useState({ name: '', email: '' });
    const [password, setPassword] = useState({ oldPassword: '', newPassword: '' });
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false); // Control modal visibility
    const navigate = useNavigate();

    // Function to fetch user details
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            axios
                .get('http://localhost:3113/account', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    setUserData({ name: response.data.name, email: response.data.email });
                })
                .catch((error) => {
                    if (error.response && error.response.status === 403) {
                        setMessage('Session expired. Please log in again.');
                        localStorage.removeItem('token');
                        navigate('/login');
                    } else {
                        setMessage('Failed to fetch user info. Please try again.');
                    }
                    console.error('Error fetching user info:', error);
                });
        }
    }, [navigate]);

    // Function to handle user info update
    const handleInfoUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await axios.put(
                'http://localhost:3113/account/update',
                { name: userData.name, email: userData.email },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                setMessage('User information updated successfully.');
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                setMessage('Session expired. Please log in again.');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setMessage('Failed to update user info. Please try again.');
            }
            console.error('Error updating user:', error);
        }
    };

    // Function to handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await axios.put(
                'http://localhost:3113/account/password',
                { oldPassword: password.oldPassword, newPassword: password.newPassword },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                setMessage('Password updated successfully.');
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                setMessage('Session expired. Please log in again.');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setMessage('Failed to change user password. Please try again.');
            }
            console.error('Error changing password:', error);
        }
    };

    // Function to handle account deletion
    const handleDeleteAccount = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.delete('http://localhost:3113/account/delete', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                // Clear local storage and redirect to signup or home page
                localStorage.removeItem('token');
                navigate('/');
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                setMessage('Session expired. Please log in again.');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setMessage('Failed to delete user. Please try again.');
            }
            console.error('Error deleting user:', error);
        }
    };

    // Show confirmation modal before deleting account
    const confirmDelete = () => {
        setShowModal(true); // Show modal
    };

    // Confirm deletion from the modal
    const handleConfirmDelete = () => {
        setShowModal(false); // Hide modal
        handleDeleteAccount(); // Proceed with account deletion
    };

    return (
        <div className="account-management-container">
            <button className='go-back' onClick={() => (navigate('/dashboard'))}>Go back</button>
            <h2>Account Management</h2>

            {/* Edit User Information */}
            <form onSubmit={handleInfoUpdate} className="form-section">
                <h3>Update Personal Information</h3>
                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        required
                    />
                </div>
                <button type="submit">Update Info</button>
            </form>

            {/* Change Password */}
            <form onSubmit={handlePasswordChange} className="form-section">
                <h3>Change Password</h3>
                <div className="form-group">
                    <label>Old Password</label>
                    <input
                        type="password"
                        value={password.oldPassword}
                        onChange={(e) => setPassword({ ...password, oldPassword: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        value={password.newPassword}
                        onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                        required
                    />
                </div>
                <button type="submit">Change Password</button>
            </form>

            {/* Delete Account */}
            <div className="delete-account">
                <button onClick={confirmDelete} className="delete-button">Delete Account</button>
            </div>

            {/* Confirmation Modal */}
            <DeleteAccountModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleConfirmDelete}
            />

            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default AccountManagement;