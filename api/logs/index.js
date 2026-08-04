import { connectDB } from '../_lib/db.js';
import Log from '../_lib/models/Log.js';
import { requireRole } from '../_lib/auth.js';

const PAGE_SIZE = 100;

export default requireRole(['cadre', 'super_admin'], async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Methode non autorisee' });
    return;
  }

  await connectDB();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const logs = await Log.find({})
    .sort({ createdAt: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE);
  const total = await Log.countDocuments({});

  res.status(200).json({ logs, total, page, pageSize: PAGE_SIZE });
});
