import { divisionInfo } from '../divisions.js';
import { highestRole, roleLabel, DEFAULT_ROLE_COLORS } from '../roles.js';

export default function MemberCard({ member, canManage, onEdit, onDelete, roleColors = DEFAULT_ROLE_COLORS }) {
  const souhaitee = divisionInfo(member.divisionSouhaitee);
  const topRole = highestRole(member.roles);
  const pseudoColor = topRole ? roleColors[topRole.code] : null;

  return (
    <div className="member-card">
      <div className="member-card-header">
        <h3 style={pseudoColor ? { color: pseudoColor, textShadow: `0 0 12px ${pseudoColor}55` } : undefined}>
          {member.pseudo}
        </h3>
        {canManage && (
          <div className="member-card-actions">
            <button onClick={() => onEdit(member)} title="Modifier">✎</button>
            <button onClick={() => onDelete(member)} title="Supprimer" className="danger">✕</button>
          </div>
        )}
      </div>

      {member.roles?.length > 0 && (
        <div className="tag-row">
          {member.roles.map((r) => (
            <span key={r} className="tag tag-role" style={{ borderColor: roleColors[r], color: roleColors[r] }}>
              {roleLabel(r)}
            </span>
          ))}
        </div>
      )}

      {member.competences?.length > 0 && (
        <div className="tag-row">
          {member.competences.map((c) => (
            <span key={c} className="tag">{c}</span>
          ))}
        </div>
      )}

      {member.vaisseaux?.length > 0 && (
        <div className="member-field">
          <span className="member-field-label">Vaisseaux</span>
          <div className="tag-row">
            {member.vaisseaux.map((v) => (
              <span key={v} className="tag tag-ship">{v}</span>
            ))}
          </div>
        </div>
      )}

      {member.commentaire && (
        <div className="member-field">
          <span className="member-field-label">Commentaire</span>
          <p className="member-comment">{member.commentaire}</p>
        </div>
      )}

      {souhaitee && (
        <div className="member-field">
          <span className="member-field-label">Division souhaitee</span>
          <span className="tag" style={{ borderColor: souhaitee.accent }}>{souhaitee.nom}</span>
        </div>
      )}
    </div>
  );
}
