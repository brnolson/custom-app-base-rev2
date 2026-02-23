'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Activity, Eye, UserPlus, Clock, TrendingDown, Zap, AlertCircle, Globe } from 'lucide-react';
import { GoogleAdsMetrics } from './GoogleAdsMetrics';
import { MetricoolMetrics } from './MetricoolMetrics';
import dynamic from 'next/dynamic';
const WorldHeatmap = dynamic(
  () => import('./WorldHeatmap').then(m => m.WorldHeatmap),
  { ssr: false, loading: () => <p style={{ color: '#8a7055', fontSize: 13 }}>Loading map…</p> }
);

interface GA4Data {
  companyId: string;
  companyName: string;
  dateRange: { startDate: string; endDate: string };
  metrics: {
    activeUsers: number; sessions: number; pageViews: number;
    avgSessionDuration: number; bounceRate: string; newUsers: number; engagementRate: string;
  };
  timeSeries: Array<{ date: string; activeUsers: number; sessions: number; pageViews: number }>;
  topPages: Array<{ title: string; path: string; views: number }>;
  trafficSources: Array<{ source: string; sessions: number }>;
  devices: Array<{ device: string; users: number }>;
  countries: Array<{ country: string; users: number }>;
}

// Cream base, brown accents
const C = {
  bg:       '#faf4ea',   // warm cream page background
  surface:  '#f2e8d5',   // card surface
  raised:   '#ede0c4',   // slightly raised / hover
  border:   '#d9c9ad',   // borders
  muted:    '#c8b490',   // muted elements
  text:     '#2c1a0e',   // deep brown text
  dim:      '#8a7055',   // secondary text
  brown:    '#6b4226',   // primary brown accent
  brownMid: '#8b5a2b',   // mid brown
  tan:      '#b8935a',   // warm tan accent
  gold:     '#a07030',   // gold/amber accent
  rust:     '#9b4a20',   // rust for negatives
  sky:      '#5a8fa8',   // cool blue contrast
  sage:     '#6a8f6a',   // sage green contrast
};

const PALETTE = [C.brown, C.tan, C.gold, C.sky, C.sage, C.rust, C.brownMid, '#7a5c3a'];

