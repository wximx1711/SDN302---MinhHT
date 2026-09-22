const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();
const dataPath = path.join(__dirname, '../data.json');

const readData = async () => {
  const data = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(data);
};

const writeData = async (data) => {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
};

router.get('/', async (req, res) => {
  try {
    const data = await readData();
    res.status(200).json(data.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await readData();
    const comment = data.comments.find(c => c.id === parseInt(req.params.id));
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: 'Bad request: Request body is missing' });
    }

    const { articleId, author, content, date } = req.body;
    if (!articleId || !author || !content || !date) {
      return res.status(400).json({ message: 'Bad request: Missing required fields' });
    }
    const data = await readData();

    const articleExists = data.articles.some(a => a.id === parseInt(articleId));
    if (!articleExists) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const newId = data.comments.length > 0 ? Math.max(...data.comments.map(c => c.id)) + 1 : 1;
    const newComment = { id: newId, articleId: parseInt(articleId), author, content, date };
    data.comments.push(newComment);
    await writeData(data);
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.comments.findIndex(c => c.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    data.comments[index] = { ...data.comments[index], ...req.body, id: parseInt(req.params.id) };
    await writeData(data);
    res.status(200).json(data.comments[index]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await readData();
    const id = parseInt(req.params.id);
    const index = data.comments.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    const deletedComment = data.comments.splice(index, 1)[0];
    await writeData(data);
    res.status(200).json(deletedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
