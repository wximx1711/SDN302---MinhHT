const router = require('express').Router();
const books = require('../controllers/bookController');
const members = require('../controllers/memberController');
const loans = require('../controllers/loanController');
// One request at a time prevents overlapping inventory changes in this single API process.
// This is not a database transaction and does not coordinate other apps or Compass writes.
let previous = Promise.resolve();
function serial(handler) {
  return (req, res, next) => {
    const current = previous.then(() => handler(req, res));
    previous = current.catch(() => {});
    current.catch(next);
  };
}

router.get('/books', serial(books.list));
router.get('/book/:id', serial(books.get));
router.get('/books/:id', serial(books.get));
router.post('/books', serial(books.create));
router.put('/books/:id', serial(books.update));
router.delete('/books/:id', serial(books.remove));

router.get('/members', serial(members.list));
router.get('/members/:id', serial(members.get));
router.post('/members', serial(members.create));
router.put('/members/:id', serial(members.update));
router.delete('/members/:id', serial(members.remove));

router.get('/loans', serial(loans.list));
router.get('/loans/members/:memberID', serial(loans.byMember));
router.post('/loans', serial(loans.borrow));
router.put('/loans/:id/return', serial(loans.returnLoan));
module.exports = router;
