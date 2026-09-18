const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Route: GET / -> trả về text: "Hello, Express!"
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.listen(PORT, () => {
  console.log(`Exercise 5 Server is running on port ${PORT}`);
});
