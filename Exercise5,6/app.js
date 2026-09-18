const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const articlesRouter = require('./routes/articlesRouter');
const videosRouter = require('./routes/videosRouter');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middlewares xử lý parse JSON và urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------------------------------------
// BÀI 1: THAO TÁC FILE data.json
// -------------------------------------------------------------
// GET /data: Đọc bất đồng bộ từ file data.json và trả về JSON
app.get('/data', async (req, res) => {
  try {
    const rawData = await fs.readFile(DATA_FILE, 'utf-8');
    const jsonData = JSON.parse(rawData);
    res.status(200).json(jsonData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data.json', details: error.message });
  }
});

// POST /update: Nhận body { "message": "Updating with a new message!" }, ghi đè data.json
app.post('/update', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message field is required in request body' });
    }

    const payload = { message };
    await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    res.status(200).json({ message: 'The data has been updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update data.json', details: error.message });
  }
});

// -------------------------------------------------------------
// BÀI 2: ROUTE ARTICLES (Gắn vào /articles và alias /article)
// -------------------------------------------------------------
app.use('/articles', articlesRouter);
// Hỗ trợ alias DELETE /article/:id theo yêu cầu đề bài
app.use('/article', articlesRouter);

// -------------------------------------------------------------
// BÀI 3: ROUTER VIDEOS (Gắn vào /videos)
// -------------------------------------------------------------
app.use('/videos', videosRouter);

// Root route thông báo
app.get('/', (req, res) => {
  res.send('Exercise 6 API Server is running. Endpoints: /data, /update, /articles, /videos');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Exercise 6 Server is running on port ${PORT}`);
});
