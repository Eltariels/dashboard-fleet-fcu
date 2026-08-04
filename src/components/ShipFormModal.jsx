import { useState } from 'react';
import { MANUFACTURERS } from '../manufacturers.js';
import { resizeImageToDataUrl } from '../utils/resizeImage.js';

export default function ShipFormModal({ ship, onSave, onClose }) {
  const [manufacturer, setManufacturer] = useState(ship?.manufacturer || MANUFACTURERS[0].code);
  const [nom, setNom] = useState(ship?.nom || '');
  const [image, setImage] = useState(ship?.image || null);
  const [description, setDescription] = useState(ship?.description || '');
  const [styleCombat, setStyleCombat] = useState(ship?.styleCombat || '');
  const [equipage, setEquipage] = useState(ship?.equipage || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessingImage(true);
    setError('');
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setImage(dataUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingImage(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nom.trim()) {
      setError('Le nom est requis');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSave({
        manufacturer,
        nom: nom.trim(),
        image,
        description: description.trim(),
        styleCombat: styleCombat.trim(),
        equipage: equipage.trim(),
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{ship ? 'Modifier le vaisseau' : 'Ajouter un vaisseau'}</h2>

        <div className="form-row">
          <label>
            Marque
            <select value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}>
              {MANUFACTURERS.map((m) => (
                <option key={m.code} value={m.code}>{m.label}</option>
              ))}
            </select>
          </label>

          <label>
            Nom
            <input value={nom} onChange={(e) => setNom(e.target.value)} autoFocus required placeholder="Idris-P" />
          </label>
        </div>

        <label>
          Image
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>
        {processingImage && <p className="logs-subtitle">Traitement de l'image...</p>}
        {image && (
          <div className="ship-image-preview">
            <img src={image} alt="apercu" />
            <button type="button" onClick={() => setImage(null)}>Retirer l'image</button>
          </div>
        )}

        <label>
          Style de combat
          <input value={styleCombat} onChange={(e) => setStyleCombat(e.target.value)} placeholder="Fregate de combat, porte-chasseurs..." />
        </label>

        <label>
          Equipage
          <input value={equipage} onChange={(e) => setEquipage(e.target.value)} placeholder="10 (jusqu'a 14)" />
        </label>

        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>Annuler</button>
          <button type="submit" disabled={submitting || processingImage}>{submitting ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </form>
    </div>
  );
}
