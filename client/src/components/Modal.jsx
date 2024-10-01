import React from 'react';
import './Modal.css';

const DeleteAccountModal = ({ show, onClose, onConfirm }) => {
    if (!show) {
        return null; // If `show` is false, don't render the modal
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Confirm Deletion</h2>
                <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                <div className="modal-actions">
                    <button onClick={onConfirm} className="confirm-button">Yes, Delete</button>
                    <button onClick={onClose} className="cancel-button">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export const DeleteGroupModal = ({ show, onClose, onConfirm }) => {
    if (!show) {
        return null; // If `show` is false, don't render the modal
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Confirm Deletion</h2>
                <p>Are you sure you want to delete this group? This action cannot be undone.</p>
                <div className="modal-actions">
                    <button onClick={onConfirm} className="confirm-button">Yes, Delete</button>
                    <button onClick={onClose} className="cancel-button">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export const LeaveGroupModal = ({ show, onClose, onConfirm }) => {
    if (!show) {
        return null; // If `show` is false, don't render the modal
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Confirm leaving</h2>
                <p>Are you sure you want to leave this group?</p>
                <div className="modal-actions">
                    <button onClick={onConfirm} className="confirm-button">Yes, Leave</button>
                    <button onClick={onClose} className="cancel-button">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountModal;