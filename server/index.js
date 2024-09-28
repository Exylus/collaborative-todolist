const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require("express");
const db = require('./db')
require('dotenv').config();

const app = express();
const port = process.env.SERVERPORT;

app.listen(port, () => {
    console.log("Running server on port: " + port.toString());
});


//////////////////////////////////////////////////
//////////////////  USERS   //////////////////////
//////////////////////////////////////////////////

// Sign-Up User
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)';
        db.query(sql, [name, email, hashedPassword], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'User created successfully', userId: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login User
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM Users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(400).json({ error: 'User not found' });

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
});

// Update User Profile
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    const sql = 'UPDATE Users SET name = ?, email = ? WHERE user_id = ?';
    db.query(sql, [name, email, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'User profile updated successfully' });
    });
});

// Change User Password
app.put('/users/:id/password', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'UPDATE Users SET password = ? WHERE user_id = ?';
        db.query(sql, [hashedPassword, id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Password updated successfully' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete User
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Users WHERE user_id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'User deleted successfully' });
    });
});

//////////////////////////////////////////////////
//////////////////  TASKS   //////////////////////
//////////////////////////////////////////////////

// Create Task
app.post('/tasks', (req, res) => {
    const { userId, title, description, status, priority, dueDate } = req.body;
    const sql = 'INSERT INTO Tasks (user_id, title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [userId, title, description, status, priority, dueDate], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Task created successfully', taskId: result.insertId });
    });
});

// Read Tasks
app.get('/tasks', (req, res) => {
    const { userId } = req.query;
    const sql = 'SELECT * FROM Tasks WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// Update Task
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, status, priority, dueDate } = req.body;
    const sql = 'UPDATE Tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE task_id = ?';
    db.query(sql, [title, description, status, priority, dueDate, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Task updated successfully' });
    });
});

// Delete Task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Tasks WHERE task_id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Task deleted successfully' });
    });
});

//////////////////////////////////////////////////
///////////////  GROUP_LIST   ////////////////////
//////////////////////////////////////////////////

// Create Group
app.post('/groups', (req, res) => {
    const { groupName, description } = req.body;
    const sql = 'INSERT INTO Group_List (group_name, description) VALUES (?, ?)';
    db.query(sql, [groupName, description], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Group created successfully', groupId: result.insertId });
    });
});

// Read Groups for a User
app.get('/groups', (req, res) => {
    const { userId } = req.query;
    const sql = `
        SELECT g.group_id, g.group_name, g.description 
        FROM Group_List g
        JOIN User_Groups ug ON g.group_id = ug.group_id
        WHERE ug.user_id = ?`;
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

//////////////////////////////////////////////////
///////////////  USER_GROUP   ////////////////////
//////////////////////////////////////////////////

// Join Group
app.post('/groups/join', (req, res) => {
    const { userId, groupId, role } = req.body;
    const sql = 'INSERT INTO User_Groups (user_id, group_id, role) VALUES (?, ?, ?)';
    db.query(sql, [userId, groupId, role], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'User joined the group successfully' });
    });
});

// Leave Group
app.delete('/groups/leave', (req, res) => {
    const { userId, groupId } = req.body;
    const sql = 'DELETE FROM User_Groups WHERE user_id = ? AND group_id = ?';
    db.query(sql, [userId, groupId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'User left the group successfully' });
    });
});

///////////////////////////////////////////////////
/////////////////  GROUP_TASKS   //////////////////
///////////////////////////////////////////////////

// Create Group Task
app.post('/groups/:groupId/tasks', (req, res) => {
    const { groupId } = req.params;
    const { title, description, status, dueDate } = req.body;
    const sql = 'INSERT INTO Group_Tasks (group_id, title, description, status, due_date) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [groupId, title, description, status, dueDate], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Group task created successfully', groupTaskId: result.insertId });
    });
});

// Read Group Tasks
app.get('/groups/:groupId/tasks', (req, res) => {
    const { groupId } = req.params;
    const sql = 'SELECT * FROM Group_Tasks WHERE group_id = ?';
    db.query(sql, [groupId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// Update Group Task
app.put('/groups/:groupId/tasks/:taskId', (req, res) => {
    const { groupId, taskId } = req.params;
    const { title, description, status, dueDate } = req.body;
    const sql = 'UPDATE Group_Tasks SET title = ?, description = ?, status = ?, due_date = ? WHERE group_task_id = ? AND group_id = ?';
    db.query(sql, [title, description, status, dueDate, taskId, groupId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Group task updated successfully' });
    });
});

// Delete Group Task
app.delete('/groups/:groupId/tasks/:taskId', (req, res) => {
    const { groupId, taskId } = req.params;
    const sql = 'DELETE FROM Group_Tasks WHERE group_task_id = ? AND group_id = ?';
    db.query(sql, [taskId, groupId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Group task deleted successfully' });
    });
});