import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import net from 'net';
import multer, { StorageEngine } from 'multer';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';

dotenv.config();

const app = express();
// Explicit CORS configuration to avoid CORB/CORS issues in Chrome
app.use(cors({
  origin: true, // reflect request origin
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: false,
}));
app.options('*', cors());
app.use(express.json());
// Serve uploaded files for playback in the frontend
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const PORT = Number(process.env.PORT) || 8080;

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage setup
const storage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, (file as any).originalname)
});
const upload = multer({ storage });

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'backend', timestamp: new Date().toISOString() });
});

// Receive uploaded recording blobs
app.post('/upload', upload.single('file'), (req: express.Request, res: express.Response) => {
  const file: any = (req as any).file;
  if (!file) {
    return res.status(400).json({ ok: false, error: 'Missing file' });
  }
  const { originalname, path: savedPath, size } = file;
  const { projectId, tool, date, segment } = req.body as { projectId?: string; tool?: string; date?: string; segment?: string };

  // Organize storage: /uploads/<projectId>/<tool>/<date>/
  const safeProject = (projectId || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeTool = (tool || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeDate = (date || new Date().toISOString().slice(0,10)).replace(/[^0-9-]/g, '_');
  const targetDir = path.join(uploadsDir, safeProject, safeTool, safeDate);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const ext = path.extname(originalname) || '.webm';
  const seg = String(segment || '').replace(/[^a-zA-Z0-9_-]/g, '_') || String(Date.now());
  const uniqueName = `${safeTool}_${seg}${ext}`;
  const targetPath = path.join(targetDir, uniqueName);
  fs.renameSync(savedPath, targetPath);

  res.json({ ok: true, filename: uniqueName, path: targetPath, size, projectId: safeProject, tool: safeTool, date: safeDate });
});

// Merge all segments in a date folder into a final MP4 and generate speed variants
app.post('/merge', async (req, res) => {
  try {
    const { projectId, tool, date } = req.body as { projectId: string; tool: string; date: string };
    const baseDir = path.join(uploadsDir, projectId, tool, date);
    if (!fs.existsSync(baseDir)) return res.status(404).json({ ok: false, error: 'No segments found' });

    const files = fs.readdirSync(baseDir)
      .filter(f => /\.(webm|mp4|mkv)$/i.test(f))
      .map(f => path.join(baseDir, f))
      .sort();
    if (files.length === 0) return res.status(404).json({ ok: false, error: 'No segments found' });

    ffmpeg.setFfmpegPath(ffmpegPath as string);

    const concatList = path.join(baseDir, 'concat.txt');
    fs.writeFileSync(concatList, files.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n'));

    const finalMp4 = path.join(baseDir, 'final.mp4');

    async function tryCopyConcat(): Promise<boolean> {
      return await new Promise<boolean>((resolve) => {
        ffmpeg()
          .input(concatList)
          .inputOptions(['-f concat', '-safe 0'])
          .outputOptions(['-c copy'])
          .output(finalMp4)
          .on('end', () => resolve(true))
          .on('error', () => resolve(false))
          .run();
      });
    }

    async function reencodeConcat(): Promise<void> {
      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input(concatList)
          .inputOptions(['-f concat', '-safe 0'])
          .outputOptions([
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-crf', '23',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac',
            '-b:a', '128k'
          ])
          .output(finalMp4)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });
    }

    const copied = await tryCopyConcat();
    if (!copied) {
      await reencodeConcat();
    }

    const speeds = [2, 5, 10];
    const outputs: Record<string,string> = { '1x': `/uploads/${projectId}/${tool}/${date}/final.mp4` };
    for (const s of speeds) {
      const outPath = path.join(baseDir, `final_${s}x.mp4`);
      await new Promise<void>((resolve, reject) => {
        const vRate = (1/s).toFixed(3);
        const audioFilters = s === 2 ? 'atempo=2.0' : ''; // drop audio for >2x
        const opts = [
          '-filter:v', `setpts=${vRate}*PTS`,
        ];
        if (audioFilters) {
          opts.push('-filter:a', audioFilters);
        } else {
          opts.push('-an');
        }

        ffmpeg(finalMp4)
          .outputOptions(opts)
          .output(outPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });
      outputs[`${s}x`] = `/uploads/${projectId}/${tool}/${date}/final_${s}x.mp4`;
    }

    res.json({ ok: true, outputs });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

// List merged sessions for a project
app.get('/sessions', (req, res) => {
  const { projectId } = req.query as { projectId?: string };
  if (!projectId) return res.status(400).json({ ok: false, error: 'Missing projectId' });
  const projectDir = path.join(uploadsDir, projectId);
  if (!fs.existsSync(projectDir)) return res.json({ ok: true, sessions: [] });
  const sessions: Array<{ tool: string; date: string; paths: Record<string,string> }> = [];
  for (const tool of fs.readdirSync(projectDir)) {
    const toolDir = path.join(projectDir, tool);
    for (const date of fs.readdirSync(toolDir)) {
      const baseDir = path.join(toolDir, date);
      const paths: Record<string,string> = {};
      for (const f of fs.readdirSync(baseDir)) {
        if (f === 'final.mp4') paths['1x'] = `/uploads/${projectId}/${tool}/${date}/final.mp4`;
        const m = f.match(/^final_(\d+)x\.mp4$/);
        if (m) paths[`${m[1]}x`] = `/uploads/${projectId}/${tool}/${date}/final_${m[1]}x.mp4`;
      }
      if (Object.keys(paths).length > 0) sessions.push({ tool, date, paths });
    }
  }
  res.json({ ok: true, sessions });
});

function findAvailablePort(start: number, maxAttempts = 10): Promise<number> {
  return new Promise((resolve) => {
    let attempt = 0;
    const tryPort = (p: number) => {
      const tester = net.createServer()
        .once('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            attempt += 1;
            if (attempt >= maxAttempts) {
              resolve(start); // fallback to start even if busy
            } else {
              const next = p + 1;
              console.warn(`Port ${p} in use. Retrying on ${next}...`);
              tryPort(next);
            }
          } else {
            resolve(start);
          }
        })
        .once('listening', () => {
          tester.close(() => resolve(p));
        })
        .listen(p, '0.0.0.0');
    };
    tryPort(start);
  });
}

(async () => {
  const p = await findAvailablePort(PORT);
  app.listen(p, () => {
    console.log(`Backend server listening on port ${p}`);
  });
})();
