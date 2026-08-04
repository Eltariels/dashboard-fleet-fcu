import mongoose from 'mongoose';

const DIVISIONS = ['stryker', 'rhino', 'spectre'];

const MemberSchema = new mongoose.Schema(
  {
    pseudo: { type: String, required: true, trim: true },
    competences: { type: [String], default: [] },
    commentaire: { type: String, default: '' },
    vaisseaux: { type: [String], default: [] },
    divisionActuelle: { type: String, enum: [...DIVISIONS, null], default: null },
    divisionSouhaitee: { type: String, enum: [...DIVISIONS, null], default: null },
  },
  { timestamps: true }
);

export const DIVISION_SLUGS = DIVISIONS;
export default mongoose.models.Member || mongoose.model('Member', MemberSchema);
