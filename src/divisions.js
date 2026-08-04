export const DIVISIONS = [
  { slug: 'stryker', nom: 'Groupe Stryker', devise: 'Strike fast. Hit hard.', logo: '/logos/stryker.png', accent: '#a7b4c4' },
  { slug: 'rhino', nom: 'Groupe Rhino', devise: 'First in - Last out', logo: '/logos/rhino.png', accent: '#e8b93a' },
  { slug: 'spectre', nom: 'Groupe Spectre', devise: 'Snipe from the dark', logo: '/logos/spectre.png', accent: '#6c8cff' },
];

export function divisionInfo(slug) {
  return DIVISIONS.find((d) => d.slug === slug) || null;
}
