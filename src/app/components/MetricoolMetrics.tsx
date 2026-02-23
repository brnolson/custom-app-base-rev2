'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { Users, Eye, Heart, MessageCircle, Share2, AlertTriangle, Instagram, Linkedin, Twitter } from 'lucide-react';

const C = {
  bg: '#faf4ea', surface: '#f2e8d5', raised: '#ede0c4', border: '#d9c9ad',
  muted: '#c8b490', text: '#2c1a0e', dim: '#8a7055', cream: '#fdf6ec',
  tan: '#b8935a', gold: '#a07030', rust: '#9b4a20', sage: '#6a8f6a', sky: '#5a8fa8',
};

const NET_COLORS: Record<string, string> = {
  instagram: C.rust, facebook: C.sky, twitter: C.tan, linkedin: C.sage, tiktok: C.cream,
};

const NetIcon = ({ network, size = 12, color }: { network: string; size?: number; color: string }) => {
  if (network === 'instagram') return <Instagram size={size} color={color} strokeWidth={2} />;
  if (network === 'twitter')   return <Twitter   size={size} color={color} strokeWidth={2} />;
  if (network === 'linkedin')  return <Linkedin  size={size} color={color} strokeWidth={2} />;
  return <Share2 size={size} color={color} strokeWidth={2} />;
};

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

interface MetricoolData {
  companyId: string; companyName: string; blogId: string;
  dateRange: { startDate: string; endDate: string };
  profile: any; stats: any; posts: any[];
}

export function MetricoolMetrics({ dateRange }: { dateRange: { start: string; end: string } }) {
  const [data, setData] = useState<MetricoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function go() {
      setLoading(true); setError(null);
      try {
        const token = searchParams.get('token');
        const res = await fetch(`/api/metricool/metrics?token=${token}&startDate=${dateRange.start}&endDate=${dateRange.end}`);
        if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
        setData(await res.json());
      } catch (err: any) { setError(err.message); }
      finally { setLoading(false); }
    }
    go();
  }, [searchParams, dateRange]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: 16, height: 16, border: `2px solid ${C.muted}`, borderTop: `2px solid ${C.tan}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
      <span style={{ color: C.dim, fontSize: 13 }}>Loading social data…</span>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Inter, sans-serif' }}>
      <AlertTriangle size={15} color={C.rust} />
      <span style={{ color: C.rust, fontSize: 13 }}>{error}</span>
    </div>
  );

  if (!data) return <p style={{ color: C.dim, fontSize: 13, fontFamily: 'Inter, sans-serif', margin: 0 }}>No social data available</p>;

  const stats = data.stats || {};
  const posts = data.posts || [];
  const followers   = stats.followers   || {};
  const impressions = stats.impressions || {};
  const engagements = stats.engagements || {};
  const networks    = Object.keys(followers).length > 0 ? Object.keys(followers) : (data.profile?.networks || []);

  const totalFollowers   = networks.reduce((s: number, n: string) => s + (followers[n]   || 0), 0) || stats.totalFollowers   || 0;
  const totalImpressions = networks.reduce((s: number, n: string) => s + (impressions[n] || 0), 0) || stats.totalImpressions || 0;
  const totalEngagements = networks.reduce((s: number, n: string) => s + (engagements[n] || 0), 0) || stats.totalEngagements || 0;
  const engRate          = typeof stats.engagementRate === 'number' ? stats.engagementRate : 0;

  const chartData = networks.map((n: string) => ({
    name: n.charAt(0).toUpperCase() + n.slice(1),
    Followers: followers[n] || 0,
  }));

  const topKpis = [
    { label: 'Followers',   value: totalFollowers.toLocaleString(),   color: C.tan,  Icon: Users },
    { label: 'Impressions', value: totalImpressions.toLocaleString(), color: C.rust, Icon: Eye },
    { label: 'Engagements', value: totalEngagements.toLocaleString(), color: C.cream,Icon: Heart },
    { label: 'Eng. Rate',   value: `${engRate.toFixed(2)}%`,          color: C.gold, Icon: Share2 },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22, paddingBottom: 18, borderBottom: `1px solid ${C.border}` }}>
        <Share2 size={14} color={C.tan} />
        <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Social Media Performance</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: C.dim }}>{data.companyName}</span>
      </div>

      {/* Top KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {topKpis.map(({ label, value, color, Icon }, i) => (
          <div key={i} style={{ background: C.bg, borderRadius: 12, padding: '16px', border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 9, color: C.dim, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</span>
              <Icon size={12} color={color} strokeWidth={2} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Per-network cards */}
      {networks.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 24 }}>
          {networks.map((net: string) => {
            const color = NET_COLORS[net] || C.dim;
            return (
              <div key={net} style={{ background: C.bg, borderRadius: 12, padding: '16px 18px', border: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                  <NetIcon network={net} size={13} color={color} />
                  <span style={{ fontSize: 12, color, fontWeight: 600, textTransform: 'capitalize' }}>{net}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {([['Followers', followers[net]], ['Impressions', impressions[net]], ['Engagements', engagements[net]]] as [string, number | undefined][]).map(([lbl, val]) =>
                    val !== undefined ? (
                      <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: C.dim }}>{lbl}</span>
                        <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{val.toLocaleString()}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 14px' }}>Followers by Network</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="name" tick={{ fill: C.dim, fontSize: 12, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.dim, fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={42} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="Followers" radius={[4, 4, 0, 0]}>
                {chartData.map((e: any) => <Cell key={e.name} fill={NET_COLORS[e.name.toLowerCase()] || C.dim} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent posts */}
      {posts.length > 0 && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 14px' }}>Recent Posts</p>
          {posts.slice(0, 5).map((post: any, i: number) => {
            const net = post.network?.toLowerCase() || '';
            const color = NET_COLORS[net] || C.dim;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ marginTop: 2, flexShrink: 0 }}><NetIcon network={net} size={13} color={color} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: C.text, margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.text || post.content || 'Post content'}
                  </p>
                  <div style={{ display: 'flex', gap: 14, fontSize: 11, color: C.dim }}>
                    {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
                    {post.impressions && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={10} color={C.dim} /> {post.impressions.toLocaleString()}</span>}
                    {post.likes       && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Heart size={10} color={C.dim} /> {post.likes.toLocaleString()}</span>}
                    {post.comments    && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MessageCircle size={10} color={C.dim} /> {post.comments}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}