const mysql = require('mysql2');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
dotenv.config();

const app = express();
const port = 3113;

const db = mysql.createConnection({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to the database.');
});

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
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
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM Users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(400).json({ error: 'User not found' });
        }
        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
});

app.post('/tasks', (req, res) => {
    const { userId, title, description, dueDate } = req.body;
    const sql = 'INSERT INTO Tasks (user_id, title, description, due_date) VALUES (?, ?, ?, ?)';
    db.query(sql, [userId, title, description, dueDate], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Task created successfully', taskId: result.insertId });
    });
});

app.get('/tasks', (req, res) => {
    const { userId } = req.query;  // Assuming user ID is passed in the query
    const sql = 'SELECT * FROM Tasks WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
});

app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, status, dueDate } = req.body;
    const sql = 'UPDATE Tasks SET title = ?, description = ?, status = ?, due_date = ? WHERE task_id = ?';
    db.query(sql, [title, description, status, dueDate, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Task updated successfully' });
    });
});

app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Tasks WHERE task_id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    });
});

app.post('/groups', (req, res) => {
    const { groupName, description } = req.body;
    const sql = 'INSERT INTO Groups (group_name, description) VALUES (?, ?)';
    db.query(sql, [groupName, description], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Group created successfully', groupId: result.insertId });
    });
});

app.post('/groups/join', (req, res) => {
    const { userId, groupId } = req.body;
    const sql = 'INSERT INTO User_Groups (user_id, group_id) VALUES (?, ?)';
    db.query(sql, [userId, groupId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'User joined the group successfully' });
    });
});

app.post('/groups/:groupId/tasks', (req, res) => {
    const { groupId } = req.params;
    const { title, description, dueDate } = req.body;
    const sql = 'INSERT INTO Group_Tasks (group_id, title, description, due_date) VALUES (?, ?, ?, ?)';
    db.query(sql, [groupId, title, description, dueDate], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Group task created successfully', groupTaskId: result.insertId });
    });
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};


app.listen(port, () => {
    console.log("Running server on port: " + port.toString());
});