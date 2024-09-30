import React from 'react';
import './Modal.css';

const Modal = ({ show, onClose, onConfirm }) => {
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

export const GroupModal = ({ show, onClose, onConfirm }) => {
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


export default Modal;