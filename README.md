# 🎓 Student Management System

A web-based **Student Management System** designed to manage student academic information, attendance, marks, and college announcements through separate **Admin and Faculty roles**.

## 🚀 Features

### 👨‍💼 Admin

* View student records
* View attendance records
* View academic and marks records
* Add announcements
* Delete announcements
* Monitor academic information
* View-only access to students, attendance, and marks

### 👩‍🏫 Faculty

* Add student records
* Edit student records
* Delete student records
* Manage student attendance
* Add and manage academic records
* View college announcements
* Access profile

### 🔐 Role-Based Login

The system provides a single login page with separate access for:

* Admin
* Faculty

Each role receives only the permissions assigned to it.

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Python
* Flask
* Flask-CORS

### Database

* MySQL

### Other

* REST APIs
* Role-Based Access Control
* Git & GitHub

## 📂 Project Structure

```text
Student Management System/
│
├── backend/
│   ├── app.py
│   ├── db.py
│   ├── auth_routes.py
│   ├── announcement_routes.py
│   ├── faculty_routes.py
│   ├── requirements.txt
│   └── routes/
│       ├── auth_routes.py
│       ├── student_routes.py
│       ├── attendance_routes.py
│       ├── marks_routes.py
│       ├── announcement_routes.py
│       └── faculty_routes.py
│
└── frontend/
    ├── login.html
    ├── index.html
    ├── faculty-dashboard.html
    ├── my-students.html
    ├── attendance.html
    ├── marks.html
    ├── profile.html
    └── css/
        └── style.css
```

## ⚙️ How to Run

### 1. Clone the Repository

```bash
git clone https://github.com/Akhila187/Student-Management-System.git
```

### 2. Open the Backend Folder

```bash
cd "Student Management System/backend"
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure MySQL

Create a MySQL database named:

```text
student_management
```

Configure the database connection in:

```text
backend/db.py
```

### 5. Start the Flask Backend

```bash
python app.py
```

Backend URL:

```text
http://127.0.0.1:5000
```

### 6. Start the Frontend

Open a new terminal and go to the frontend folder:

```bash
cd "Student Management System/frontend"
```

Run:

```bash
python -m http.server 5501
```

Open the application:

```text
http://localhost:5501/login.html
```

## 🔄 Application Flow

```text
Login
  │
  ├── Admin
  │     ├── Dashboard
  │     ├── View Students
  │     ├── View Attendance
  │     ├── View Marks
  │     └── Manage Announcements
  │
  └── Faculty
        ├── Dashboard
        ├── Manage Students
        ├── Manage Attendance
        ├── Manage Marks
        ├── View Announcements
        └── Profile
```

## 🎯 Project Objective

The objective of this project is to provide a simple and organized platform for managing student academic information while implementing **role-based access** for administrators and faculty members.

## 🔒 Access Control

| Module        | Admin        | Faculty             |
| ------------- | ------------ | ------------------- |
| Students      | View         | Add / Edit / Delete |
| Attendance    | View         | Manage              |
| Marks         | View         | Manage              |
| Announcements | Add / Delete | View                |
| Profile       | Access       | Access              |

## 💡 Future Enhancements

* Student login and portal
* Attendance percentage calculation
* Advanced academic reports
* Search and filtering
* Dashboard analytics
* Export reports as PDF/Excel
* Improved authentication and security

## 👩‍💻 Developed By

**Akhila Kota**

B.Tech Computer Science Engineering
Geethanjali Institute of Science and Technology

## 🔗 GitHub

https://github.com/Akhila187
