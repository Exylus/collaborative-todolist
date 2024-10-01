const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require("express");
const db = require('./db')
const cors = require('cors')
const crypto = require('crypto')
require('dotenv').config();
const app = express();

const port = process.env.SERVERPORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const generateInviteCode = () => {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
};

app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.listen(port, () => {
    console.log("Running server on port: " + port.toString());
});


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ error: 'Token expired' });
            }
            return res.status(403).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    });
};


//////////////////////////////////////////////////
//////////////////  USERS   //////////////////////
//////////////////////////////////////////////////

// Sign-Up User
app.post('/signup', async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

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
        res.status(200).json({ token });
    });
});

// Update user infos
app.put('/account/update', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { name, email } = req.body;
    const sql = 'UPDATE Users SET name = ?, email = ? WHERE user_id = ?';

    db.query(sql, [name, email, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'User information updated successfully' });
    });
});


// Change User Password
app.put('/account/password', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    // Get current hashed password
    const sql = 'SELECT password FROM Users WHERE user_id = ?';
    db.query(sql, [userId], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });

        const currentHashedPassword = results[0].password;
        const isMatch = await bcrypt.compare(oldPassword, currentHashedPassword);

        if (!isMatch) {
            return res.status(400).json({ error: 'Old password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const updateSql = 'UPDATE Users SET password = ? WHERE user_id = ?';

        db.query(updateSql, [hashedNewPassword, userId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Password updated successfully' });
        });
    });
});

// Delete User
app.delete('/account/delete', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    // Delete user from the database
    const sql = 'DELETE FROM Users WHERE user_id = ?';

    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // Optionally, you can also handle other related data like deleting tasks, memberships, etc.
        res.status(200).json({ message: 'Account deleted successfully' });
    });
});

// Get username and email
app.get('/account', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const sql = 'SELECT name, email FROM Users WHERE user_id = ?';

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });

        res.status(200).json(results[0]);
    });
});


//////////////////////////////////////////////////
//////////////////  TASKS   //////////////////////
//////////////////////////////////////////////////

// Create Task
app.post('/tasks/create', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { groupId, title, description, dueDate } = req.body;

    const createTaskSql = `INSERT INTO Tasks (user_id, group_id, title, description, due_date) VALUES (?, ?, ?, ?, ?)`;

    db.query(createTaskSql, [userId, groupId || null, title, description, dueDate], (err, result) => {
        if (err) {
            console.error('Error creating task:', err);
            return res.status(500).json({ error: 'Failed to create task. Please try again.' });
        }
        res.status(201).json({ message: 'Task created successfully!' });
    });
});

// Read Tasks
app.get('/tasks', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    const getTasksSql = `
        SELECT t.task_id, t.title, t.description, t.due_date, t.is_completed, t.group_id, g.group_name, t.user_id, g.admin_id
        FROM Tasks t
        LEFT JOIN Group_List g ON t.group_id = g.group_id
        WHERE (t.user_id = ? OR t.group_id IN 
            (SELECT group_id FROM User_Groups WHERE user_id = ?)) 
            AND t.is_archived = FALSE`;

    db.query(getTasksSql, [userId, userId], (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).json({ error: 'Failed to fetch tasks.' });
        }
        res.status(200).json(results);
    });
});

