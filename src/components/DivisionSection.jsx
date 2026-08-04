import { useState } from 'react';
import MemberCard from './MemberCard.jsx';

function LogoBadge({ division }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="logo-fallback" style={{ background: division.accent }}>
        {division.nom.replace('Groupe ', '').slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={division.logo}
      alt={division.nom}
      className="division-logo"
      onError={() => setFailed(true)}
    />
  );
}

export default function DivisionSection({ division, members, responsable, second, canManage, onEdit, onDelete }) {
  return (
    <section className="division-section" style={{ '--division-accent': division?.accent || '#666' }}>
      <div className="division-header">
        {division && <LogoBadge division={division} />}
        <div>
          <h2>{division ? division.nom : 'Fleet (sans division)'}</h2>
          {division?.devise && <p className="division-devise">{division.devise}</p>}
          {division && (
            <p className="division-leads">
              <span>Responsable : {responsable?.pseudo || '—'}</span>
              <span>Second : {second?.pseudo || '—'}</span>
            </p>
          )}
        </div>
        <span className="division-count">{members.length} membre{members.length > 1 ? 's' : ''}</span>
      </div>

      {members.length === 0 ? (
        <p className="empty-state">Aucun membre pour l'instant.</p>
      ) : (
        <div className="member-grid">
          {members.map((m) => (
            <MemberCard key={m._id} member={m} canManage={canManage} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}
