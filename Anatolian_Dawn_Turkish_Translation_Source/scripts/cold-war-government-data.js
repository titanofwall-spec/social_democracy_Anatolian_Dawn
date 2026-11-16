/* Cold War government lookup — data layer only; integrate into the game's country hover handler. */
(function(root) {
  'use strict';
  const cache = new Map();
  const DATA_URL = 'cold-war-gui-data/data/cold_war_governments_1972_1981.json';
  async function load(url = DATA_URL) {
    if (!cache.has(url)) {
      cache.set(url, fetch(url).then(r => {
        if (!r.ok) throw new Error(`Historical governments load failed: ${r.status} ${url}`);
        return r.json();
      }));
    }
    return cache.get(url);
  }
  function findEntry(data, countryName, countryId) {
    // IDs are not globally unique: Denmark/Greenland, France/French Guiana,
    // and USA/Puerto Rico share IDs. Prefer the exact country name.
    const name = String(countryName || '').trim().toLowerCase();
    if (name) {
      const byName = data.countries.find(c => c.name.toLowerCase() === name);
      if (byName) return byName;
    }
    const id = String(countryId || '').trim().toUpperCase();
    if (!id) return null;
    const matches = data.countries.filter(c => c.id.toUpperCase() === id);
    return matches.length === 1 ? matches[0] : null;
  }
  function recordAt(entry, isoDate) {
    if (!entry || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate || '')) return null;
    return entry.periods.find(p => p.start <= isoDate && isoDate <= p.end) || null;
  }
  function lookup(data, countryName, countryId, isoDate) {
    const entry = findEntry(data, countryName, countryId);
    if (!entry) return null;
    const p = recordAt(entry, isoDate);
    if (!p) return null;
    return {
      name: entry.name, country_id: entry.id, date: isoDate,
      head_of_state: p.head_of_state,
      head_of_government: p.head_of_government,
      government: p.government,
      verification: p.verification,
      missing_research: p.verification === 'unresearched' ||
        !p.head_of_state || !p.head_of_government || !p.government
    };
  }
  // Government ideology colors. Render government party-name text in this color.
  // Political map base colors are NOT modified.
  const IDEOLOGY_COLORS = {
    'marxism-leninism': '#C94444', 'maoism': '#B92C36',
    'democratic socialism': '#CE545B', 'social democracy': '#D56B78',
    'socialism': '#CE545B', 'communism': '#C94444',
    'labor zionism': '#D56B78', 'arab socialism': '#C96B52',
    'liberal conservatism': '#6590C5', 'conservatism': '#6590C5',
    'center right': '#6D93C8', 'centre right': '#6D93C8',
    'center left': '#D47787', 'centre left': '#D47787',
    'liberalism': '#E4B95B', 'social liberalism': '#E4B95B',
    'centrism': '#A7A7B0', 'nationalism': '#A58B5F',
    'authoritarianism': '#9683AA', 'military authoritarianism': '#9683AA',
    'monarchism': '#C4A16C', 'islamism': '#50A789',
    'christian democracy': '#67B0C6', 'independent': '#B3B3B3'
  };
  function ideologyColor(government) {
    const text = String(government || '').toLowerCase();
    const ix = text.lastIndexOf('(');
    const ideology = ix === -1 ? text : text.slice(ix + 1);
    for (const [key, color] of Object.entries(IDEOLOGY_COLORS)) {
      if (ideology.includes(key)) return color;
    }
    return '#D2D2D2';
  }
  root.ColdWarGovernmentData = { load, lookup, ideologyColor, IDEOLOGY_COLORS };
})(typeof window !== 'undefined' ? window : globalThis);