// Update Task
app.put('/tasks/:taskId', authenticateToken, (req, res) => {
    const { taskId } = req.params;
    const { title, description, dueDate, isCompleted } = req.body;

    const updateTaskSql = `UPDATE Tasks SET title = ?, description = ?, due_date = ?, is_completed = ? WHERE task_id = ?`;

    db.query(updateTaskSql, [title, description, dueDate, isCompleted, taskId], (err, result) => {
        if (err) {
            console.error('Error updating task:', err);
            return res.status(500).json({ error: 'Failed to update task.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        res.status(200).json({ message: 'Task updated successfully!' });
    });
});

// Delete Task
app.delete('/tasks/:taskId', authenticateToken, (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.userId;

    const verifyUserSql = `
        SELECT t.task_id, t.user_id, g.admin_id 
        FROM Tasks t
        LEFT JOIN Group_List g ON t.group_id = g.group_id
        WHERE t.task_id = ?`;

    db.query(verifyUserSql, [taskId], (err, result) => {
        if (err) {
            console.error('Error verifying task:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const task = result[0];

        // Check if the user is either the creator or the group admin
        if (task.user_id !== userId && task.admin_id !== userId) {
            return res.status(403).json({ error: 'You are not authorized to delete this task' });
        }

        // Proceed to delete the task
        const deleteTaskSql = `DELETE FROM Tasks WHERE task_id = ?`;

        db.query(deleteTaskSql, [taskId], (err) => {
            if (err) {
                console.error('Error deleting task:', err);
                return res.status(500).json({ error: 'Failed to delete task.' });
            }

            res.status(200).json({ message: 'Task deleted successfully!' });
        });
    });
});

// Mark Task As Completed
app.put('/tasks/:taskId/toggle-complete', authenticateToken, (req, res) => {
    const { taskId } = req.params;
    const { isCompleted } = req.body; // Boolean to indicate if marking as completed or not

    const updateTaskSql = `UPDATE Tasks SET is_completed = ? WHERE task_id = ?`;

    db.query(updateTaskSql, [isCompleted, taskId], (err, result) => {
        if (err) {
            console.error('Error updating task status:', err);
            return res.status(500).json({ error: 'Failed to update task status.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        res.status(200).json({ message: `Task marked as ${isCompleted ? 'complete' : 'unfinished'} successfully!` });
    });
});

// Archive Task
app.put('/tasks/:taskId/archive', authenticateToken, (req, res) => {
    const { taskId } = req.params;

    const archiveTaskSql = `UPDATE Tasks SET is_archived = TRUE WHERE task_id = ?`;

    db.query(archiveTaskSql, [taskId], (err, result) => {
        if (err) {
            console.error('Error archiving task:', err);
            return res.status(500).json({ error: 'Failed to archive task.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        res.status(200).json({ message: 'Task archived successfully!' });
    });
});

//////////////////////////////////////////////////
///////////////  GROUP_LIST   ////////////////////
//////////////////////////////////////////////////

// Create Group
app.post('/groups/create', authenticateToken, (req, res) => {
    const { groupName, description } = req.body;
    const adminId = req.user.userId;
    const inviteCode = generateInviteCode(); // Generate the invite code

    const createGroupSql = 'INSERT INTO Group_List (group_name, description, admin_id, invite_code) VALUES (?, ?, ?, ?)';

    db.query(createGroupSql, [groupName, description, adminId, inviteCode], (err, result) => {
        if (err) {
            console.error('Error creating group:', err);
            return res.status(500).json({ error: 'Failed to create group. Please try again.' });
        }

        const groupId = result.insertId;

        // Insert the user into User_Groups table as an admin
        const addUserToGroupSql = 'INSERT INTO User_Groups (user_id, group_id, role) VALUES (?, ?, "admin")';

        db.query(addUserToGroupSql, [adminId, groupId], (err) => {
            if (err) {
                console.error('Error adding user to group:', err);
                return res.status(500).json({ error: 'Failed to add user to group after creation.' });
            }

            res.status(201).json({ message: 'Group created successfully!', inviteCode });
        });
    });
});

// Read Groups for a User
app.get('/groups', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    const sql = `
        SELECT g.group_id, g.group_name, g.description, g.invite_code, 
               CASE WHEN g.admin_id = ? THEN true ELSE false END AS is_admin
        FROM Group_List g
        INNER JOIN User_Groups ug ON g.group_id = ug.group_id
        WHERE ug.user_id = ?`;

    db.query(sql, [userId, userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
});

app.post('/groups/join', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { inviteCode } = req.body;

    // Find the group by invite code
    const findGroupSql = 'SELECT group_id FROM Group_List WHERE invite_code = ?';

    db.query(findGroupSql, [inviteCode], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Invalid invite code. Group not found.' });
        }

        const groupId = results[0].group_id;

        // Insert user into User_Groups
        const addUserToGroupSql = 'INSERT INTO User_Groups (user_id, group_id, role) VALUES (?, ?, "member")';

        db.query(addUserToGroupSql, [userId, groupId], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'You are already a member of this group' });
                }
                return res.status(500).json({ error: 'Error adding user to group' });
            }

            res.status(200).json({ message: 'Successfully joined the group' });
        });
    });
});

// Delete Group
app.delete('/groups/:groupId', authenticateToken, (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.userId;

    // Verify if the user is the admin of the group before allowing deletion
    const verifyAdminSql = 'SELECT admin_id FROM Group_List WHERE group_id = ?';

    db.query(verifyAdminSql, [groupId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const group = results[0];
        if (group.admin_id !== userId) {
            return res.status(403).json({ error: 'You are not authorized to delete this group' });
        }

        // Delete the group
        const deleteGroupSql = 'DELETE FROM Group_List WHERE group_id = ?';
        db.query(deleteGroupSql, [groupId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Optionally, remove associated users from User_Groups table
            const deleteUserGroupsSql = 'DELETE FROM User_Groups WHERE group_id = ?';
            db.query(deleteUserGroupsSql, [groupId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error deleting associated group members' });
                }
                res.status(200).json({ message: 'Group deleted successfully' });
            });
        });
    });
});


//////////////////////////////////////////////////
///////////////  USER_GROUP   ////////////////////
//////////////////////////////////////////////////

// Join Group
app.post('/groups/join', authenticateToken, (req, res) => {
    const { userId, groupId, role } = req.body;
    const sql = 'INSERT INTO User_Groups (user_id, group_id, role) VALUES (?, ?, ?)';
    db.query(sql, [userId, groupId, role], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'User joined the group successfully' });
    });
});

