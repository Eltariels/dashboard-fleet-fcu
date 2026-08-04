export const DIVISIONS = [
  { slug: 'stryker', nom: 'Groupe Stryker', devise: 'Strike fast. Hit hard.', logo: '/logos/stryker.png', accent: '#8a8f98' },
  { slug: 'rhino', nom: 'Groupe Rhino', devise: 'First in - Last out', logo: '/logos/rhino.png', accent: '#d4a72c' },
  { slug: 'spectre', nom: 'Groupe Spectre', devise: 'Snipe from the dark', logo: '/logos/spectre.png', accent: '#4f7cff' },
];

export function divisionInfo(slug) {
  return DIVISIONS.find((d) => d.slug === slug) || null;
}
