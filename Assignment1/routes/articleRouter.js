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
    res.status(200).json(data.articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await readData();
    const article = data.articles.find(a => a.id === parseInt(req.params.id));
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: 'Bad request: Request body is missing' });
    }

    const { title, content, author, date } = req.body;
    if (!title || !content || !author || !date) {
      return res.status(400).json({ message: 'Bad request: Missing required fields' });
    }

    const data = await readData();
    const newId = data.articles.length > 0 ? Math.max(...data.articles.map(a => a.id)) + 1 : 1;
    const newArticle = { id: newId, title, content, author, date };
    data.articles.push(newArticle);
    await writeData(data);
    res.status(201).json(newArticle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.articles.findIndex(a => a.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: 'Article not found' });
    }
    data.articles[index] = { ...data.articles[index], ...req.body, id: parseInt(req.params.id) };
    await writeData(data);
    res.status(200).json(data.articles[index]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await readData();
    const id = parseInt(req.params.id);
    const index = data.articles.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Article not found' });
    }
    const deletedArticle = data.articles.splice(index, 1)[0];
    await writeData(data);
    res.status(200).json(deletedArticle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/comments', async (req, res) => {
  try {
    const data = await readData();
    const articleId = parseInt(req.params.id);
    const article = data.articles.find(a => a.id === articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    const comments = data.comments.filter(c => c.articleId === articleId);
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
