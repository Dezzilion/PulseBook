const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'auth.json');
const initialData = { users: [], lastId: 0 };

function loadDatabase() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    return { ...initialData };
  }

  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    return { ...initialData };
  }
}

function saveDatabase(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

const db = loadDatabase();

function getUserByEmail(email) {
  return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

function getUserById(id) {
  return db.users.find((user) => user.id === id) || null;
}

function addUser({ email, passwordHash, firstName, lastName }) {
  const user = {
    id: ++db.lastId,
    email,
    passwordHash,
    firstName,
    lastName,
    refreshToken: null,
  };
  db.users.push(user);
  saveDatabase(db);
  return user;
}

function updateUser(userId, changes) {
  const user = getUserById(userId);
  if (!user) return null;

  Object.assign(user, changes);
  saveDatabase(db);
  return user;
}

module.exports = {
  getUserByEmail,
  getUserById,
  addUser,
  updateUser,
};
