const request = require('supertest');
const express = require('express');
const app = express();
const { list } = require('../controllers/routeController');

// Supabase client
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://cqohcrtvvbaaofvxfcaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxb2hjcnR2dmJhYW9mdnhmY2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUzMjg2NjEsImV4cCI6MjAzMDkwNDY2MX0.n125xdxjq8SdLrBYcGWBIGd5XpZzWT8hIrsyvw71_kM';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

// Define route for list function
app.get('/routes', (req, res) => {
  list(req, res, supabase);
});

// Test the list route
test('GET /routes', async () => {
  const response = await request(app).get('/routes');
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty('data');
  expect(Array.isArray(response.body.data)).toBe(true);
  expect(response.body.data.length).toBeGreaterThan(1);
});