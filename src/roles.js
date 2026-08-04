export const BRANCH_ROLES = [
  { code: 'chef_groupe', label: 'Chef de groupe', order: 1 },
  { code: 'chef_division', label: 'Chef de division', order: 2 },
  { code: 'officier', label: 'Officier', order: 3 },
];

export const DEFAULT_ROLE_COLORS = {
  chef_groupe: '#ff9c9c',
  chef_division: '#e04b4b',
  officier: '#7a0e0e',
};

export function highestRole(roles) {
  if (!roles || roles.length === 0) return null;
  const held = BRANCH_ROLES.filter((r) => roles.includes(r.code));
  if (held.length === 0) return null;
  return held.reduce((a, b) => (b.order > a.order ? b : a));
}

export function roleLabel(code) {
  return BRANCH_ROLES.find((r) => r.code === code)?.label || code;
}
