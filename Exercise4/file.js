const fs = require('fs').promises;

// Ham tao file moi
async function createFile(filePath, content = '') {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw error;
  }
}

// Ham doc file
async function readFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return data;
  } catch (error) {
    throw error;
  }
}

// Ham ghi noi tiep vao file
async function appendToFile(filePath, content) {
  try {
    await fs.appendFile(filePath, content, 'utf-8');
  } catch (error) {
    throw error;
  }
}

// Ham xoa file
async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createFile,
  readFile,
  appendToFile,
  deleteFile
};
