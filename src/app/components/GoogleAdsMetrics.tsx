'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, MousePointer, DollarSign, BarChart2, RefreshCw, Target, Percent, AlertTriangle, Info } from 'lucide-react';

const C = {
  bg: '#faf4ea', surface: '#f2e8d5', raised: '#ede0c4', border: '#d9c9ad',
  muted: '#c8b490', text: '#2c1a0e', dim: '#8a7055', cream: '#fdf6ec',
  tan: '#b8935a', gold: '#a07030', rust: '#9b4a20', sage: '#6a8f6a', sky: '#5a8fa8',
};
const PALETTE = [C.cream, C.tan, C.gold, C.rust, C.sage, C.sky, '#b8936a', '#a07850'];

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.raised, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontFamily: 'Inter, sans-serif' }}>
      <p style={{ color: C.dim, fontSize: 11, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: 12, fontWeight: 600, margin: '2px 0' }}>{p.name}: {p.value?.toLocaleString()}</p>
      ))}
    </div>
  );
};

interface GoogleAdsData {
  companyId: string; companyName: string; customerId: string; hasGoogleAds?: boolean;
  dateRange: { startDate: string; endDate: string };
  metrics?: { impressions: number; clicks: number; ctr: number; cost: number; conversions: number; conversionsValue: number; averageCpc: number; };
  campaigns?: Array<{ id: string; name: string; status: string; impressions: number; clicks: number; ctr: number; cost: number; conversions: number; conversionsValue: number; }>;
}

export function GoogleAdsMetrics({ token, dateRange }: { token: string; dateRange: { start: string; end: string } }) {
  const [data, setData] = useState<GoogleAdsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function go() {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`/api/google-ads/metrics?token=${token}&startDate=${dateRange.start}&endDate=${dateRange.end}`);
        if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
        setData(await res.json());
      } catch (err: any) { setError(err.message); }
      finally { setLoading(false); }
    }
    go();
  }, [token, dateRange]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: 16, height: 16, border: `2px solid ${C.muted}`, borderTop: `2px solid ${C.sky}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
      <span style={{ color: C.dim, fontSize: 13 }}>Loading Google Ads…</span>
    </div>
  );

  if (data?.hasGoogleAds === false) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Inter, sans-serif' }}>
      <Info size={15} color={C.dim} />
      <div>
        <p style={{ color: C.text, fontWeight: 600, fontSize: 13, margin: 0 }}>Google Ads Not Configured</p>
        <p style={{ color: C.dim, fontSize: 12, margin: '2px 0 0' }}>Not set up for {data.companyName}</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Inter, sans-serif' }}>
      <AlertTriangle size={15} color={C.rust} />
      <span style={{ color: C.rust, fontSize: 13 }}>{error}</span>
    </div>
  );

  if (!data?.metrics) return <p style={{ color: C.dim, fontSize: 13, fontFamily: 'Inter, sans-serif', margin: 0 }}>No Google Ads data available</p>;

  const roas = data.metrics.cost > 0 ? (data.metrics.conversionsValue / data.metrics.cost).toFixed(2) : '0.00';

  const kpis = [
    { label: 'Impressions', value: data.metrics.impressions.toLocaleString(), color: C.sky,   Icon: BarChart2 },
    { label: 'Clicks',      value: data.metrics.clicks.toLocaleString(),      color: C.cream, Icon: MousePointer },
    { label: 'CTR',         value: `${data.metrics.ctr.toFixed(2)}%`,         color: C.gold,  Icon: Percent },
    { label: 'Total Spend', value: `$${data.metrics.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: C.rust, Icon: DollarSign },
    { label: 'Conversions', value: data.metrics.conversions.toFixed(1),       color: C.tan,   Icon: Target },
    { label: 'Conv. Value', value: `$${data.metrics.conversionsValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: C.sage, Icon: TrendingUp },
    { label: 'Avg CPC',     value: `$${data.metrics.averageCpc.toFixed(2)}`,  color: C.tan,   Icon: DollarSign },
    { label: 'ROAS',        value: `${roas}x`,                                 color: C.cream, Icon: RefreshCw },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22, paddingBottom: 18, borderBottom: `1px solid ${C.border}` }}>
        <TrendingUp size={14} color={C.sky} />
        <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Google Ads Performance</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: C.dim }}>ID: {data.customerId}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 24 }}>
        {kpis.map(({ label, value, color, Icon }, i) => (
          <div key={i} style={{ background: C.bg, borderRadius: 12, padding: '16px', border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 9, color: C.dim, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</span>
              <Icon size={12} color={color} strokeWidth={2} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</div>
          </div>
        ))}
      </div>

      {data.campaigns && data.campaigns.length > 0 && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 14px' }}>Campaign Breakdown</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={data.campaigns} margin={{ bottom: 55 }} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="name" tick={{ fill: C.dim, fontSize: 10, fontFamily: 'Inter' }} angle={-25} textAnchor="end" height={75} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.dim, fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={42} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="impressions" name="Impressions" radius={[4, 4, 0, 0]}>
                {data.campaigns.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}