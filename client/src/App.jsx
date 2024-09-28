import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SignUp from './components/signup.jsx';
import Login from './components/login.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './components/dashboard.jsx';
import AccountManagement from './components/AccountManagement.jsx';
import Groups from './components/Groups.jsx';
import TodoLists from './components/ToDoLists.jsx';
import './components/signup.css'; // Import the SignUp styles

const router = createBrowserRouter([
    {
        path: "/signup",
        element: <SignUp />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/",
        element:
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
    },
    {
        path: "/dashboard",
        element: (
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        )
    },
    {
        path: "/account",
        element: (
            <ProtectedRoute>
                <AccountManagement />
            </ProtectedRoute>
        )
    },
    {
        path: "/todos",
        element: (
            <ProtectedRoute>
                <TodoLists />
            </ProtectedRoute>
        )
    },
    {
        path: "/groups",
        element: (
            <ProtectedRoute>
                <Groups />
            </ProtectedRoute>
        )
    },
]);

const App = () => {
    return (
        <div className="global-container">
            <RouterProvider router={router} />
        </div>

    );
};

export default App;