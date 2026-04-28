const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from dist/public (built frontend)
const staticPath = path.join(__dirname, 'dist', 'public');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
} else {
  // Fallback: serve from current directory (for local dev)
  app.use(express.static('.'));
}

// Datenbank-Datei (JSON) - mit In-Memory Fallback für Vercel
const dbFile = path.join(__dirname, 'sponsors.json');

// In-Memory Datenbank als Fallback (wenn Dateisystem read-only ist)
let inMemoryDB = null;
let useInMemory = false;

// Datenbank initialisieren
function initDB() {
  try {
    // Erst prüfen ob Verzeichnis beschreibbar ist
    fs.accessSync(path.dirname(dbFile), fs.constants.W_OK);
    // Nur dann Datei erstellen wenn nicht vorhanden
    if (!fs.existsSync(dbFile)) {
      fs.writeFileSync(dbFile, JSON.stringify([], null, 2));
    }
    useInMemory = false;
    console.log('Using file-based database:', dbFile);
  } catch (err) {
    console.log('Filesystem is read-only, using in-memory database');
    useInMemory = true;
    inMemoryDB = [];
  }
}

// Datenbank lesen
function readDB() {
  if (useInMemory) {
    return inMemoryDB || [];
  }
  try {
    const data = fs.readFileSync(dbFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Fehler beim Lesen der Datenbank:', err);
    return [];
  }
}

// Datenbank schreiben
function writeDB(data) {
  if (useInMemory) {
    inMemoryDB = data;
    return true;
  }
  try {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Fehler beim Schreiben der Datenbank, wechsle zu In-Memory:', err);
    useInMemory = true;
    inMemoryDB = data;
    return true;
  }
}

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), mode: useInMemory ? 'in-memory' : 'file' });
});

// Login
app.post('/api/login', (req, res) => {
  try {
    const { password } = req.body;
    if (password === 'Management') {
      res.json({ success: true, token: 'authenticated' });
    } else {
      res.status(401).json({ success: false, error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get all sponsors
app.get('/api/sponsors', (req, res) => {
  try {
    const sponsors = readDB();
    res.json(sponsors);
  } catch (error) {
    console.error('Get sponsors error:', error);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

// Add sponsor
app.post('/api/sponsors', (req, res) => {
  try {
    const { firma, ansprechpartner, email, kategorie, status, notizen, emailVersendet, antwortErhalten } = req.body;
    
    const sponsors = readDB();
    const newSponsor = {
      id: Date.now(),
      firma,
      ansprechpartner,
      email,
      kategorie,
      status,
      notizen,
      emailVersendet: emailVersendet || null,
      antwortErhalten: antwortErhalten || null,
      createdAt: new Date().toISOString()
    };
    
    sponsors.push(newSponsor);
    
    if (writeDB(sponsors)) {
      res.json({ success: true, id: newSponsor.id });
    } else {
      res.status(500).json({ success: false, error: 'Failed to save' });
    }
  } catch (error) {
    console.error('Add sponsor error:', error);
    res.status(500).json({ success: false, error: 'Failed to add sponsor' });
  }
});

// Update sponsor
app.put('/api/sponsors/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { firma, ansprechpartner, email, kategorie, status, notizen, emailVersendet, antwortErhalten } = req.body;
    
    let sponsors = readDB();
    const index = sponsors.findIndex(s => s.id == id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Sponsor not found' });
    }
    
    sponsors[index] = {
      ...sponsors[index],
      firma,
      ansprechpartner,
      email,
      kategorie,
      status,
      notizen,
      emailVersendet: emailVersendet || null,
      antwortErhalten: antwortErhalten || null,
      updatedAt: new Date().toISOString()
    };
    
    if (writeDB(sponsors)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: 'Failed to save' });
    }
  } catch (error) {
    console.error('Update sponsor error:', error);
    res.status(500).json({ success: false, error: 'Failed to update sponsor' });
  }
});

// Delete sponsor
app.delete('/api/sponsors/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    let sponsors = readDB();
    sponsors = sponsors.filter(s => s.id != id);
    
    if (writeDB(sponsors)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: 'Failed to delete' });
    }
  } catch (error) {
    console.error('Delete sponsor error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete sponsor' });
  }
});

// Get stats
app.get('/api/stats', (req, res) => {
  try {
    const sponsors = readDB();
    
    const stats = {
      total: sponsors.length,
      contacted: sponsors.filter(s => s.status !== 'Noch nicht kontaktiert').length,
      responses: sponsors.filter(s => s.status === 'Antwort erhalten').length,
      rejections: sponsors.filter(s => s.status === 'Absage').length,
      partners: sponsors.filter(s => s.status === 'Zusage/Partner').length
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// SPA Fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing gracefully...');
  process.exit(0);
});

// Start server
initDB();
const server = app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server running on http://localhost:${PORT}`);
  console.log('Database mode:', useInMemory ? 'in-memory' : 'file');
});

module.exports = server;
