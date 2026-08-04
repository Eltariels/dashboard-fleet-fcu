import { manufacturerLabel } from '../manufacturers.js';

export default function ShipCard({ ship, canManage, onEdit, onDelete }) {
  return (
    <div className="ship-card">
      <div className="ship-card-image">
        {ship.image ? (
          <img src={ship.image} alt={ship.nom} />
        ) : (
          <div className="ship-card-image-placeholder">{ship.nom.slice(0, 2).toUpperCase()}</div>
        )}
      </div>

      <div className="ship-card-body">
        <div className="ship-card-header">
          <div>
            <span className="ship-manufacturer">{manufacturerLabel(ship.manufacturer)}</span>
            <h3>{ship.nom}</h3>
          </div>
          {canManage && (
            <div className="member-card-actions">
              <button onClick={() => onEdit(ship)} title="Modifier">✎</button>
              <button onClick={() => onDelete(ship)} title="Supprimer" className="danger">✕</button>
            </div>
          )}
        </div>

        {ship.styleCombat && (
          <div className="member-field">
            <span className="member-field-label">Style de combat</span>
            <span className="tag tag-ship">{ship.styleCombat}</span>
          </div>
        )}

        {ship.equipage && (
          <div className="member-field">
            <span className="member-field-label">Equipage</span>
            <p className="member-comment">{ship.equipage}</p>
          </div>
        )}

        {ship.description && (
          <div className="member-field">
            <span className="member-field-label">Description</span>
            <p className="member-comment">{ship.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
