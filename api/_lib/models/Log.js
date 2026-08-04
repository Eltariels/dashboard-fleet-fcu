import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema(
  {
    accountPseudo: { type: String, required: true },
    role: { type: String, required: true },
    action: { type: String, required: true },
    cible: { type: String, default: '' },
    details: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Log || mongoose.model('Log', LogSchema);
