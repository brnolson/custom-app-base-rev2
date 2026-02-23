'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Activity, Eye, UserPlus, Clock, TrendingDown, Zap, AlertCircle } from 'lucide-react';
import { GoogleAdsMetrics } from './GoogleAdsMetrics';
import { MetricoolMetrics } from './MetricoolMetrics';

interface GA4Data {
  companyId: string;
  companyName: string;
  dateRange: { startDate: string; endDate: string };
  metrics: {
    activeUsers: number;
    sessions: number;
    pageViews: number;
    avgSessionDuration: number;
    bounceRate: string;
    newUsers: number;
    engagementRate: string;
  };
  timeSeries: Array<{ date: string; activeUsers: number; sessions: number; pageViews: number }>;
  topPages: Array<{ title: string; path: string; views: number }>;
  trafficSources: Array<{ source: string; sessions: number }>;
  devices: Array<{ device: string; users: number }>;
  countries: Array<{ country: string; users: number }>;
}

const PALETTE = ['#6EE7B7', '#60A5FA', '#F472B6', '#FBBF24', '#A78BFA', '#34D399', '#FB7185', '#38BDF8'];

const DATE_RANGES = [
  { label: 'Today', value: { start: 'today', end: 'today' } },
  { label: 'Yesterday', value: { start: 'yesterday', end: 'yesterday' } },
  { label: '7 Days', value: { start: '7daysAgo', end: 'today' } },
  { label: '30 Days', value: { start: '30daysAgo', end: 'today' } },
  { label: '90 Days', value: { start: '90daysAgo', end: 'today' } },
  { label: '6 Months', value: { start: '180daysAgo', end: 'today' } },
  { label: '1 Year', value: { start: '365daysAgo', end: 'today' } },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color, fontSize: 12, fontWeight: 600, margin: '2px 0' }}>
            {p.name}: {p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function GA4Dashboard() {
  const [data, setData] = useState<GA4Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState(3);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      setError(null);
      try {
        const token = searchParams.get('token');
        const range = DATE_RANGES[selectedRange].value;
        const response = await fetch(`/api/ga4/metrics?token=${token}&startDate=${range.start}&endDate=${range.end}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch metrics');
        }
        setData(await response.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, [searchParams, selectedRange]);

  if (loading) return (
    <div style={styles.centered}>
      <div style={styles.spinner} />
      <p style={{ color: '#64748b', marginTop: 14, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Loading analytics…</p>
    </div>
  );

  if (error) return (
    <div style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: 10, margin: 20 }}>
      <AlertCircle size={16} color="#f43f5e" />
      <div>
        <p style={{ color: '#f43f5e', fontWeight: 600, fontSize: 13, margin: 0 }}>Failed to load analytics</p>
        <p style={{ color: '#94a3b8', fontSize: 12, margin: '2px 0 0' }}>{error}</p>
      </div>
    </div>
  );

  if (!data?.metrics) return (
    <div style={{ ...styles.card, textAlign: 'center', margin: 20 }}>
      <p style={{ color: '#64748b', fontSize: 13 }}>No analytics data available</p>
    </div>
  );

  const formatDate = (s: string) => s?.length === 8 ? `${s.substring(4, 6)}/${s.substring(6, 8)}` : s;
  const timeSeriesFormatted = data.timeSeries.map(item => ({ ...item, date: formatDate(item.date) }));
  const totalTraffic = data.trafficSources.reduce((s, r) => s + r.sessions, 0);

  const kpis = [
    { label: 'Active Users', value: data.metrics.activeUsers.toLocaleString(), accent: '#6EE7B7', Icon: Users },
    { label: 'Sessions', value: data.metrics.sessions.toLocaleString(), accent: '#60A5FA', Icon: Activity },
    { label: 'Page Views', value: data.metrics.pageViews.toLocaleString(), accent: '#A78BFA', Icon: Eye },
    { label: 'New Users', value: data.metrics.newUsers.toLocaleString(), accent: '#F472B6', Icon: UserPlus },
    { label: 'Avg Duration', value: `${Math.round(data.metrics.avgSessionDuration)}s`, accent: '#FBBF24', Icon: Clock },
    { label: 'Bounce Rate', value: `${data.metrics.bounceRate}%`, accent: '#FB7185', Icon: TrendingDown },
    { label: 'Engagement', value: `${data.metrics.engagementRate}%`, accent: '#34D399', Icon: Zap },
  ];

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .range-btn:hover { color: #e2e8f0 !important; }
        .metric-card { transition: transform 0.15s; cursor: default; }
        .metric-card:hover { transform: translateY(-1px); }
        .page-row:hover { background: #1e293b !important; }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.badge}>Google Analytics</div>
          <h1 style={styles.companyName}>{data.companyName}</h1>
          <p style={styles.subtitle}>Website performance overview</p>
        </div>
        <div style={styles.rangeGroup}>
          {DATE_RANGES.map((r, i) => (
            <button key={i} className="range-btn" onClick={() => setSelectedRange(i)} style={{
              ...styles.rangeBtn,
              background: selectedRange === i ? '#6EE7B7' : 'transparent',
              color: selectedRange === i ? '#0f172a' : '#64748b',
              fontWeight: selectedRange === i ? 600 : 400,
            }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        {kpis.map(({ label, value, accent, Icon }, i) => (
          <div key={i} className="metric-card" style={{ ...styles.card, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
              <Icon size={13} color={accent} strokeWidth={2} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: accent, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Traffic Over Time */}
      {timeSeriesFormatted.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Traffic Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timeSeriesFormatted}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#64748b', fontSize: 11, fontFamily: 'Inter' }} />
              <Line type="monotone" dataKey="activeUsers" stroke="#6EE7B7" strokeWidth={1.5} dot={false} name="Active Users" />
              <Line type="monotone" dataKey="sessions" stroke="#60A5FA" strokeWidth={1.5} dot={false} name="Sessions" />
              <Line type="monotone" dataKey="pageViews" stroke="#A78BFA" strokeWidth={1.5} dot={false} name="Page Views" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sources + Devices */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {data.trafficSources.length > 0 && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Traffic Sources</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.trafficSources.map((src, i) => {
                const pct = Math.round((src.sessions / totalTraffic) * 100);
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: '#cbd5e1' }}>{src.source}</span>
                      <span style={{ fontSize: 12, color: PALETTE[i % PALETTE.length], fontWeight: 600 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 4, background: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: PALETTE[i % PALETTE.length], borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {data.devices.length > 0 && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Devices</h3>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={data.devices} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="device" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="users" name="Users" radius={[3, 3, 0, 0]}>
                  {data.devices.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Google Ads */}
      <div style={{ ...styles.card, borderColor: '#1d4ed833' }}>
        <GoogleAdsMetrics dateRange={{ start: DATE_RANGES[selectedRange].value.start, end: DATE_RANGES[selectedRange].value.end }} />
      </div>

      {/* Metricool */}
      <div style={{ ...styles.card, borderColor: '#7c3aed33' }}>
        <MetricoolMetrics dateRange={{ start: DATE_RANGES[selectedRange].value.start, end: DATE_RANGES[selectedRange].value.end }} />
      </div>

      {/* Top Pages */}
      {data.topPages.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Top Pages</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr>
                {['#', 'Page', 'Path', 'Views'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Views' ? 'right' : 'left', padding: '6px 10px', fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '1px solid #1e293b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.topPages.map((page, i) => (
                <tr key={i} className="page-row" style={{ borderBottom: '1px solid #0f172a', transition: 'background 0.1s' }}>
                  <td style={{ padding: '9px 10px', color: '#334155', fontSize: 12, width: 32 }}>{i + 1}</td>
                  <td style={{ padding: '9px 10px', color: '#cbd5e1', fontSize: 13 }}>{page.title}</td>
                  <td style={{ padding: '9px 10px', color: '#60A5FA', fontSize: 12, fontFamily: 'monospace' }}>{page.path}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', color: '#6EE7B7', fontWeight: 600, fontSize: 13 }}>{page.views.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Countries */}
      {data.countries.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Top Countries</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginTop: 8 }}>
            {data.countries.map((c, i) => (
              <div key={i} style={{ background: '#080f1a', borderRadius: 8, padding: '12px 14px', border: `1px solid ${PALETTE[i % PALETTE.length]}22` }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{c.country}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: PALETTE[i % PALETTE.length], letterSpacing: '-0.02em' }}>{c.users.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: 'Inter, sans-serif',
    background: '#080f1a',
    minHeight: '100vh',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    color: '#e2e8f0',
    maxWidth: 960,
    margin: '0 auto',
    width: '100%',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  spinner: {
    width: 24,
    height: 24,
    border: '2px solid #1e293b',
    borderTop: '2px solid #6EE7B7',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 14,
    borderBottom: '1px solid #1e293b',
  },
  badge: {
    display: 'inline-block',
    background: '#6EE7B715',
    color: '#6EE7B7',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    padding: '2px 8px',
    borderRadius: 4,
    marginBottom: 6,
    border: '1px solid #6EE7B730',
  },
  companyName: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
    color: '#f1f5f9',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: 12,
    color: '#475569',
    margin: '3px 0 0',
  },
  rangeGroup: {
    display: 'flex',
    gap: 2,
    background: '#0f172a',
    padding: 3,
    borderRadius: 8,
    border: '1px solid #1e293b',
    flexShrink: 0,
  },
  rangeBtn: {
    border: 'none',
    borderRadius: 6,
    padding: '5px 11px',
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 10,
  },
  card: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: 8,
    padding: '16px',
  },
  sectionTitle: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    fontWeight: 600,
    color: '#475569',
    margin: '0 0 14px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },
};