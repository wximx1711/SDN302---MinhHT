const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();
const dataPath = path.join(__dirname, '../data.json');

async function readData() {
  const content = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(content);
}

async function writeData(data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
}

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
    const id = parseInt(req.params.id);
    const data = await readData();

    const article = data.articles.find(item => item.id === id);

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

    let maxId = 0;
    for (let i = 0; i < data.articles.length; i++) {
      if (data.articles[i].id > maxId) {
        maxId = data.articles[i].id;
      }
    }
    const newId = maxId + 1;

    const newArticle = {
      id: newId,
      title: title,
      content: content,
      author: author,
      date: date
    };

    data.articles.push(newArticle);
    await writeData(data);

    res.status(201).json(newArticle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await readData();

    let foundIndex = -1;
    for (let i = 0; i < data.articles.length; i++) {
      if (data.articles[i].id === id) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (req.body.title !== undefined) data.articles[foundIndex].title = req.body.title;
    if (req.body.content !== undefined) data.articles[foundIndex].content = req.body.content;
    if (req.body.author !== undefined) data.articles[foundIndex].author = req.body.author;
    if (req.body.date !== undefined) data.articles[foundIndex].date = req.body.date;

    await writeData(data);

    res.status(200).json(data.articles[foundIndex]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await readData();

    let foundIndex = -1;
    for (let i = 0; i < data.articles.length; i++) {
      if (data.articles[i].id === id) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const deletedArticle = data.articles[foundIndex];
    data.articles.splice(foundIndex, 1);

    await writeData(data);

    res.status(200).json(deletedArticle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/:id/comments', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const data = await readData();

    const article = data.articles.find(item => item.id === articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const comments = data.comments.filter(item => item.articleId === articleId);
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