const DATE_RANGES = [
  { label: 'Today',     value: { start: 'today',      end: 'today' } },
  { label: 'Yesterday', value: { start: 'yesterday',  end: 'yesterday' } },
  { label: '7 Days',   value: { start: '7daysAgo',   end: 'today' } },
  { label: '30 Days',  value: { start: '30daysAgo',  end: 'today' } },
  { label: '90 Days',  value: { start: '90daysAgo',  end: 'today' } },
  { label: '6 Months', value: { start: '180daysAgo', end: 'today' } },
  { label: '1 Year',   value: { start: '365daysAgo', end: 'today' } },
];

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <p style={{ color: C.dim, fontSize: 11, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: 12, fontWeight: 600, margin: '2px 0' }}>
          {p.name}: {p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

function Knob({ value, label, sub, color, pct }: { value: string; label: string; sub: string; color: string; pct: number }) {
  const r = 62, circ = 2 * Math.PI * r, dash = Math.min(pct / 100, 1) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, flex: 1 }}>
      <div style={{ position: 'relative', width: 172, height: 172 }}>
        <svg width={172} height={172} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={86} cy={86} r={r} fill="none" stroke={C.border} strokeWidth={8} />
          <circle cx={86} cy={86} r={r} fill="none" stroke={color} strokeWidth={8}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.7s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <span style={{ fontSize: 30, fontWeight: 700, color: C.text, letterSpacing: '-0.03em', fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>{value}</span>
          <span style={{ fontSize: 10, color, fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: '0.04em' }}>{sub}</span>
        </div>
      </div>
      <span style={{ fontSize: 11, color: C.dim, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{label}</span>
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', ...style }}>
      {children}
    </div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 20px' }}>
      {children}
    </p>
  );
}

export function GA4Dashboard() {
  const [data, setData] = useState<GA4Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState(3);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true); setError(null);
      try {
        const token = searchParams.get('token');
        const range = DATE_RANGES[selectedRange].value;
        const res = await fetch(`/api/ga4/metrics?token=${token}&startDate=${range.start}&endDate=${range.end}`);
        if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to fetch'); }
        setData(await res.json());
      } catch (err: any) { setError(err.message); }
      finally { setLoading(false); }
    }
    fetchMetrics();
  }, [searchParams, selectedRange]);

  const page: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    background: C.bg,
    minHeight: '100vh',
    width: '100%',
    color: C.text,
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    overflowY: 'auto',
  };

  if (loading) return (
    <div style={{ ...page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.brown}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <p style={{ color: C.dim, marginTop: 14, fontSize: 13 }}>Loading analytics…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ ...page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <AlertCircle size={16} color={C.rust} />
        <div>
          <p style={{ color: C.rust, fontWeight: 600, fontSize: 13, margin: 0 }}>Failed to load analytics</p>
          <p style={{ color: C.dim, fontSize: 12, margin: '3px 0 0' }}>{error}</p>
        </div>
      </div>
    </div>
  );

  if (!data?.metrics) return (
    <div style={{ ...page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: C.dim, fontSize: 13 }}>No analytics data available</p>
    </div>
  );

  const fmt = (s: string) => s?.length === 8 ? `${s.substring(4, 6)}/${s.substring(6, 8)}` : s;
  const ts = data.timeSeries.map(d => ({ ...d, date: fmt(d.date) }));
  const totalTraffic = data.trafficSources.reduce((s, r) => s + r.sessions, 0);
  const engRate = parseFloat(data.metrics.engagementRate);
  const bounce  = parseFloat(data.metrics.bounceRate);
  const newPct  = data.metrics.sessions > 0 ? Math.round((data.metrics.newUsers / data.metrics.sessions) * 100) : 0;

  const kpis = [
    { label: 'Active Users', value: data.metrics.activeUsers.toLocaleString(), Icon: Users },
    { label: 'Sessions',     value: data.metrics.sessions.toLocaleString(),    Icon: Activity },
    { label: 'Page Views',   value: data.metrics.pageViews.toLocaleString(),   Icon: Eye },
    { label: 'New Users',    value: data.metrics.newUsers.toLocaleString(),    Icon: UserPlus },
    { label: 'Avg Duration', value: `${Math.round(data.metrics.avgSessionDuration)}s`, Icon: Clock },
    { label: 'Bounce Rate',  value: `${data.metrics.bounceRate}%`,             Icon: TrendingDown },
    { label: 'Engagement',   value: `${data.metrics.engagementRate}%`,         Icon: Zap },
  ];

  return (
    <div style={page}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .rb:hover { background: ${C.raised} !important; color: ${C.text} !important; }
        .kc { transition: transform 0.15s, box-shadow 0.15s; }
        .kc:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1) !important; }
        .pr:hover { background: ${C.raised} !important; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.muted}; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 28px 56px' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${C.brown}15`, border: `1px solid ${C.brown}30`, borderRadius: 5, padding: '3px 10px', marginBottom: 12 }}>
              <Globe size={10} color={C.brown} />
              <span style={{ fontSize: 10, fontWeight: 700, color: C.brown, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Google Analytics</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>{data.companyName}</h1>
            <p style={{ fontSize: 13, color: C.dim, marginTop: 6 }}>Website performance overview</p>
          </div>
          <div style={{ display: 'flex', gap: 2, background: C.surface, padding: 4, borderRadius: 10, border: `1px solid ${C.border}` }}>
            {DATE_RANGES.map((r, i) => (
              <button key={i} className="rb" onClick={() => setSelectedRange(i)} style={{
                border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                background: selectedRange === i ? C.brown : 'transparent',
                color: selectedRange === i ? '#fdf6ec' : C.dim,
                fontWeight: selectedRange === i ? 700 : 400,
              }}>{r.label}</button>
            ))}
          </div>
        </div>

        {/* HERO KNOBS */}
        <Card style={{ marginBottom: 16 }}>
          <SLabel>Key Highlights</SLabel>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 24, flexWrap: 'wrap', padding: '8px 0' }}>
            <Knob value={`${engRate.toFixed(0)}%`} label="Engagement Rate" sub="of sessions" color={C.brown} pct={engRate} />
            <div style={{ width: 1, height: 130, background: C.border }} />
            <Knob value={data.metrics.activeUsers.toLocaleString()} label="Active Users" sub={`${newPct}% new`} color={C.gold} pct={Math.min((data.metrics.activeUsers / Math.max(data.metrics.sessions, 1)) * 100, 100)} />
            <div style={{ width: 1, height: 130, background: C.border }} />
            <Knob value={`${bounce.toFixed(0)}%`} label="Bounce Rate" sub="leaving early" color={C.rust} pct={bounce} />
          </div>
        </Card>

        {/* KPI STRIP */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginBottom: 16 }}>
          {kpis.map(({ label, value, Icon }, i) => (
            <div key={i} className="kc" style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: '18px 14px', cursor: 'default', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 9, color: C.dim, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</span>
                <Icon size={13} color={PALETTE[i % PALETTE.length]} strokeWidth={2} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: PALETTE[i % PALETTE.length], letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* TRAFFIC CHART */}
        {ts.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <SLabel>Traffic Over Time</SLabel>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={ts}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="date" tick={{ fill: C.dim, fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.dim, fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={42} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ color: C.dim, fontSize: 11, fontFamily: 'Inter', paddingTop: 14 }} />
                <Line type="monotone" dataKey="activeUsers" stroke={C.brown}  strokeWidth={2} dot={false} name="Active Users" />
                <Line type="monotone" dataKey="sessions"    stroke={C.gold}   strokeWidth={2} dot={false} name="Sessions" />
                <Line type="monotone" dataKey="pageViews"   stroke={C.sky}    strokeWidth={2} dot={false} name="Page Views" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* SOURCES + DEVICES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {data.trafficSources.length > 0 && (
            <Card>
              <SLabel>Traffic Sources</SLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {data.trafficSources.map((src, i) => {
                  const pct = Math.round((src.sessions / totalTraffic) * 100);
                  const col = PALETTE[i % PALETTE.length];
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                        <span style={{ fontSize: 13, color: C.text }}>{src.source}</span>
                        <span style={{ fontSize: 13, color: col, fontWeight: 600 }}>{pct}%</span>
                      </div>
                      <div style={{ height: 5, background: C.raised, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 3, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
          {data.devices.length > 0 && (
            <Card>
              <SLabel>Devices</SLabel>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.devices} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="device" tick={{ fill: C.dim, fontSize: 12, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.dim, fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={42} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="users" name="Users" radius={[4, 4, 0, 0]}>
                    {data.devices.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        {/* GOOGLE ADS */}
        <Card style={{ marginBottom: 16, borderColor: `${C.sky}60` }}>
          <GoogleAdsMetrics dateRange={{ start: DATE_RANGES[selectedRange].value.start, end: DATE_RANGES[selectedRange].value.end }} />
        </Card>

        {/* METRICOOL */}
        <Card style={{ marginBottom: 16, borderColor: `${C.tan}80` }}>
          <MetricoolMetrics dateRange={{ start: DATE_RANGES[selectedRange].value.start, end: DATE_RANGES[selectedRange].value.end }} />
        </Card>

        {/* TOP PAGES */}
        {data.topPages.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <SLabel>Top Pages</SLabel>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#', 'Page Title', 'Path', 'Views'].map(h => (
                    <th key={h} style={{ textAlign: h === 'Views' ? 'right' : 'left', padding: '0 14px 14px', fontSize: 10, color: C.dim, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.topPages.map((page, i) => (
                  <tr key={i} className="pr" style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.1s' }}>
                    <td style={{ padding: '14px', color: C.muted, fontSize: 12, width: 36 }}>{i + 1}</td>
                    <td style={{ padding: '14px', color: C.text, fontSize: 14 }}>{page.title}</td>
                    <td style={{ padding: '14px', color: C.sky, fontSize: 12, fontFamily: 'monospace' }}>{page.path}</td>
                    <td style={{ padding: '14px', textAlign: 'right', color: C.brown, fontWeight: 600, fontSize: 14 }}>{page.views.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* WORLD HEATMAP */}
        {data.countries.length > 0 && (
          <Card>
            <SLabel>Global Audience</SLabel>
            <WorldHeatmap countries={data.countries} />
          </Card>
        )}

      </div>
    </div>
  );
}