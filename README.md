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
