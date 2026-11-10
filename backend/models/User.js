const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 254 },
  password: { type: String, required: true, minlength: 6, select: false },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  image: { type: String, default: '' },
});

userSchema.set('toJSON', {
  transform: (_document, result) => {
    delete result.password;
    delete result.__v;
    return result;
  },
});

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
