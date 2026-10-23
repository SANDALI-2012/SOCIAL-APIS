import express from 'express';
import cors from 'cors';
import * as tiktok from './scrapers/tiktok.js';
import * as facebook from './scrapers/facebook.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);

// ── Request logger ─────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ── URL validator helper ───────────────────────
function requireUrl(req, res) {
  const url = req.query.url;
  if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
    res.status(400).json({ error: 'Missing or invalid ?url= query param' });
    return null;
  }
  return url;
}

// ── Root / health ──────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    name: 'Video Downloader API',
    version: '1.0.0',
    endpoints: {
      tiktok: {
        video:    '/api/tiktok/video?url=',
        download: '/api/tiktok/download?url=',
        audio:    '/api/tiktok/audio?url=',
        debug:    '/api/tiktok/debug?url=',
      },
      facebook: {
        video:    '/api/facebook/video?url=',
        download: '/api/facebook/download?url=',
        info:     '/api/facebook/info?url=',
        debug:    '/api/facebook/debug?url=',
      },
    },
  });
});

app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// ── TikTok routes ──────────────────────────────
app.get('/api/tiktok/video', async (req, res) => {
  const url = requireUrl(req, res); if (!url) return;
  try { res.json(await tiktok.video(url)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/tiktok/download', async (req, res) => {
  const url = requireUrl(req, res); if (!url) return;
  try { res.json(await tiktok.download(url)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/tiktok/audio', async (req, res) => {
  const url = requireUrl(req, res); if (!url) return;
  try { res.json(await tiktok.audio(url)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/tiktok/debug', async (req, res) => {
  const url = requireUrl(req, res); if (!url) return;
  try { res.json(await tiktok.debug(url)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Facebook routes ────────────────────────────
app.get('/api/facebook/video', async (req, res) => {
  const url = requireUrl(req, res); if (!url) return;
  try { res.json(await facebook.video(url)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/facebook/download', async (req, res) => {
  const url = requireUrl(req, res); if (!url) return;
  try { res.json(await facebook.download(url)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/facebook/info', async (req, res) => {
  const url = requireUrl(req, res); if (!url) return;
  try { res.json(await facebook.info(url)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/facebook/debug', async (req, res) => {
  const url = requireUrl(req, res); if (!url) return;
  try { res.json(await facebook.debug(url)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ── 404 + error handler ────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, _req, res, _next) => {
  console.error('Unhandled:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ──────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

// graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down');
  process.exit(0);
});
