const express = require('express');
const router = express.Router();
const initialArticles = require('../articles');

// In-memory data store sao chép từ articles.js
let articles = [...initialArticles];

// ==========================================
// 1. ROUTE TẬP HỢP: /articles
// ==========================================
router.route('/')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  })
  .get((req, res) => {
    // Chuẩn đề bài test Postman:
    res.end('Will send all the articles to you!');
  })
  .post((req, res) => {
    const { title, text, date } = req.body;
    
    // Thao tác mảng dữ liệu thực tế (In-memory CRUD):
    const newId = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
    articles.push({
      id: newId,
      title: title || 'Untitled',
      date: date || new Date().toISOString().split('T')[0],
      text: text || ''
    });

    res.statusCode = 201;
    // Chuẩn từng chữ theo screenshot Postman của đề bài:
    res.end(`Will add the article: ${title} with details: ${text} and ${date}`);
  })
  .put((req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /articles');
  })
  .delete((req, res) => {
    articles = [];
    res.end('Deleting all articles');
  });

// ==========================================
// 2. ROUTE CHI TIẾT: /articles/:id
// ==========================================
router.route('/:id')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  })
  .get((req, res) => {
    // Chuẩn text theo screenshot Postman:
    res.end(`Will send details of the article: ${req.params.id} to you!`);
  })
  .post((req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /articles/${req.params.id}`);
  })
  .put((req, res) => {
    const articleId = parseInt(req.params.id, 10);
    const { title, text, date } = req.body;

    const index = articles.findIndex(a => a.id === articleId);
    if (index !== -1) {
      articles[index] = {
        ...articles[index],
        ...(title && { title }),
        ...(text && { text }),
        ...(date && { date })
      };
    }

    // Chuẩn response text có ngắt dòng \n như screenshot Postman:
    res.write(`Updating the article: ${req.params.id}\n`);
    res.end(`Will update the article: ${title} with details: ${text} and ${date}`);
  })
  .delete((req, res) => {
    const articleId = parseInt(req.params.id, 10);
    const index = articles.findIndex(a => a.id === articleId);
    if (index !== -1) {
      articles.splice(index, 1);
    }

    res.end(`Deleting article: ${req.params.id}`);
  });

module.exports = router;
