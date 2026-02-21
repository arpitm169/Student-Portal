
-- ===============================================
-- DATABASE SCHEMA FOR STUDENT PORTAL
-- ===============================================

-- =====================
-- USERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    is_active BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    department VARCHAR(100),
    year VARCHAR(10),
    cgpa DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- FINANCE TABLE
-- =====================
CREATE TABLE IF NOT EXISTS finance (
    finance_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    paid_amount DECIMAL(10, 2) DEFAULT 0.00,
    overdue_amount DECIMAL(10, 2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- COURSES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS courses (
    course_id SERIAL PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    instructor_name VARCHAR(255),
    instructor_avatar VARCHAR(10),
    course_icon VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- ENROLLMENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(course_id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    UNIQUE (user_id, course_id)
);

-- =====================
-- INSTRUCTORS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS instructors (
    instructor_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    avatar_color VARCHAR(20),
    initials VARCHAR(5),
    specialization VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- NOTICES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS notices (
    notice_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    posted_by VARCHAR(255),
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- ===============================================
-- SAMPLE DATA INSERTION
-- ===============================================

-- Courses
INSERT INTO courses (course_name, course_code, description, instructor_name, instructor_avatar, course_icon)
VALUES
('Object Oriented Programming', 'CS201', 'Learn OOP concepts with Java and Python', 'Dr. John Smith', 'JS', '💻'),
('Fundamentals of Database Systems', 'CS301', 'Database design, SQL, and management', 'Prof. Mary Johnson', 'MJ', '🗄️'),
('Data Structures and Algorithms', 'CS202', 'Learn essential data structures', 'Dr. Robert Brown', 'RB', '📊'),
('Web Development', 'CS401', 'Full-stack web development course', 'Dr. Sarah Wilson', 'SW', '🌐')
ON CONFLICT (course_code) DO NOTHING;

-- Instructors
INSERT INTO instructors (name, email, avatar_color, initials, specialization)
VALUES
('Daily Notice', 'notice@university.edu', 'red', 'DN', 'Announcements'),
('Dr. John Smith', 'john.smith@university.edu', 'blue', 'JS', 'Computer Science'),
('Prof. Mary Johnson', 'mary.johnson@university.edu', 'dark', 'MJ', 'Database Systems'),
('Dr. Robert Brown', 'robert.brown@university.edu', 'green', 'RB', 'Algorithms'),
('Dr. Sarah Wilson', 'sarah.wilson@university.edu', 'purple', 'SW', 'Web Technologies')
ON CONFLICT (email) DO NOTHING;

-- ===============================================
-- TRIGGER FUNCTION FOR FINANCE
-- ===============================================

CREATE OR REPLACE FUNCTION create_finance_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO finance (user_id, total_amount, paid_amount, overdue_amount)
    VALUES (NEW.user_id, 10000.00, 0.00, 0.00);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_finance ON users;

CREATE TRIGGER trigger_create_finance
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_finance_for_user();

-- ===============================================
-- HELPER / TEST QUERIES
-- ===============================================

-- View users
SELECT name, email FROM users;

-- View constraints on users table
SELECT column_name, constraint_name
FROM information_schema.key_column_usage
WHERE table_name = 'users';

-- View columns and data types
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users';

-- View students with finance info
-- SELECT u.user_id, u.name, u.email, f.total_amount, f.paid_amount, f.overdue_amount
-- FROM users u
-- LEFT JOIN finance f ON u.user_id = f.user_id;

-- View enrollments
-- SELECT u.name, c.course_name, e.enrollment_date
-- FROM enrollments e
-- JOIN users u ON e.user_id = u.user_id
-- JOIN courses c ON e.course_id = c.course_id;
Select * FROM finance
INSERT INTO finance (user_id, total_amount, paid_amount, overdue_amount)
SELECT user_id, 10000, 0, 0
FROM users
WHERE user_id NOT IN (SELECT user_id FROM finance);

CREATE OR REPLACE FUNCTION create_finance_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO finance (user_id, total_amount, paid_amount, overdue_amount)
    VALUES (NEW.user_id, 300000.00, 0.00, 300000.00);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

UPDATE finance
SET total_amount = 300000,
    overdue_amount = total_amount - paid_amount;

	UPDATE finance
SET total_amount = 300000,
    overdue_amount = total_amount - paid_amount;

	SELECT user_id, total_amount, paid_amount, overdue_amount
FROM finance;
UPDATE finance
SET overdue_amount = total_amount - paid_amount;


SELECT user_id, total_amount, paid_amount, overdue_amount
FROM finance
ORDER BY user_id;

UPDATE finance
SET total_amount = 300000,
    overdue_amount = total_amount - paid_amount;

SELECT user_id, total_amount, paid_amount, overdue_amount
FROM finance
WHERE user_id = 2;

UPDATE finance
SET paid_amount = 0,
    overdue_amount = total_amount;

SELECT * FROM USERS


CREATE TABLE student_profiles (
    user_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    registration_no VARCHAR(50),
    phone VARCHAR(20),
    department VARCHAR(100),
    year VARCHAR(10),
    cgpa DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS student_profiles (
    user_id INTEGER PRIMARY KEY,
    registration_no VARCHAR(50),
    phone VARCHAR(15),
    department VARCHAR(100),
    year VARCHAR(10),
    cgpa NUMERIC(3,2),

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

ALTER TABLE users
ADD CONSTRAINT unique_email UNIQUE (email);

ALTER TABLE courses ADD COLUMN credits INT DEFAULT 4;

INSERT INTO courses
(course_name, course_code, description, instructor_name, instructor_avatar, course_icon)
VALUES
-- CORE CS COURSES
('Data Structures and Algorithms', 'CS202',
 'Study of arrays, linked lists, stacks, queues, trees, graphs, and algorithm design techniques',
 'Dr. Robert Brown', 'RB', '📊'),

('Compiler Design', 'CS303',
 'Lexical analysis, parsing, syntax-directed translation, code generation, and optimization',
 'Dr. Alan Turing', 'AT', '🧠'),

('Software Engineering & Project Management', 'CS401',
 'Software development life cycle, Agile, Scrum, project planning, and risk management',
 'Prof. Linda Green', 'LG', '🛠️'),

-- DATA & AI COURSES
('Data Science', 'CS451',
 'Data analysis, visualization, machine learning basics, and Python tools',
 'Dr. Emily Watson', 'EW', '📈'),

('Data Mining', 'CS452',
 'Association rules, classification, clustering, and data mining techniques',
 'Dr. Michael Chen', 'MC', '⛏️'),

('Machine Learning', 'CS453',
 'Supervised and unsupervised learning, regression, classification, and neural networks',
 'Dr. Andrew Ng', 'AN', '🤖'),

-- SYSTEM & WEB COURSES
('Operating Systems', 'CS301',
 'Processes, threads, scheduling, memory management, and file systems',
 'Dr. James Miller', 'JM', '💻'),

('Computer Networks', 'CS302',
 'Network models, TCP/IP, routing, switching, and network security basics',
 'Prof. Nancy Drew', 'ND', '🌐'),

('Advanced Web Technologies', 'CS402',
 'REST APIs, security, performance optimization, and modern web frameworks',
 'Dr. Sarah Wilson', 'SW', '🚀'),

-- ELECTIVES
('Cloud Computing', 'CS460',
 'Virtualization, cloud services, deployment models, and DevOps basics',
 'Dr. Raj Patel', 'RP', '☁️'),

('Cyber Security Fundamentals', 'CS461',
 'Cryptography, network security, ethical hacking, and secure systems',
 'Dr. Kevin Mitnick', 'KM', '🔐')
ON CONFLICT (course_code) DO NOTHING;


SELECT course_code, course_name
FROM courses
ORDER BY course_code;

INSERT INTO courses
(course_name, course_code, description, instructor_name, instructor_avatar, course_icon)
VALUES
-- CORE CS
('Compiler Design', 'CS303',
 'Lexical analysis, parsing, syntax-directed translation, code generation, and optimization',
 'Dr. Alan Turing', 'AT', '🧠'),

('Operating Systems', 'CS304',
 'Processes, threads, CPU scheduling, memory management, and file systems',
 'Dr. James Miller', 'JM', '💻'),

('Computer Networks', 'CS305',
 'OSI & TCP/IP models, routing, switching, and network protocols',
 'Prof. Nancy Drew', 'ND', '🌐'),

-- SOFTWARE & MANAGEMENT
('Software Engineering & Project Management', 'CS402',
 'SDLC, Agile, Scrum, project planning, and risk management',
 'Prof. Linda Green', 'LG', '🛠️'),

-- DATA & AI
('Data Science', 'CS451',
 'Data analysis, visualization, and machine learning fundamentals',
 'Dr. Emily Watson', 'EW', '📈'),

('Data Mining', 'CS452',
 'Association rules, classification, clustering, and pattern discovery',
 'Dr. Michael Chen', 'MC', '⛏️'),

('Machine Learning', 'CS453',
 'Supervised and unsupervised learning algorithms',
 'Dr. Andrew Ng', 'AN', '🤖'),

-- EMERGING TECH
('Cloud Computing', 'CS460',
 'Cloud architecture, virtualization, and DevOps basics',
 'Dr. Raj Patel', 'RP', '☁️'),

('Cyber Security Fundamentals', 'CS461',
 'Cryptography, network security, and ethical hacking',
 'Dr. Kevin Mitnick', 'KM', '🔐')
ON CONFLICT (course_code) DO NOTHING;

SELECT course_code, course_name
FROM courses
ORDER BY course_code;


CREATE TABLE IF NOT EXISTS attendance (
    attendance_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(course_id) ON DELETE CASCADE,
    total_classes INT DEFAULT 0,
    attended_classes INT DEFAULT 0,
    attendance_percentage DECIMAL(5,2) GENERATED ALWAYS AS
        (CASE 
            WHEN total_classes = 0 THEN 0
            ELSE (attended_classes * 100.0 / total_classes)
         END) STORED,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, course_id)
);

INSERT INTO attendance (user_id, course_id, total_classes, attended_classes)
SELECT 
    e.user_id,
    e.course_id,
    40,
    32
FROM enrollments e
ON CONFLICT DO NOTHING;

SELECT * FROM attendance;


UPDATE attendance
SET total_classes = 40,
    attended_classes = 40
WHERE course_id % 3 = 0;

UPDATE attendance
SET total_classes = 40,
    attended_classes = 34
WHERE course_id % 3 = 1;

UPDATE attendance
SET total_classes = 40,
    attended_classes = 26
WHERE course_id % 3 = 2;


CREATE TABLE IF NOT EXISTS results (
    result_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,

    internal_marks INT CHECK (internal_marks BETWEEN 0 AND 50),
    external_marks INT CHECK (external_marks BETWEEN 0 AND 100),
    total_marks INT GENERATED ALWAYS AS (internal_marks + external_marks) STORED,

    grade VARCHAR(2),
    status VARCHAR(10), -- PASS / FAIL

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, course_id)
);

INSERT INTO results (user_id, course_id, internal_marks, external_marks, grade, status)
SELECT 
    e.user_id,
    e.course_id,
    40,
    65,
    'A',
    'PASS'
FROM enrollments e
ON CONFLICT DO NOTHING;

UPDATE results
SET 
    grade = CASE
        WHEN total_marks > 90 THEN 'O'
        WHEN total_marks BETWEEN 80 AND 90 THEN 'A+'
        WHEN total_marks BETWEEN 70 AND 79 THEN 'A'
        WHEN total_marks BETWEEN 60 AND 69 THEN 'B+'
        WHEN total_marks BETWEEN 50 AND 59 THEN 'B'
        ELSE 'F'
    END,
    status = CASE
        WHEN total_marks < 50 THEN 'FAIL'
        ELSE 'PASS'
    END;

CREATE OR REPLACE FUNCTION calculate_grade()
RETURNS TRIGGER AS $$
BEGIN
    NEW.grade := CASE
        WHEN NEW.total_marks > 90 THEN 'O'
        WHEN NEW.total_marks BETWEEN 80 AND 90 THEN 'A+'
        WHEN NEW.total_marks BETWEEN 70 AND 79 THEN 'A'
        WHEN NEW.total_marks BETWEEN 60 AND 69 THEN 'B+'
        WHEN NEW.total_marks BETWEEN 50 AND 59 THEN 'B'
        ELSE 'F'
    END;

    NEW.status := CASE
        WHEN NEW.total_marks < 50 THEN 'FAIL'
        ELSE 'PASS'
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_grade ON results;

CREATE TRIGGER trigger_calculate_grade
BEFORE INSERT OR UPDATE ON results
FOR EACH ROW
EXECUTE FUNCTION calculate_grade();

UPDATE results r
SET
    internal_marks = v.internal,
    external_marks = v.external
FROM (
    VALUES
        ('Cloud Computing', 38, 56),                -- 94 → O
        ('Cyber Security Fundamentals', 35, 52),    -- 87 → A+
        ('Data Science', 32, 45),                   -- 77 → A
        ('Data Structures and Algorithms', 36, 54), -- 90 → A+
        ('Fundamentals of Database Systems', 34, 50), -- 84 → A+
        ('Machine Learning', 30, 42)                -- 72 → A
) AS v(course_name, internal, external)
JOIN courses c ON c.course_name = v.course_name
WHERE r.course_id = c.course_id;


UPDATE results
SET 
    grade = CASE
        WHEN total_marks > 90 THEN 'O'
        WHEN total_marks BETWEEN 80 AND 90 THEN 'A+'
        WHEN total_marks BETWEEN 70 AND 79 THEN 'A'
        WHEN total_marks BETWEEN 60 AND 69 THEN 'B+'
        WHEN total_marks BETWEEN 50 AND 59 THEN 'B'
        ELSE 'F'
    END,
    status = CASE
        WHEN total_marks < 50 THEN 'FAIL'
        ELSE 'PASS'
    END;

ALTER TABLE results
ADD CONSTRAINT marks_limit_check
CHECK (
    internal_marks BETWEEN 0 AND 40
    AND external_marks BETWEEN 0 AND 60
);


UPDATE results
SET
    internal_marks = 35,
    external_marks = 55
WHERE internal_marks + external_marks > 100;


UPDATE results
SET
    grade = CASE
        WHEN (internal_marks + external_marks) > 90 THEN 'O'
        WHEN (internal_marks + external_marks) BETWEEN 80 AND 90 THEN 'A+'
        WHEN (internal_marks + external_marks) BETWEEN 70 AND 79 THEN 'A'
        WHEN (internal_marks + external_marks) BETWEEN 60 AND 69 THEN 'B+'
        WHEN (internal_marks + external_marks) BETWEEN 50 AND 59 THEN 'B'
        ELSE 'F'
    END,
    status = CASE
        WHEN (internal_marks + external_marks) < 50 THEN 'FAIL'
        ELSE 'PASS'
    END;


ALTER TABLE results
ADD CONSTRAINT internal_limit CHECK (internal_marks BETWEEN 0 AND 40),
ADD CONSTRAINT external_limit CHECK (external_marks BETWEEN 0 AND 60);

DROP TRIGGER IF EXISTS trigger_calculate_grade ON results;
DROP FUNCTION IF EXISTS calculate_grade();

UPDATE results
SET
    grade = CASE
        WHEN (internal_marks + external_marks) > 90 THEN 'O'
        WHEN (internal_marks + external_marks) BETWEEN 80 AND 90 THEN 'A+'
        WHEN (internal_marks + external_marks) BETWEEN 70 AND 79 THEN 'A'
        WHEN (internal_marks + external_marks) BETWEEN 60 AND 69 THEN 'B+'
        WHEN (internal_marks + external_marks) BETWEEN 50 AND 59 THEN 'B'
        ELSE 'F'
    END,
    status = CASE
        WHEN (internal_marks + external_marks) < 50 THEN 'FAIL'
        ELSE 'PASS'
    END;


	ALTER TABLE results
DROP CONSTRAINT IF EXISTS marks_limit_check;

ALTER TABLE results
ADD CONSTRAINT marks_limit_check
CHECK (
    internal_marks BETWEEN 0 AND 40
    AND external_marks BETWEEN 0 AND 60
);


ALTER TABLE notices
ADD COLUMN IF NOT EXISTS notice_type VARCHAR(50) DEFAULT 'GENERAL',
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

INSERT INTO notices (title, content, posted_by, notice_type, is_pinned)
VALUES
(
 'Mid-Semester Examination Schedule',
 'Mid-semester examinations will start from 5th February 2026. Timetable will be shared soon.',
 'Examination Cell',
 'EXAM',
 TRUE
),
(
 'Semester Fee Payment Deadline',
 'All students must clear semester fees before 31st March to avoid late fines.',
 'Accounts Department',
 'FEE',
 TRUE
),
(
 'Data Science Workshop',
 'A hands-on Data Science workshop will be conducted on 10th February in Seminar Hall.',
 'Training & Placement Cell',
 'EVENT',
 FALSE
),
(
 'Cloud Computing Classes Update',
 'Cloud Computing classes on Monday will be conducted online.',
 'CSE Department',
 'ACADEMIC',
 FALSE
);

SELECT title, notice_type, is_pinned, posted_at
FROM notices
ORDER BY is_pinned DESC, posted_at DESC;


ALTER TABLE notices
ADD COLUMN priority INT DEFAULT 1,
ADD COLUMN icon VARCHAR(10) DEFAULT '📢',
ADD COLUMN expires_at TIMESTAMP,
ADD COLUMN created_by INT REFERENCES instructors(instructor_id);

CREATE TABLE IF NOT EXISTS schedule (
    schedule_id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schedule (course_id, day_of_week, start_time, end_time, room)
SELECT course_id, 'Monday', '10:00', '11:00', 'B201'
FROM courses
WHERE course_code = 'CS202';

INSERT INTO schedule (course_id, day_of_week, start_time, end_time, room)
SELECT course_id, 'Tuesday', '12:00', '13:00', 'A105'
FROM courses
WHERE course_code = 'CS301';

INSERT INTO schedule (course_id, day_of_week, start_time, end_time, room)
SELECT course_id, 'Wednesday', '09:00', '10:00', 'Lab-3'
FROM courses
WHERE course_code = 'CS453';



INSERT INTO schedule (course_id, day_of_week, start_time, end_time, room)
SELECT course_id, 'Thursday', '11:00', '12:00', 'C101'
FROM courses
WHERE course_code = 'CS202';


INSERT INTO schedule (course_id, day_of_week, start_time, end_time, room)
SELECT course_id, 'Friday', '14:00', '15:00', 'Lab-2'
FROM courses
WHERE course_code = 'CS453';

INSERT INTO enrollments (user_id, course_id)
SELECT 1, course_id FROM courses LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO schedule (course_id, day_of_week, start_time, end_time, room)
SELECT course_id, 'Monday', '10:00', '11:00', 'B201'
FROM enrollments
WHERE user_id = 1;

S



