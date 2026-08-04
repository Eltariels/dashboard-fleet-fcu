import mongoose from 'mongoose';

const DIVISIONS = ['stryker', 'rhino', 'spectre'];
const BRANCH_ROLES = ['chef_groupe', 'chef_division', 'officier'];

const MemberSchema = new mongoose.Schema(
  {
    pseudo: { type: String, required: true, trim: true },
    competences: { type: [String], default: [] },
    commentaire: { type: String, default: '' },
    vaisseaux: { type: [String], default: [] },
    roles: { type: [String], enum: BRANCH_ROLES, default: [] },
    divisionActuelle: { type: String, enum: [...DIVISIONS, null], default: null },
    divisionSouhaitee: { type: String, enum: [...DIVISIONS, null], default: null },
  },
  { timestamps: true }
);

export const DIVISION_SLUGS = DIVISIONS;
export const BRANCH_ROLE_SLUGS = BRANCH_ROLES;
export default mongoose.models.Member || mongoose.model('Member', MemberSchema);
