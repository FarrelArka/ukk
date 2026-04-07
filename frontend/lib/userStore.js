import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory and users file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

export const getUsers = () => {
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
};

export const findUserByEmail = (email) => {
  const users = getUsers();
  return users.find((u) => u.email === email);
};

export const addUser = (user) => {
  const users = getUsers();
  users.push(user);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  return user;
};

export const updateUser = (userId, updatedData) => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedData };
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return users[index];
  }
  return null;
};
