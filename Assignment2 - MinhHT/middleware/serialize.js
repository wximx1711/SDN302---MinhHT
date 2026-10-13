// One request at a time prevents overlapping inventory changes in this single API process.
// This is not a database transaction and does not coordinate other apps or Compass writes.
let previous = Promise.resolve();
module.exports = function serialize(handler) {
  return (req, res, next) => {
    const current = previous.then(() => handler(req, res));
    previous = current.catch(() => {});
    current.catch(next);
  };
};
