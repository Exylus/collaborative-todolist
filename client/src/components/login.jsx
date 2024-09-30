import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css'

const Login = () => {
    // State variables to store form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // useNavigate hook to redirect to a different page
    const navigate = useNavigate();

    // Function to handle form submission
    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent the form from refreshing the page
        try {
            const response = await axios.post('http://localhost:3113/login', {
                email,
                password
            });

            // If login is successful
            if (response.status === 200) {
                // Store the token in localStorage
                localStorage.setItem('token', response.data.token);

                // Clear error message
                setError('');

                // Redirect to the dashboard
                navigate('/dashboard');
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
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
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

                <button type="submit">Login</button>

                {error && <p className="error-message">{error}</p>}
            </form>
            <p>Don't have an account? <a href='/signup'>Register</a></p>
        </div>
    );
};

export default Login;