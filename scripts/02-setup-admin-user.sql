-- Create admin user with provided credentials
INSERT INTO users (id, email, name, created_at, updated_at) 
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
