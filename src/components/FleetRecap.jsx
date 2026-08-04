import { DIVISIONS } from '../divisions.js';

export default function FleetRecap({ members, divisions, shipCount }) {
  const sansDivisionCount = members.filter((m) => !m.divisionActuelle).length;

  return (
    <section className="fleet-recap">
      <h2>Recap general</h2>
      <div className="recap-grid">
        {DIVISIONS.map((division) => {
          const divDoc = divisions.find((d) => d.slug === division.slug);
          const count = members.filter((m) => m.divisionActuelle === division.slug).length;
          return (
            <div key={division.slug} className="recap-tile" style={{ '--division-accent': division.accent }}>
              <span className="recap-tile-label">{division.nom}</span>
              <span className="recap-tile-count">{count}</span>
              <span className="recap-tile-sub">membre{count > 1 ? 's' : ''}</span>
              <div className="recap-tile-leads">
                <span>Resp. {divDoc?.responsableMemberId?.pseudo || '—'}</span>
                <span>Second {divDoc?.secondMemberId?.pseudo || '—'}</span>
              </div>
            </div>
          );
        })}

        <div className="recap-tile">
          <span className="recap-tile-label">Fleet (sans division)</span>
          <span className="recap-tile-count">{sansDivisionCount}</span>
          <span className="recap-tile-sub">membre{sansDivisionCount > 1 ? 's' : ''}</span>
        </div>

        <div className="recap-tile">
          <span className="recap-tile-label">Vaisseaux catalogues</span>
          <span className="recap-tile-count">{shipCount}</span>
          <span className="recap-tile-sub">au total</span>
        </div>
      </div>
    </section>
  );
}
