import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large payload for rich couple data (images, album, custom text)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  const DATA_FILE = path.join(process.cwd(), 'published-data.json');

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // GET /api/site-data - retrieve server-published couple data
  app.get(['/api/site-data', '/published-data.json'], (req, res) => {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        const stats = fs.statSync(DATA_FILE);
        if (req.path === '/published-data.json') {
          return res.json(parsed);
        }
        return res.json({
          published: true,
          data: parsed,
          updatedAt: stats.mtime.toISOString(),
        });
      }
      if (req.path === '/published-data.json') {
        return res.status(404).json({ error: 'Not published yet' });
      }
      return res.json({
        published: false,
        data: null,
      });
    } catch (err) {
      console.error('[API] Error reading published-data.json:', err);
      return res.status(500).json({ error: 'Failed to read published site data' });
    }
  });

  // POST /api/site-data - publish/save couple data to server disk
  app.post('/api/site-data', (req, res) => {
    try {
      const siteData = req.body;
      if (!siteData || typeof siteData !== 'object' || !siteData.siteTitle) {
        return res.status(400).json({ error: 'Invalid site data payload' });
      }

      const jsonString = JSON.stringify(siteData, null, 2);
      fs.writeFileSync(DATA_FILE, jsonString, 'utf-8');

      // Also persist to public and dist directories so static requests get immediate access
      try {
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.writeFileSync(path.join(publicDir, 'published-data.json'), jsonString, 'utf-8');

        const distDir = path.join(process.cwd(), 'dist');
        if (fs.existsSync(distDir)) {
          fs.writeFileSync(path.join(distDir, 'published-data.json'), jsonString, 'utf-8');
        }
      } catch (err) {
        console.warn('[API] Warning syncing to public/dist directories:', err);
      }

      console.log(`[API] Site data published successfully to server disk. Size: ${jsonString.length} bytes`);

      return res.json({
        success: true,
        message: 'Site data successfully published to server',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[API] Error writing published-data.json:', err);
      return res.status(500).json({ error: 'Failed to publish site data to server' });
    }
  });

  // Vite integration: middleware in development, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
