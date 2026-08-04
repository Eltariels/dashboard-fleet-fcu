import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    roleColors: {
      chef_groupe: { type: String, default: '#ff9c9c' },
      chef_division: { type: String, default: '#e04b4b' },
      officier: { type: String, default: '#7a0e0e' },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
