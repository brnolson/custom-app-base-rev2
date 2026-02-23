'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, MousePointer, DollarSign, BarChart2, RefreshCw, Target, Percent, AlertTriangle, Info } from 'lucide-react';

interface GoogleAdsData {
  companyId: string;
  companyName: string;
  customerId: string;
  hasGoogleAds?: boolean;
  dateRange: { startDate: string; endDate: string };
  metrics?: {
    impressions: number;
    clicks: number;
    ctr: number;
    cost: number;
    conversions: number;
    conversionsValue: number;
    averageCpc: number;
  };
  campaigns?: Array<{
    id: string;
    name: string;
    status: string;
    impressions: number;
    clicks: number;
    ctr: number;
    cost: number;
    conversions: number;
    conversionsValue: number;
  }>;
}

interface GoogleAdsMetricsProps {
  dateRange: { start: string; end: string };
}

const PALETTE = ['#60A5FA', '#34D399', '#FBBF24', '#F472B6', '#A78BFA'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color, fontSize: 12, fontWeight: 600, margin: '2px 0' }}>
            {p.name}: {typeof p.value === 'number' && p.name.includes('Cost') ? `$${p.value.toFixed(2)}` : p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 10,
  fontWeight: 600,
  color: '#475569',
  margin: '0 0 14px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

export function GoogleAdsMetrics({ dateRange }: GoogleAdsMetricsProps) {
  const [data, setData] = useState<GoogleAdsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchGoogleAds() {
      setLoading(true);
      setError(null);
      try {
        const token = searchParams.get('token');
        const response = await fetch(`/api/google-ads/metrics?token=${token}&startDate=${dateRange.start}&endDate=${dateRange.end}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch Google Ads data');
        }
        setData(await response.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchGoogleAds();
  }, [searchParams, dateRange]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: 16, height: 16, border: '2px solid #1e293b', borderTop: '2px solid #60A5FA', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
      <span style={{ color: '#64748b', fontSize: 13 }}>Loading Google Ads…</span>
    </div>
  );

  if (data?.hasGoogleAds === false) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      <Info size={16} color="#64748b" />
      <div>
        <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: 13, margin: 0 }}>Google Ads Not Configured</p>
        <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0' }}>Not set up for {data.companyName}</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Inter, sans-serif' }}>
      <AlertTriangle size={15} color="#f43f5e" />
      <span style={{ color: '#f43f5e', fontSize: 13 }}>{error}</span>
    </div>
  );

  if (!data?.metrics) return (
    <p style={{ color: '#64748b', fontSize: 13, fontFamily: 'Inter, sans-serif', margin: 0 }}>No Google Ads data available</p>
  );

  const roas = data.metrics.cost > 0 ? (data.metrics.conversionsValue / data.metrics.cost).toFixed(2) : '0.00';

  const kpis = [
    { label: 'Impressions', value: data.metrics.impressions.toLocaleString(), color: '#60A5FA', Icon: BarChart2 },
    { label: 'Clicks', value: data.metrics.clicks.toLocaleString(), color: '#34D399', Icon: MousePointer },
    { label: 'CTR', value: `${data.metrics.ctr.toFixed(2)}%`, color: '#FBBF24', Icon: Percent },
    { label: 'Total Spend', value: `$${data.metrics.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#F472B6', Icon: DollarSign },
    { label: 'Conversions', value: data.metrics.conversions.toFixed(1), color: '#A78BFA', Icon: Target },
    { label: 'Conv. Value', value: `$${data.metrics.conversionsValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: '#6EE7B7', Icon: TrendingUp },
    { label: 'Avg CPC', value: `$${data.metrics.averageCpc.toFixed(2)}`, color: '#38BDF8', Icon: DollarSign },
    { label: 'ROAS', value: `${roas}x`, color: '#FB7185', Icon: RefreshCw },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #1e293b' }}>
        <TrendingUp size={14} color="#60A5FA" />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>Google Ads</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#475569' }}>ID: {data.customerId}</span>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10, marginBottom: 16 }}>
        {kpis.map(({ label, value, color, Icon }, i) => (
          <div key={i} style={{ background: '#080f1a', borderRadius: 8, padding: '12px 14px', border: `1px solid ${color}20` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
              <Icon size={12} color={color} strokeWidth={2} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Campaign Chart */}
      {data.campaigns && data.campaigns.length > 0 && (
        <div>
          <p style={sectionTitle}>Campaign Breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.campaigns} margin={{ bottom: 50 }} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'Inter' }} angle={-25} textAnchor="end" height={70} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="impressions" name="Impressions" radius={[3, 3, 0, 0]}>
                {data.campaigns.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}