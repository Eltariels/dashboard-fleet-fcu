import { useState } from 'react';
import { BRANCH_ROLES } from '../roles.js';
import { api } from '../api/client.js';

export default function RoleColorsPanel({ roleColors, onSaved }) {
  const [colors, setColors] = useState(roleColors);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function handleChange(code, value) {
    setColors((prev) => ({ ...prev, [code]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const updated = await api.put('/settings', { roleColors: colors });
      onSaved(updated.roleColors);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="leadership-panel">
      <h2>Couleurs des roles</h2>
      <div className="role-colors-grid">
        {BRANCH_ROLES.map((r) => (
          <div key={r.code} className="role-color-row">
            <input
              type="color"
              value={colors[r.code]}
              onChange={(e) => handleChange(r.code, e.target.value)}
            />
            <span className="role-color-preview" style={{ color: colors[r.code] }}>
              {r.label}
            </span>
          </div>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="role-colors-actions">
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        {saved && <span className="form-success">Enregistre.</span>}
      </div>
    </section>
  );
}
