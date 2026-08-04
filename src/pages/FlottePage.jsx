import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { DIVISIONS } from '../divisions.js';
import { MANUFACTURERS } from '../manufacturers.js';
import DivisionSection from '../components/DivisionSection.jsx';
import FleetRecap from '../components/FleetRecap.jsx';
import ShipCard from '../components/ShipCard.jsx';
import ShipFormModal from '../components/ShipFormModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function FlottePage() {
  const { user } = useAuth();
  const canManageShips = user.role === 'cadre' || user.role === 'super_admin';

  const [members, setMembers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filter, setFilter] = useState(null);
  const [editingShip, setEditingShip] = useState(undefined);
  const [deletingShip, setDeletingShip] = useState(null);

  async function reloadShips() {
    setShips(await api.get('/ships'));
  }

  useEffect(() => {
    Promise.all([api.get('/members'), api.get('/divisions'), api.get('/ships')])
      .then(([m, d, s]) => {
        setMembers(m);
        setDivisions(d);
        setShips(s);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveShip(payload) {
    if (editingShip) {
      await api.put(`/ships/${editingShip._id}`, payload);
    } else {
      await api.post('/ships', payload);
    }
    setEditingShip(undefined);
    await reloadShips();
  }

  async function handleDeleteShipConfirmed() {
    await api.del(`/ships/${deletingShip._id}`);
    setDeletingShip(null);
    await reloadShips();
  }

  if (loading) return <div className="page-loading">Chargement...</div>;
  if (error) return <p className="form-error">{error}</p>;

  const sansDivision = members.filter((m) => !m.divisionActuelle);
  const visibleShips = filter ? ships.filter((s) => s.manufacturer === filter) : ships;

  return (
    <div className="dashboard-page">
      <h1>Flotte FCU</h1>

      <FleetRecap members={members} divisions={divisions} shipCount={ships.length} />

      {DIVISIONS.map((division) => {
        const divDoc = divisions.find((d) => d.slug === division.slug);
        return (
          <DivisionSection
            key={division.slug}
            division={division}
            members={members.filter((m) => m.divisionActuelle === division.slug)}
            responsable={divDoc?.responsableMemberId}
            second={divDoc?.secondMemberId}
            canManage={false}
          />
        );
      })}

      <DivisionSection division={null} members={sansDivision} canManage={false} />

      <section className="ships-section">
        <div className="admin-page-header">
          <h2 className="section-title">Vaisseaux de la Fleet</h2>
          {canManageShips && <button onClick={() => setEditingShip(null)}>+ Ajouter un vaisseau</button>}
        </div>

        <div className="manufacturer-filter">
          <button className={filter === null ? 'filter-active' : ''} onClick={() => setFilter(null)}>
            Tous les fabricants
          </button>
          {MANUFACTURERS.map((m) => (
            <button
              key={m.code}
              className={filter === m.code ? 'filter-active' : ''}
              onClick={() => setFilter(m.code)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {visibleShips.length === 0 ? (
          <p className="empty-state">Aucun vaisseau pour l'instant.</p>
        ) : (
          <div className="ship-grid">
            {visibleShips.map((ship) => (
              <ShipCard
                key={ship._id}
                ship={ship}
                canManage={canManageShips}
                onEdit={setEditingShip}
                onDelete={setDeletingShip}
              />
            ))}
          </div>
        )}
      </section>

      {editingShip !== undefined && (
        <ShipFormModal ship={editingShip} onSave={handleSaveShip} onClose={() => setEditingShip(undefined)} />
      )}

      {deletingShip && (
        <ConfirmDialog
          title="Retirer ce vaisseau ?"
          message={`${deletingShip.nom} sera definitivement retire du catalogue.`}
          onConfirm={handleDeleteShipConfirmed}
          onCancel={() => setDeletingShip(null)}
        />
      )}
    </div>
  );
}
