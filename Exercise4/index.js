const http = require('http');
const path = require('path');
const { readFile } = require('./file');

const hostname = 'localhost';
const port = 8082;

const server = http.createServer(async (req, res) => {
  console.log(`Request for ${req.url} by method ${req.method}`);

  if (req.method === 'GET') {
    let fileUrl = req.url;
    if (fileUrl === '/') {
      fileUrl = '/index.html';
    }

    const filePath = path.resolve('./public' + fileUrl);
    const fileExt = path.extname(filePath);

    if (fileExt === '.html') {
      try {
        const data = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<html><body><h1>Error 500: Internal Server Error</h1><p>${err.message}</p></body></html>`);
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`<html><body><h1>Error 404: ${fileUrl} not supported</h1></body></html>`);
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`<html><body><h1>Error 404: ${req.method} not supported</h1></body></html>`);
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