// Leave Group
app.post('/groups/leave', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { groupId } = req.body;

    // Verify if the user is not an admin before allowing them to leave
    const verifyAdminSql = 'SELECT admin_id FROM Group_List WHERE group_id = ?';

    db.query(verifyAdminSql, [groupId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const group = results[0];
        if (group.admin_id === userId) {
            return res.status(403).json({ error: 'Group admins cannot leave the group. Please delete the group instead.' });
        }

        // Remove the user from User_Groups
        const leaveGroupSql = 'DELETE FROM User_Groups WHERE user_id = ? AND group_id = ?';

        db.query(leaveGroupSql, [userId, groupId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Internal server error while trying to leave the group.' });
            }

            res.status(200).json({ message: 'User left the group successfully.' });
        });
    });
});

///////////////////////////////////////////////////
/////////////////  GROUP_TASKS   //////////////////
///////////////////////////////////////////////////

// Create Group Task
app.post('/tasks/create', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { groupId, title, description, dueDate } = req.body;

    const createTaskSql = `INSERT INTO Tasks (user_id, group_id, title, description, due_date) VALUES (?, ?, ?, ?, ?)`;

    db.query(createTaskSql, [userId, groupId || null, title, description, dueDate], (err, result) => {
        if (err) {
            console.error('Error creating task:', err);
            return res.status(500).json({ error: 'Failed to create task. Please try again.' });
        }
        res.status(201).json({ message: 'Task created successfully!' });
    });
});
// Read Group Tasks
app.get('/groups/:groupId/tasks', authenticateToken, (req, res) => {
    const { groupId } = req.params;
    const sql = 'SELECT * FROM Group_Tasks WHERE group_id = ?';
    db.query(sql, [groupId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// Update Group Task
app.put('/groups/:groupId/tasks/:taskId', authenticateToken, (req, res) => {
    const { groupId, taskId } = req.params;
    const { title, description, status, dueDate } = req.body;
    const sql = 'UPDATE Group_Tasks SET title = ?, description = ?, status = ?, due_date = ? WHERE group_task_id = ? AND group_id = ?';
    db.query(sql, [title, description, status, dueDate, taskId, groupId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Group task updated successfully' });
    });
});

// Delete Group Task
app.delete('/groups/:groupId/tasks/:taskId', authenticateToken, (req, res) => {
    const { groupId, taskId } = req.params;
    const sql = 'DELETE FROM Group_Tasks WHERE group_task_id = ? AND group_id = ?';
    db.query(sql, [taskId, groupId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Group task deleted successfully' });
    });
});