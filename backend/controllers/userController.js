const fs = require('fs/promises');
const path = require('path');
const User = require('../models/User');
const { uploadDirectory } = require('../middleware/upload');

function imageUrl(req, filename) {
  return filename ? `${req.protocol}://${req.get('host')}/uploads/${filename}` : '';
}

function serializeUser(user) {
  return {
    id: String(user._id || user.id),
    name: user.name,
    email: user.email,
    image: user.image || '',
  };
}

async function removeImage(imageUrlValue) {
  if (!imageUrlValue) return;
  try {
    const filename = path.basename(new URL(imageUrlValue, 'http://localhost').pathname);
    if (!filename) return;
    await fs.unlink(path.join(uploadDirectory, filename));
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Could not remove uploaded image:', error.message);
  }
}

async function listUsers(_req, res) {
  const users = await User.find().select('-password').sort({ _id: -1 }).lean();
  return res.json({ users: users.map(serializeUser), total: users.length });
}

async function getUser(req, res) {
  const user = await User.findById(req.params.id).select('-password').lean();
  if (!user) return res.status(404).json({ message: 'User not found.' });
  return res.json({ user: serializeUser(user) });
}

async function createUser(req, res) {
  const body = req.body || {};
  const { name, email, password } = body;
  if (!String(name || '').trim() || !String(email || '').trim() || !String(password || '')) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const user = await User.create({
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    password: String(password),
    image: req.file ? imageUrl(req, req.file.filename) : String(body.image || '').trim(),
  });
  return res.status(201).json({ user: serializeUser(user) });
}

async function updateUser(req, res) {
  const user = await User.findById(req.params.id).select('+password');
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const oldImage = user.image;
  const body = req.body || {};
  const { name, email, password } = body;
  if (name !== undefined) user.name = String(name).trim();
  if (email !== undefined) user.email = String(email).trim().toLowerCase();
  if (password) user.password = String(password);
  if (req.file) user.image = imageUrl(req, req.file.filename);
  else if (body.image !== undefined) user.image = String(body.image || '').trim();
  await user.save();

  if (req.file && oldImage) await removeImage(oldImage);
  return res.json({ user: serializeUser(user) });
}

async function deleteUser(req, res) {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  await removeImage(user.image);
  return res.json({ message: 'User deleted.' });
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
