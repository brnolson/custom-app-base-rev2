'use client';

import { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

const C = {
  bg:       '#f5ead8',
  surface:  '#ede0c8',
  border:   '#d4b896',
  text:     '#2e1f0e',
  dim:      '#8a7055',
  brown:    '#6b4226',
  brownMid: '#8b5a2b',
  tan:      '#c8a97a',
  gold:     '#b5832a',
  rust:     '#9b4a20',
  cream:    '#fdf6ec',
  oceanBg:  '#e8d8be',
};

// Country name → ISO Alpha-3 code for matching geography features
const COUNTRY_ISO: Record<string, string> = {
  'United States': 'USA', 'United Kingdom': 'GBR', 'Canada': 'CAN',
  'Australia': 'AUS', 'Germany': 'DEU', 'France': 'FRA', 'India': 'IND',
  'Brazil': 'BRA', 'Japan': 'JPN', 'Mexico': 'MEX', 'Netherlands': 'NLD',
  'Italy': 'ITA', 'Spain': 'ESP', 'South Korea': 'KOR', 'Sweden': 'SWE',
  'Norway': 'NOR', 'Denmark': 'DNK', 'Poland': 'POL', 'Ireland': 'IRL',
  'Singapore': 'SGP', 'New Zealand': 'NZL', 'Switzerland': 'CHE',
  'Portugal': 'PRT', 'Belgium': 'BEL', 'Argentina': 'ARG',
  'South Africa': 'ZAF', 'Nigeria': 'NGA', 'Kenya': 'KEN', 'China': 'CHN',
  'Indonesia': 'IDN', 'Philippines': 'PHL', 'Russia': 'RUS', 'Turkey': 'TUR',
  'Saudi Arabia': 'SAU', 'United Arab Emirates': 'ARE', 'Egypt': 'EGY',
  'Colombia': 'COL', 'Chile': 'CHL', 'Vietnam': 'VNM', 'Thailand': 'THA',
  'Malaysia': 'MYS', 'Pakistan': 'PAK', 'Austria': 'AUT', 'Greece': 'GRC',
  'Czech Republic': 'CZE', 'Romania': 'ROU', 'Finland': 'FIN', 'Israel': 'ISR',
};

export interface CountryData { country: string; users: number; }

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export function WorldHeatmap({ countries }: { countries: CountryData[] }) {
  const [hovered, setHovered] = useState<CountryData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isoToData, setIsoToData] = useState<Map<string, CountryData>>(new Map());

  const maxUsers = Math.max(...countries.map(c => c.users), 1);
  const ranked = [...countries].sort((a, b) => b.users - a.users);

  useEffect(() => {
    const map = new Map<string, CountryData>();
    countries.forEach(c => {
      const iso = COUNTRY_ISO[c.country];
      if (iso) map.set(iso, c);
    });
    setIsoToData(map);
  }, [countries]);

  // Interpolate between base cream and deep brown based on user count
  function getFillColor(users: number): string {
    const ratio = Math.sqrt(users / maxUsers);
    if (ratio > 0.8)  return C.brown;
    if (ratio > 0.55) return C.brownMid;
    if (ratio > 0.3)  return C.tan;
    if (ratio > 0.1)  return '#d4b896';
    return '#cbb388';
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Map container */}
      <div
        style={{ position: 'relative', background: C.oceanBg, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}` }}
        onMouseMove={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onMouseLeave={() => setHovered(null)}
      >
        <ComposableMap
          projectionConfig={{ scale: 145, center: [0, 10] }}
          style={{ width: '100%', height: 'auto' }}
          height={420}
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map(geo => {
                  const iso3 = geo.id ? String(geo.id).padStart(3, '0') : '';
                  // Find by numeric ISO code
                  const match = Array.from(isoToData.entries()).find(([isoAlpha3]) => {
                    // react-simple-maps uses numeric codes in world-atlas
                    // We match by name property
                    return geo.properties?.name && isoAlpha3 === COUNTRY_ISO[
                      Object.keys(COUNTRY_ISO).find(k => COUNTRY_ISO[k] === isoAlpha3) || ''
                    ];
                  });

                  // Match by properties.name
                  const countryName = geo.properties?.name as string | undefined;
                  const dataEntry = countries.find(c => {
                    const mapped = COUNTRY_ISO[c.country];
                    // Also try direct name match
                    return countryName === c.country ||
                      countryName === (c.country === 'United States' ? 'United States of America' : c.country) ||
                      countryName === (c.country === 'South Korea' ? 'Korea, Republic of' : c.country);
                  });

                  const isHovered = hovered && dataEntry?.country === hovered.country;
                  const fill = dataEntry ? getFillColor(dataEntry.users) : C.surface;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => dataEntry && setHovered(dataEntry)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        default: {
                          fill,
                          stroke: C.border,
                          strokeWidth: 0.4,
                          outline: 'none',
                          transition: 'fill 0.2s',
                        },
                        hover: {
                          fill: dataEntry ? C.rust : '#c5a87a',
                          stroke: C.border,
                          strokeWidth: 0.5,
                          outline: 'none',
                          cursor: dataEntry ? 'pointer' : 'default',
                        },
                        pressed: { outline: 'none' },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Tooltip */}
        {hovered && (
          <div style={{
            position: 'absolute',
            top: tooltipPos.y + 12,
            left: Math.min(tooltipPos.x + 12, 680),
            background: C.cream,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '8px 14px',
            pointerEvents: 'none',
            zIndex: 10,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}>
            <p style={{ color: C.text, fontWeight: 700, fontSize: 13, margin: 0 }}>{hovered.country}</p>
            <p style={{ color: C.gold, fontSize: 12, margin: '3px 0 0', fontWeight: 600 }}>
              {hovered.users.toLocaleString()} users
            </p>
          </div>
        )}
      </div>

      {/* Legend + ranked list */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 12 }}>

        {/* Color scale */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, color: C.dim, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Intensity</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {['#cbb388', '#d4b896', C.tan, C.brownMid, C.brown].map((col, i) => (
              <div key={i} style={{ width: 24, height: 10, background: col, borderRadius: i === 0 ? '4px 0 0 4px' : i === 4 ? '0 4px 4px 0' : 0 }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: 120 }}>
            <span style={{ fontSize: 10, color: C.dim }}>Low</span>
            <span style={{ fontSize: 10, color: C.dim }}>High</span>
          </div>
        </div>

        {/* Top ranked */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ranked.slice(0, 5).map((c, i) => (
            <div key={c.country}
              onMouseEnter={() => setHovered(c)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: hovered?.country === c.country ? C.surface : C.bg,
                border: `1px solid ${C.border}`, borderRadius: 8,
                padding: '6px 12px', cursor: 'default', transition: 'background 0.15s',
              }}>
              <span style={{ fontSize: 10, color: C.dim, fontWeight: 700 }}>#{i + 1}</span>
              <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{c.country}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: i === 0 ? C.gold : C.brownMid }}>
                {c.users.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}