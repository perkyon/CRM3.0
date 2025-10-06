-- Simple test queries to identify the exact problem
-- These queries should work without RLS issues

-- Test 1: Simple SELECT from clients table
SELECT COUNT(*) as total_clients FROM clients;

-- Test 2: Simple SELECT from projects table  
SELECT COUNT(*) as total_projects FROM projects;

-- Test 3: Simple SELECT with limit
SELECT id, name, company, status FROM clients LIMIT 5;

-- Test 4: Simple SELECT with limit for projects
SELECT id, title, stage, priority FROM projects LIMIT 5;

-- Test 5: Test JOIN query (this might be the problem)
SELECT 
  c.id,
  c.name,
  c.company,
  COUNT(ct.id) as contact_count
FROM clients c
LEFT JOIN contacts ct ON c.id = ct.client_id
GROUP BY c.id, c.name, c.company
LIMIT 5;

-- Test 6: Test complex JOIN (this is likely causing 400 errors)
SELECT 
  c.*,
  ct.id as contact_id,
  ct.name as contact_name,
  ct.phone as contact_phone,
  ct.email as contact_email,
  ct.is_primary
FROM clients c
LEFT JOIN contacts ct ON c.id = ct.client_id
LIMIT 5;

-- Test 7: Test projects with client info
SELECT 
  p.id,
  p.title,
  p.stage,
  p.priority,
  c.name as client_name
FROM projects p
LEFT JOIN clients c ON p.client_id = c.id
LIMIT 5;
