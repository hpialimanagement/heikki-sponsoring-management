const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// ============================================================
// In-Memory Datenbank (Vercel ist serverless - kein Dateisystem)
// ============================================================
let inMemorySponsors = [];
let nextId = 1;

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), mode: 'in-memory' });
});

// Login
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === 'Management') {
    res.json({ success: true, token: 'authenticated' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password' });
  }
});

// Get all sponsors
app.get('/api/sponsors', (req, res) => {
  res.json(inMemorySponsors);
});

// Add sponsor
app.post('/api/sponsors', (req, res) => {
  const { firma, ansprechpartner, email, kategorie, status, notizen, emailVersendet, antwortErhalten } = req.body;
  const newSponsor = {
    id: nextId++,
    firma, ansprechpartner, email, kategorie, status, notizen,
    emailVersendet: emailVersendet || null,
    antwortErhalten: antwortErhalten || null,
    createdAt: new Date().toISOString()
  };
  inMemorySponsors.push(newSponsor);
  res.json({ success: true, id: newSponsor.id });
});

// Update sponsor
app.put('/api/sponsors/:id', (req, res) => {
  const { id } = req.params;
  const index = inMemorySponsors.findIndex(s => s.id == id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Sponsor not found' });
  inMemorySponsors[index] = { ...inMemorySponsors[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true });
});

// Delete sponsor
app.delete('/api/sponsors/:id', (req, res) => {
  const { id } = req.params;
  inMemorySponsors = inMemorySponsors.filter(s => s.id != id);
  res.json({ success: true });
});

// Get stats
app.get('/api/stats', (req, res) => {
  const sponsors = inMemorySponsors;
  res.json({
    total: sponsors.length,
    contacted: sponsors.filter(s => s.status !== 'Noch nicht kontaktiert').length,
    responses: sponsors.filter(s => s.status === 'Antwort erhalten').length,
    rejections: sponsors.filter(s => s.status === 'Absage').length,
    partners: sponsors.filter(s => s.status === 'Zusage/Partner').length
  });
});

module.exports = app;
