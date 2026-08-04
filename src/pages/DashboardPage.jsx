import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { DIVISIONS } from '../divisions.js';
import DivisionSection from '../components/DivisionSection.jsx';

export default function DashboardPage() {
  const [members, setMembers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/members'), api.get('/divisions')])
      .then(([m, d]) => {
        setMembers(m);
        setDivisions(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Chargement...</div>;
  if (error) return <p className="form-error">{error}</p>;

  const sansDivision = members.filter((m) => !m.divisionActuelle);

  return (
    <div className="dashboard-page">
      <h1>Dashboard Fleet</h1>

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
    </div>
  );
}
