-- Complete database setup for Task Management Application
-- Run this script in your Neon SQL Editor

-- Create users_sync table (main users table)
CREATE TABLE IF NOT EXISTS users_sync (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  raw_json JSONB
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP,
  assigned_to TEXT REFERENCES users_sync(id),
  created_by TEXT REFERENCES users_sync(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create task_comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users_sync(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users_sync(id) UNIQUE,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_sync_email ON users_sync(email);
CREATE INDEX IF NOT EXISTS idx_users_sync_deleted_at ON users_sync(deleted_at);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Insert default admin user
INSERT INTO users_sync (id, email, name, created_at, updated_at) 
VALUES (
  'admin-001', 
  'nathnaelyimer@gmail.com', 
  'Nathan Yimer', 
  NOW(), 
  NOW()
) ON CONFLICT (email) DO UPDATE SET 
  name = EXCLUDED.name,
  updated_at = NOW();

-- Set admin role for the user
INSERT INTO user_roles (user_id, role, created_at) 
VALUES ('admin-001', 'admin', NOW()) 
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'admin';

-- Insert some sample tasks for testing
INSERT INTO tasks (title, description, status, priority, assigned_to, created_by) VALUES
('Complete Project Setup', 'Set up the development environment and install dependencies', 'completed', 'high', 'admin-001', 'admin-001'),
('Design User Interface', 'Create wireframes and mockups for the main dashboard', 'in-progress', 'medium', 'admin-001', 'admin-001'),
('Database Schema Design', 'Design and implement the database structure', 'completed', 'high', 'admin-001', 'admin-001'),
('API Development', 'Implement RESTful API endpoints for task management', 'pending', 'high', 'admin-001', 'admin-001'),
('Testing and QA', 'Perform comprehensive testing of all features', 'pending', 'medium', 'admin-001', 'admin-001');

-- Insert sample comments
INSERT INTO task_comments (task_id, user_id, comment) VALUES
(1, 'admin-001', 'Environment setup completed successfully'),
(2, 'admin-001', 'Working on the dashboard design'),
(3, 'admin-001', 'Database schema finalized and implemented');

-- Display confirmation
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as users_count FROM users_sync;
SELECT COUNT(*) as tasks_count FROM tasks;
SELECT COUNT(*) as roles_count FROM user_roles; 