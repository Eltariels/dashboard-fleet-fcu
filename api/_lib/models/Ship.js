import mongoose from 'mongoose';

const MANUFACTURER_CODES = [
  'aegis', 'anvil', 'aopoa', 'argo', 'banu', 'consolidated_outland',
  'crusader', 'drake', 'esperia', 'gatac', 'greys_market', 'greycat',
  'kruger', 'mirai', 'misc', 'origin', 'rsi', 'tumbril',
];

const ShipSchema = new mongoose.Schema(
  {
    manufacturer: { type: String, enum: MANUFACTURER_CODES, required: true },
    nom: { type: String, required: true, trim: true },
    image: { type: String, default: null }, // data URI (base64), redimensionnee cote client
    description: { type: String, default: '' },
    styleCombat: { type: String, default: '' },
    equipage: { type: String, default: '' },
  },
  { timestamps: true }
);

export const MANUFACTURER_SLUGS = MANUFACTURER_CODES;
export default mongoose.models.Ship || mongoose.model('Ship', ShipSchema);
