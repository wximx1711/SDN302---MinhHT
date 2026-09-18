const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'db.json');

// Helper function để đọc db.json
async function readDB() {
  const data = await fs.readFile(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

// Helper function để ghi db.json
async function writeDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /videos - Lấy toàn bộ danh sách videos
router.get('/', async (req, res) => {
  try {
    const db = await readDB();
    res.status(200).json(db.videos || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve videos', details: error.message });
  }
});

// GET /videos/:id - Lấy chi tiết video theo id
router.get('/:id', async (req, res) => {
  try {
    const videoId = parseInt(req.params.id, 10);
    const db = await readDB();
    const video = (db.videos || []).find(v => v.id === videoId);

    if (!video) {
      return res.status(404).json({ error: `Video with id ${req.params.id} not found` });
    }

    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve video', details: error.message });
  }
});

// POST /videos - Thêm video mới
router.post('/', async (req, res) => {
  try {
    const { title, duration, uploader } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required for video' });
    }

    const db = await readDB();
    if (!db.videos) {
      db.videos = [];
    }

    const newId = db.videos.length > 0 ? Math.max(...db.videos.map(v => v.id)) + 1 : 1;
    const newVideo = {
      id: newId,
      title,
      duration: duration || '00:00',
      uploader: uploader || 'Anonymous'
    };

    db.videos.push(newVideo);
    await writeDB(db);

    res.status(201).json(newVideo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create video', details: error.message });
  }
});

// PUT /videos/:id - Cập nhật video theo id
router.put('/:id', async (req, res) => {
  try {
    const videoId = parseInt(req.params.id, 10);
    const db = await readDB();
    const videoIndex = (db.videos || []).findIndex(v => v.id === videoId);

    if (videoIndex === -1) {
      return res.status(404).json({ error: `Video with id ${req.params.id} not found` });
    }

    const { title, duration, uploader } = req.body;

    db.videos[videoIndex] = {
      ...db.videos[videoIndex],
      ...(title !== undefined && { title }),
      ...(duration !== undefined && { duration }),
      ...(uploader !== undefined && { uploader })
    };

    await writeDB(db);
    res.status(200).json(db.videos[videoIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update video', details: error.message });
  }
});

// DELETE /videos/:id - Xóa video theo id
router.delete('/:id', async (req, res) => {
  try {
    const videoId = parseInt(req.params.id, 10);
    const db = await readDB();
    const videoIndex = (db.videos || []).findIndex(v => v.id === videoId);

    if (videoIndex === -1) {
      return res.status(404).json({ error: `Video with id ${req.params.id} not found` });
    }

    const deletedVideo = db.videos.splice(videoIndex, 1)[0];
    await writeDB(db);

    res.status(200).json({ message: `Video ${videoId} deleted successfully`, deleted: deletedVideo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete video', details: error.message });
  }
});

module.exports = router;
