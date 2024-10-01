import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './signup.css'

const SignUp = () => {
    // State variables to store form inputs
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Function to handle form submission
    const handleSignUp = async (e) => {
        e.preventDefault(); // Prevent the form from refreshing the page
        try {
            const response = await axios.post('https://email.erwanthomy.fr:4430/signup', {
                name: name,
                email: email,
                password: password
            });

            // Display success message if registration is successful
            if (response.status === 201) {
                setSuccess('User created successfully!');
                setError(''); // Clear any previous error messages
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            // Handle error response from the backend
            if (error.response) {
                setError(error.response.data.error);
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSignUp}>
                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Sign Up</button>

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
            </form>
            <p>Already have an account? <a href='/login'>Login</a></p>
        </div>
    );
};

export default SignUp;