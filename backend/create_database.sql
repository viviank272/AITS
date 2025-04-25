-- Create database
CREATE DATABASE IF NOT EXISTS muk_support_portal;
USE muk_support_portal;

-- Create Roles table
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Colleges table
CREATE TABLE IF NOT EXISTS colleges (
    college_id INT AUTO_INCREMENT PRIMARY KEY,
    college_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    dean_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    campus_location VARCHAR(100)
);

-- Create Departments table
CREATE TABLE IF NOT EXISTS departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    head_user_id INT,
    college_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE CASCADE
);

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id INT,
    department_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,
    user_type ENUM('lecturer', 'student', 'registrar', 'admin') NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

-- Add foreign keys for dean_user_id and head_user_id
ALTER TABLE colleges
ADD CONSTRAINT fk_college_dean
FOREIGN KEY (dean_user_id) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE departments
ADD CONSTRAINT fk_department_head
FOREIGN KEY (head_user_id) REFERENCES users(user_id) ON DELETE SET NULL;

-- Create Programs table
CREATE TABLE IF NOT EXISTS programs (
    program_id INT AUTO_INCREMENT PRIMARY KEY,
    program_name VARCHAR(100) NOT NULL,
    degree_level ENUM('certificate', 'diploma', 'bachelors', 'masters', 'phd') NOT NULL,
    college_id INT,
    department_id INT,
    program_head_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    FOREIGN KEY (program_head_id) REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE KEY (program_name, degree_level, department_id)
);

-- Create Students table
CREATE TABLE IF NOT EXISTS students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    student_number VARCHAR(20) UNIQUE NOT NULL,
    college_id INT,
    program_id INT,
    year_level INT NOT NULL,
    enrollment_status ENUM('enrolled', 'on_leave', 'graduated', 'suspended', 'withdrawn') NOT NULL,
    admission_date DATE NOT NULL,
    expected_graduation DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE CASCADE
);

-- Create Categories table
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    college_id INT,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE CASCADE
);

-- Create Priorities table
CREATE TABLE IF NOT EXISTS priorities (
    priority_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    level INT NOT NULL,
    sla_hours INT NOT NULL
);

-- Create Status table
CREATE TABLE IF NOT EXISTS statuses (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_terminal BOOLEAN DEFAULT FALSE
);

-- Create Issues table
CREATE TABLE IF NOT EXISTS issues (
    issue_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reporter_id INT NOT NULL,
    assignee_id INT,
    category_id INT,
    priority_id INT,
    status_id INT,
    college_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    due_date TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    is_student_issue BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (priority_id) REFERENCES priorities(priority_id) ON DELETE SET NULL,
    FOREIGN KEY (status_id) REFERENCES statuses(status_id) ON DELETE SET NULL,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL
);

-- Create Comments table
CREATE TABLE IF NOT EXISTS comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    issue_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_internal BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (issue_id) REFERENCES issues(issue_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Attachments table
CREATE TABLE IF NOT EXISTS attachments (
    attachment_id INT AUTO_INCREMENT PRIMARY KEY,
    issue_id INT NOT NULL,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues(issue_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create IssueHistory table
CREATE TABLE IF NOT EXISTS issue_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    issue_id INT NOT NULL,
    user_id INT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues(issue_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    issue_id INT NOT NULL,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues(issue_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Insert initial roles
INSERT INTO roles (role_name, description, permissions) VALUES
('admin', 'Administrator with full system access', '{"all": true}'),
('staff', 'Academic staff member', '{"issues": {"create": true, "read": true, "update": true, "delete": false}}'),
('student', 'Student user', '{"issues": {"create": true, "read": true, "update": false, "delete": false}}'),
('registrar', 'Registrar staff', '{"issues": {"create": true, "read": true, "update": true, "delete": false}}');

-- Insert initial priorities
INSERT INTO priorities (name, level, sla_hours) VALUES
('Low', 1, 72),
('Medium', 2, 48),
('High', 3, 24),
('Critical', 4, 8);

-- Insert initial statuses
INSERT INTO statuses (name, description, is_terminal) VALUES
('New', 'Issue has been created but not yet addressed', FALSE),
('In Progress', 'Issue is currently being worked on', FALSE),
('On Hold', 'Issue is temporarily paused', FALSE),
('Resolved', 'Issue has been resolved', TRUE),
('Closed', 'Issue has been closed', TRUE),
('Cancelled', 'Issue has been cancelled', TRUE); 