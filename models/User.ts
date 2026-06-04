import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  streak: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

// Check if model already exists to prevent OverwriteModelError in Next.js
export default mongoose.models.User || mongoose.model('User', UserSchema);
