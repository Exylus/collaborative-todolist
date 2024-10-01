import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DeleteGroupModal, LeaveGroupModal } from './Modal';
import './Groups.css';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState(null);
    const [groupToLeave, setGroupToLeave] = useState(null);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [inviteCode, setInviteCode] = useState('');

    useEffect(() => {
        // Fetch the list of groups the user is part of when the component loads
        fetchGroups();
    }, []);

    const navigate = useNavigate();

    // Function to fetch groups the user is part of
    const fetchGroups = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('https://email.erwanthomy.fr:4430/groups', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setGroups(response.data); // Update the state with the fetched groups
        } catch (error) {
            if (error.response && error.response.status === 403) {
                setMessage('Session expired. Please log in again.');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setMessage('Failed to fetch group. Please try again.');
            }
            console.error('Error fetching group:', error);
        }
    };

    // Function to handle creating a new group
    const handleCreateGroup = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('You need to login to create a group.');
            return navigate('/login');
        }

        try {
            const response = await axios.post(
                'https://email.erwanthomy.fr:4430/groups/create',
                { groupName, description },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 201) {
                setMessage('Group created successfully!');
                setGroupName('');
                setDescription('');
                fetchGroups(); // Refresh group list
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                setMessage('Session expired. Please log in again.');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setMessage('Failed to create group. Please try again.');
            }
            console.error('Error creating group:', error);
        }
    };

    // Function to handle joining a group with an invite code
    const handleJoinGroup = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post(
                'https://email.erwanthomy.fr:4430/groups/join',
                { inviteCode },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                setMessage('Successfully joined the group!');
                setInviteCode('');
                fetchGroups(); // Refresh the group list after joining a new group
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                setMessage('Session expired. Please log in again.');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setMessage(error.response?.data?.error || 'Failed to join group. Please try again.');
            }
            console.error('Error joining group:', error);
        }
    };

    // Function to handle deleting a group
    const handleDeleteGroup = async () => {
        if (!groupToDelete) return;

        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`https://email.erwanthomy.fr:4430/groups/${groupToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                setMessage('Group deleted successfully!');
                setGroupToDelete(null);
                setShowModal(false);
                fetchGroups(); // Refresh the group list after deleting a group
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                setMessage('Session expired. Please log in again.');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setMessage('Failed to delete group. Please try again.');
            }
            console.error('Error deleting group:', error);
        }
    };

    // Show the delete confirmation modal for the selected group
    const confirmDeleteGroup = (groupId) => {
        setGroupToDelete(groupId);
        setShowModal(true);
    };

    const handleLeaveGroup = async () => {
        if (!groupToLeave) return;

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`https://email.erwanthomy.fr:4430/groups/leave`, { groupId: groupToLeave }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                setMessage('You have left the group successfully.');
                setGroupToLeave(null);
                setShowLeaveModal(false);
                fetchGroups(); // Refresh the group list after leaving the group
            }
        } catch (error) {
            setMessage('Failed to leave the group. Please try again.');
            console.error('Error leaving group:', error);
            setShowLeaveModal(false);
        }
    };

    // Show the leave group confirmation modal
    const confirmLeaveGroup = (groupId) => {
        setGroupToLeave(groupId);
        setShowLeaveModal(true);
    };

    return (
        <div className="groups-container">
            <button className='go-back' onClick={() => (navigate('/dashboard'))}>Go back</button>
            <h2>Groups</h2>

            {/* Create Group Form */}
            <form onSubmit={handleCreateGroup} className="form-section">
                <h3>Create a New Group</h3>
                <div className="form-group">
                    <label>Group Name</label>
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
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
                <button type="submit">Create Group</button>
            </form>
            {/* Join Group Form */}
            <form onSubmit={handleJoinGroup} className="form-section">
                <h3>Join a Group</h3>
                <div className="form-group">
                    <label>Invite Code</label>
                    <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Join Group</button>
            </form>
            {/* Display User's Groups */}
            <h3>Your Groups</h3>
            {groups.length > 0 ? (
                <ul className="group-list">
                    {groups.map((group) => (
                        <li key={group.group_id}>
                            <div className="group-content">
                                <div className="group-informations">
                                    <h4>Group Name: {group.group_name}</h4>
                                    <p>Group Description: {group.description}</p>
                                </div>
                                {group.is_admin && (
                                    <p>Invite code: {group.invite_code}</p>
                                )}
                            </div>


                            {group.is_admin ? (
                                <button
                                    onClick={() => confirmDeleteGroup(group.group_id)}
                                    className="delete-button"
                                >
                                    Delete Group
                                </button>
                            ) : (
                                <button
                                    onClick={() => confirmLeaveGroup(group.group_id)}
                                    className="leave-button"
                                >
                                    Leave Group
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>You are not part of any groups yet.</p>
            )}

            {/* Confirmation Modal for Deleting a Group */}
            <DeleteGroupModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleDeleteGroup}
            />

            {/* Confirmation Modal for Leaving a Group */}
            <LeaveGroupModal
                show={showLeaveModal}
                onClose={() => setShowLeaveModal(false)}
                onConfirm={handleLeaveGroup}
            />

            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default Groups;