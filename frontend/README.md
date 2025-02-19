Howard University Business Course Tracker
🚀 A modern, user-friendly web application for Howard University Business students to track their courses, manage enrollment, and ensure prerequisite compliance.

📌 Overview
The Howard University Business Course Tracker is a full-stack web application designed to help students manage their academic journey effectively. This project demonstrates modern web development principles, integrating React.js, Tailwind CSS, Supabase, and more to deliver a seamless user experience.

🔹 Key Features
✅ Secure Authentication (Sign Up, Login, Logout)
✅ Admin Panel (Manage Courses, Add/Edit/Delete Courses)
✅ Course Enrollment (Students can enroll/drop courses)
✅ Prerequisite Validation (Ensures students meet prerequisites before enrolling)
✅ Responsive Design (Fully optimized for mobile, tablet, and desktop)
✅ Real-time Database (Using Supabase for backend storage & authentication)
✅ User Roles & Authorization (Students vs. Admins)
✅ Interactive UI/UX (Using React, Tailwind CSS, and React Router)

🛠️ Tech Stack
Frontend
React.js – Component-based UI development
React Router – Navigation and routing
Tailwind CSS – Responsive and modern styling
React Icons – Iconography for UI enhancements
Backend
Supabase – Authentication, database, and backend services
PostgreSQL – Cloud-hosted database for course management
RESTful API – CRUD operations for courses, students, and enrollments
Project Management
Git & GitHub – Version control and collaboration
VS Code – IDE for development
🚀 Getting Started
🔹 Prerequisites
Ensure you have the following installed:

Node.js (v16+ recommended)
npm or yarn
Supabase Account (for authentication & database setup)
🔹 Installation Steps
1️⃣ Clone the repository

sh
Copy
Edit
git clone https://github.com/yourusername/hu-course-tracker.git
cd hu-course-tracker
2️⃣ Install dependencies

sh
Copy
Edit
npm install
3️⃣ Set up Supabase

Create a Supabase project and get your API keys
Create tables: students, courses, semesters, student_course
Add a column is_admin to students (boolean) for role-based access
4️⃣ Set environment variables
Create a .env file in the root directory and add:

env
Copy
Edit
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
5️⃣ Run the project

sh
Copy
Edit
npm start
✅ Your project should now be running at http://localhost:3000


📸 Screenshots
🔹 Dashboard
<img src="screenshots/dashboard.png" width="700">
🔹 Admin Panel
<img src="screenshots/admin.png" width="700">


📂 Folder Structure
bash
Copy
Edit
/frontend
│── /public
│── /src
│   ├── /components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   ├── /context
│   │   ├── userContext.jsx
│   ├── /pages
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Admin.jsx
│   ├── api.js
│   ├── App.js
│   ├── index.js
│── package.json
│── README.md


🔹 Features Implemented
Feature	Description
User Authentication	Secure login, signup, and logout using Supabase Auth
Course Management	Admins can add, update, or delete courses
Student Enrollment	Students can enroll in and drop courses
Prerequisite Validation	Prevents students from enrolling if prerequisites are missing
Admin Role Handling	Only admins see the Admin Panel
Responsive Design	Works seamlessly across mobile, tablet, and desktop


🌟 Future Enhancements
📅 Student Course Schedule: Allow students to visualize their course load per semester
📊 Progress Tracking: Show completed vs. remaining courses dynamically
🔔 Notifications: Alert students about prerequisite issues or new course offerings
📧 Email Reminders: Notify students about upcoming enrollments


📞 Contact
💼 Matthew Tran
📧 tran.h.matt@gmail.com
🌐 linkedin.com/in/matthew-d-tran/

🚀 This project showcases my skills in full-stack development, modern UI/UX, and Supabase! Looking for a Software Engineering role where I can apply my expertise in frontend and backend technologies.