const express = require('express');
const articleRouter = require('./routes/articleRouter');
const commentRouter = require('./routes/commentRouter');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/articles', articleRouter);
app.use('/comments', commentRouter);

app.get('/', (req, res) => {
  res.redirect('/articles');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
