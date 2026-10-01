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
    res.status(200).json(data.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await readData();

    const comment = data.comments.find(item => item.id === id);
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


    const article = data.articles.find(item => item.id === parseInt(articleId));
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    let maxId = 0;
    for (let i = 0; i < data.comments.length; i++) {
      if (data.comments[i].id > maxId) {
        maxId = data.comments[i].id;
      }
    }
    const newId = maxId + 1;

    const newComment = {
      id: newId,
      articleId: parseInt(articleId),
      author: author,
      content: content,
      date: date
    };

    data.comments.push(newComment);
    await writeData(data);

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await readData();

    let foundIndex = -1;
    for (let i = 0; i < data.comments.length; i++) {
      if (data.comments[i].id === id) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (req.body.author !== undefined) data.comments[foundIndex].author = req.body.author;
    if (req.body.content !== undefined) data.comments[foundIndex].content = req.body.content;
    if (req.body.date !== undefined) data.comments[foundIndex].date = req.body.date;

    await writeData(data);

    res.status(200).json(data.comments[foundIndex]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await readData();

    let foundIndex = -1;
    for (let i = 0; i < data.comments.length; i++) {
      if (data.comments[i].id === id) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const deletedComment = data.comments[foundIndex];
    data.comments.splice(foundIndex, 1);

    await writeData(data);

    res.status(200).json(deletedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
