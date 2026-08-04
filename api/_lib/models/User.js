import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    pseudo: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'cadre'], required: true, default: 'cadre' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
