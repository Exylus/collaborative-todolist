# Collaborative To-Do List Application

## Project Description

This is a full-stack to-do list application built using **React** for the front-end and **Node.js** with **MySQL** for the back-end. It allows users to manage personal to-do lists, collaborate on group tasks, and manage their account. The app includes user authentication, individual and group-based task management, and a central dashboard to navigate between functionalities.

## Main Features

1. **Main Menu (Dashboard)**:
   - A central hub with three main sections: 
     - **Account Management**: Where users can update their profile, change passwords, and manage their account.
     - **My To-Do Lists**: Users can create, edit, and manage their personal to-do lists.
     - **Groups**: Users can create or join groups and manage shared group to-do lists.
   - Clean, centered interface to allow easy navigation to all main features.

2. **User Authentication (Sign-Up, Login, JWT Authentication)**:
   - **Sign-Up**: New users can register by providing their email and password.
   - **Login**: Existing users can log in to access their to-do lists and group tasks.
   - **JWT (JSON Web Tokens)**: Used for securing the authentication process, ensuring that only logged-in users can access protected routes.
   - **Password Recovery (Optional)**: Users can reset their password via email.

3. **Personal To-Do Lists**:
   - Users can manage their individual tasks with full CRUD functionality:
     - **Create, Read, Update, Delete (CRUD)**: Add new tasks, edit existing tasks, and remove completed tasks.
     - **Task Filtering**: Filter tasks by their status (completed, pending).
     - **Task Priority** (Optional): Add priorities to tasks (high, medium, low).
     - Responsive and easy-to-use interface for managing personal tasks.

4. **Group Functionality**:
   - **Create/Join Groups**: Users can create new groups or join existing ones.
   - **Group To-Do Lists**: Members of a group can collaborate on shared to-do lists.
   - **Task Collaboration**: Multiple users can add, edit, and delete tasks within a group.
   - **Group Roles (Optional)**: Assign different permissions (e.g., admin, member).

5. **Account Management**:
   - **Profile Management**: Users can update their account details such as name and email.
   - **Change Password**: Users can change their password from their account settings page.
   - **Delete Account**: Option to permanently delete the user account (optional feature).

---

## Technologies Used

### Front-End (React):
- **React**: Core library for building the user interface and managing component states.
- **React Router**: For navigating between pages (login, sign-up, to-do lists, groups).
- **Axios**: For making HTTP requests to the backend APIs (login, sign-up, tasks, group management).
- **CSS/Styled Components**: For a clean, responsive design.
- **Context API or Redux (Optional)**: To manage global application state, such as user authentication and task data.

### Back-End (Node.js & Express):
- **Node.js**: JavaScript runtime used to build the server-side of the app.
- **Express.js**: Web framework for setting up RESTful APIs to handle user authentication, tasks, and group-related functionality.
- **JWT (JSON Web Tokens)**: For user authentication, ensuring secure access to protected routes.
- **bcrypt**: For hashing and securing user passwords.
- **MySQL**: Relational database to store users, tasks, and group-related data.
- **Sequelize or Knex.js (Optional)**: ORM for easier interaction with the MySQL database.

---

## Project Breakdown

### 1. Main Menu (Dashboard)
- **Purpose**: This serves as the home page after login, where users can choose between managing their account, personal tasks, or group collaborations.
- **Design**: Centered layout with three large clickable cards or buttons (Account Management, My To-Do Lists, Groups). Responsive design so it looks good on both desktop and mobile devices.
- **Navigation**: Each button routes to the respective section using **React Router**.

### 2. User Authentication
- **Sign-Up**: A simple registration form where users input their email and password. Passwords are hashed using **bcrypt**.
- **Login**: A login form where users enter their credentials. On successful login, the backend returns a **JWT**, which is stored in **localStorage** or **Context API** for future requests.
- **API Endpoints**:
  - `POST /api/signup`: Handles user registration.
  - `POST /api/login`: Authenticates the user and returns a JWT token.

### 3. My To-Do Lists (Personal Tasks)
- **Features**: Users can create, update, and delete tasks in their personal list. Tasks can be filtered by status and optionally by priority. Tasks are stored in the database and retrieved using the authenticated user's ID.
- **API Endpoints**:
  - `GET /api/tasks`: Fetch all tasks for the logged-in user.
  - `POST /api/tasks`: Create a new task.
  - `PUT /api/tasks/:id`: Update an existing task.
  - `DELETE /api/tasks/:id`: Delete a task.

### 4. Group Functionality
- **Features**: Users can create new groups or search and join existing groups. Each group has its own shared to-do list, which all group members can manage. Group roles (admin, member) can be assigned to control task permissions (optional).
- **API Endpoints**:
  - `POST /api/groups`: Create a new group.
  - `POST /api/groups/join`: Join an existing group.
  - `GET /api/groups/:id/tasks`: Get tasks for a specific group.
  - `POST /api/groups/:id/tasks`: Create a new group task.
  - `PUT /api/groups/:id/tasks/:taskId`: Update a group task.
  - `DELETE /api/groups/:id/tasks/:taskId`: Delete a group task.

### 5. Account Management
- **Features**: Users can update their personal details like name and email. They can also change their password securely using bcrypt.
- **API Endpoints**:
  - `PUT /api/account/update`: Update user account details.
  - `PUT /api/account/password`: Update user password.

---

## Milestones

1. **Main Menu**: Create the central dashboard with navigation to account management, to-do lists, and group functionalities.
2. **User Authentication**: Set up the user registration and login system using JWT for secure authentication.
3. **Personal To-Do List**: Build the core to-do list functionality with CRUD operations for individual tasks.
4. **Group Functionality**: Implement group management and collaboration on group to-do lists.
5. **Account Management**: Allow users to update their profile and change their password.
6. **UI/UX Enhancements**: Ensure the application is responsive, clean, and user-friendly across devices.

---

## Bonus Features (Optional)
- **Real-Time Collaboration**: Use WebSockets to enable real-time task updates in group collaborations.
- **Notifications**: Add task reminders or group notifications for approaching deadlines or task updates.
- **Dark Mode**: Implement a light/dark mode toggle for user interface preferences.
