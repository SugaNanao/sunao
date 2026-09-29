import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large payload for rich couple data (images, album, custom text)
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  const PUBLIC_DIR = path.join(process.cwd(), 'public');
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  const DATA_FILE = path.join(PUBLIC_DIR, 'published-data.json');
  const ROOT_DATA_FILE = path.join(process.cwd(), 'published-data.json');

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // CORS & No-Cache middleware for API routes
  app.use('/api', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Cache-Control');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // GET /api/site-data - retrieve server-published couple data
  app.get(['/api/site-data', '/published-data.json'], (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    try {
      const distDataFile = path.join(process.cwd(), 'dist', 'published-data.json');
      const targetFile = fs.existsSync(DATA_FILE)
        ? DATA_FILE
        : fs.existsSync(ROOT_DATA_FILE)
        ? ROOT_DATA_FILE
        : fs.existsSync(distDataFile)
        ? distDataFile
        : null;

      if (targetFile) {
        const fileContent = fs.readFileSync(targetFile, 'utf-8');
        const parsed = JSON.parse(fileContent);
        const stats = fs.statSync(targetFile);
        if (req.path === '/published-data.json') {
          return res.json(parsed);
        }
        return res.json({
          published: true,
          data: parsed,
          updatedAt: parsed.updatedAt || stats.mtime.toISOString(),
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
      try {
        fs.writeFileSync(ROOT_DATA_FILE, jsonString, 'utf-8');
      } catch {}

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

  // POST /api/upload-audio - Upload custom music file (mp3, m4a, wav, mp4, etc.)
  app.post('/api/upload-audio', (req, res) => {
    try {
      const { filename, fileData, title, artist } = req.body;
      if (!fileData) {
        return res.status(400).json({ error: '缺少音訊檔案資料' });
      }

      const audioUploadDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
      if (!fs.existsSync(audioUploadDir)) {
        fs.mkdirSync(audioUploadDir, { recursive: true });
      }

      // Sanitize extension and filename
      const parsedExt = path.extname(filename || '').toLowerCase();
      const validExts = ['.mp3', '.m4a', '.wav', '.ogg', '.mp4', '.aac', '.flac', '.webm'];
      const ext = validExts.includes(parsedExt) ? parsedExt : '.mp3';

      const safeBaseName = (path.parse(filename || 'track').name || 'audio')
        .replace(/[^a-zA-Z0-9_\u4e00-\u9fa5\u3040-\u30ff-]/g, '_')
        .slice(0, 40);

      const uniqueFileName = `${Date.now()}_${safeBaseName}${ext}`;
      const filePath = path.join(audioUploadDir, uniqueFileName);

      // Strip data:audio/...;base64, or data:video/...;base64, if present
      const base64Content = fileData.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Content, 'base64');

      fs.writeFileSync(filePath, buffer);

      // Also copy to dist/uploads/audio if dist directory exists
      try {
        const distUploadDir = path.join(process.cwd(), 'dist', 'uploads', 'audio');
        if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
          if (!fs.existsSync(distUploadDir)) {
            fs.mkdirSync(distUploadDir, { recursive: true });
          }
          fs.writeFileSync(path.join(distUploadDir, uniqueFileName), buffer);
        }
      } catch (copyErr) {
        console.warn('[API] Warning syncing audio to dist directory:', copyErr);
      }

      const relativeUrl = `/uploads/audio/${uniqueFileName}`;
      console.log(`[API] Custom audio uploaded successfully: ${relativeUrl} (${buffer.length} bytes)`);

      const songTitle = (title || '').trim() || path.parse(filename || '自訂音樂').name;
      const songArtist = (artist || '').trim();

      return res.json({
        success: true,
        url: relativeUrl,
        filename: uniqueFileName,
        title: songTitle,
        artist: songArtist,
        size: buffer.length,
      });
    } catch (err) {
      console.error('[API] Error uploading audio:', err);
      return res.status(500).json({ error: '伺服器處理音訊上傳失敗' });
    }
  });

  // Serve static /uploads folder (for uploaded audio and custom assets)
  const uploadsStaticDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsStaticDir)) {
    fs.mkdirSync(uploadsStaticDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsStaticDir));

  // Handle payload too large and API errors gracefully as JSON
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err && (err.type === 'entity.too.large' || err.status === 413)) {
      return res.status(413).json({
        error: '上傳資料或圖片總量過大（超過伺服器單次傳輸限制），請使用「一鍵無損壓縮所有圖片」瘦身後再發布！',
      });
    }
    if (err) {
      console.error('[API Server Error]:', err);
      return res.status(err.status || 500).json({
        error: err.message || '伺服器處理請求時發生錯誤',
      });
    }
    next();
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
