import mongoose from 'mongoose';

const DivisionSchema = new mongoose.Schema(
  {
    slug: { type: String, enum: ['stryker', 'rhino', 'spectre'], required: true, unique: true },
    nom: { type: String, required: true },
    devise: { type: String, default: '' },
    responsableMemberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null },
    secondMemberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Division || mongoose.model('Division', DivisionSchema);
