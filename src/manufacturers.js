export const MANUFACTURERS = [
  { code: 'aegis', label: 'Aegis Dynamics' },
  { code: 'anvil', label: 'Anvil Aerospace' },
  { code: 'aopoa', label: 'Aopoa' },
  { code: 'argo', label: 'Argo Astronautics' },
  { code: 'banu', label: 'Banu' },
  { code: 'consolidated_outland', label: 'Consolidated Outland' },
  { code: 'crusader', label: 'Crusader Industries' },
  { code: 'drake', label: 'Drake Interplanetary' },
  { code: 'esperia', label: 'Esperia' },
  { code: 'gatac', label: 'Gatac Manufacture' },
  { code: 'greys_market', label: "Grey's Market" },
  { code: 'greycat', label: 'Greycat Industrial' },
  { code: 'kruger', label: 'Kruger Intergalactic' },
  { code: 'mirai', label: 'Mirai' },
  { code: 'misc', label: 'MISC' },
  { code: 'origin', label: 'Origin Jumpworks' },
  { code: 'rsi', label: 'Roberts Space Industries' },
  { code: 'tumbril', label: 'Tumbril' },
];

export function manufacturerLabel(code) {
  return MANUFACTURERS.find((m) => m.code === code)?.label || code;
}
