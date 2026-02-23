'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { Users, Eye, Heart, MessageCircle, Share2, AlertTriangle, Instagram, Linkedin, Twitter } from 'lucide-react';

interface MetricoolData {
  companyId: string;
  companyName: string;
  blogId: string;
  dateRange: { startDate: string; endDate: string };
  profile: any;
  stats: any;
  posts: any[];
}

interface MetricoolMetricsProps {
  dateRange: { start: string; end: string };
}

const NETWORK_COLORS: Record<string, string> = {
  instagram: '#F472B6',
  facebook: '#60A5FA',
  twitter: '#38BDF8',
  linkedin: '#6EE7B7',
  tiktok: '#A78BFA',
};

// Lucide doesn't have Facebook/TikTok but has these
const NetworkIcon = ({ network, size = 12, color }: { network: string; size?: number; color: string }) => {
  if (network === 'instagram') return <Instagram size={size} color={color} strokeWidth={2} />;
  if (network === 'twitter') return <Twitter size={size} color={color} strokeWidth={2} />;
  if (network === 'linkedin') return <Linkedin size={size} color={color} strokeWidth={2} />;
  // Fallback for facebook/tiktok
  return <Share2 size={size} color={color} strokeWidth={2} />;
};

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

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 10,
  fontWeight: 600,
  color: '#475569',
  margin: '0 0 14px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

export function MetricoolMetrics({ dateRange }: MetricoolMetricsProps) {
  const [data, setData] = useState<MetricoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchMetricool() {
      setLoading(true);
      setError(null);
      try {
        const token = searchParams.get('token');
        const response = await fetch(`/api/metricool/metrics?token=${token}&startDate=${dateRange.start}&endDate=${dateRange.end}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch Metricool data');
        }
        setData(await response.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMetricool();
  }, [searchParams, dateRange]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: 16, height: 16, border: '2px solid #1e293b', borderTop: '2px solid #A78BFA', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
      <span style={{ color: '#64748b', fontSize: 13 }}>Loading social data…</span>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Inter, sans-serif' }}>
      <AlertTriangle size={15} color="#f43f5e" />
      <span style={{ color: '#f43f5e', fontSize: 13 }}>{error}</span>
    </div>
  );

  if (!data) return (
    <p style={{ color: '#64748b', fontSize: 13, fontFamily: 'Inter, sans-serif', margin: 0 }}>No social data available</p>
  );

  const stats = data.stats || {};
  const posts = data.posts || [];
  const followers = stats.followers || {};
  const impressions = stats.impressions || {};
  const engagements = stats.engagements || {};
  const networks = Object.keys(followers).length > 0 ? Object.keys(followers) : (data.profile?.networks || []);

  const totalFollowers = networks.reduce((s: number, n: string) => s + (followers[n] || 0), 0) || stats.totalFollowers || 0;
  const totalImpressions = networks.reduce((s: number, n: string) => s + (impressions[n] || 0), 0) || stats.totalImpressions || 0;
  const totalEngagements = networks.reduce((s: number, n: string) => s + (engagements[n] || 0), 0) || stats.totalEngagements || 0;
  const engagementRate = typeof stats.engagementRate === 'number' ? stats.engagementRate : 0;

  const networkChartData = networks.map((net: string) => ({
    name: net.charAt(0).toUpperCase() + net.slice(1),
    Followers: followers[net] || 0,
  }));

  const topKpis = [
    { label: 'Total Followers', value: totalFollowers.toLocaleString(), color: '#A78BFA', Icon: Users },
    { label: 'Impressions', value: totalImpressions.toLocaleString(), color: '#F472B6', Icon: Eye },
    { label: 'Engagements', value: totalEngagements.toLocaleString(), color: '#6EE7B7', Icon: Heart },
    { label: 'Eng. Rate', value: `${engagementRate.toFixed(2)}%`, color: '#FBBF24', Icon: Share2 },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #1e293b' }}>
        <Share2 size={14} color="#A78BFA" />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>Social Media</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#475569' }}>{data.companyName}</span>
      </div>

      {/* Top KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {topKpis.map(({ label, value, color, Icon }, i) => (
          <div key={i} style={{ background: '#080f1a', borderRadius: 8, padding: '12px 14px', border: `1px solid ${color}20` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
              <Icon size={12} color={color} strokeWidth={2} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Per-Network Breakdown */}
      {networks.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
          {networks.map((net: string, i: number) => {
            const color = NETWORK_COLORS[net] || '#64748b';
            return (
              <div key={i} style={{ background: '#080f1a', borderRadius: 8, padding: '12px 14px', border: `1px solid ${color}25` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <NetworkIcon network={net} size={12} color={color} />
                  <span style={{ fontSize: 11, color, fontWeight: 600, textTransform: 'capitalize' }}>{net}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {followers[net] !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: '#475569' }}>Followers</span>
                      <span style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>{(followers[net] || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {impressions[net] !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: '#475569' }}>Impressions</span>
                      <span style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>{(impressions[net] || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {engagements[net] !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: '#475569' }}>Engagements</span>
                      <span style={{ fontSize: 11, color, fontWeight: 700 }}>{(engagements[net] || 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Followers Chart */}
      {networkChartData.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={sectionTitle}>Followers by Network</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={networkChartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Followers" radius={[3, 3, 0, 0]}>
                {networkChartData.map((entry: any, i: number) => (
                  <Cell key={i} fill={NETWORK_COLORS[entry.name.toLowerCase()] || '#64748b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Posts */}
      {posts.length > 0 && (
        <div>
          <p style={sectionTitle}>Recent Posts</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {posts.slice(0, 5).map((post: any, i: number) => {
              const net = post.network?.toLowerCase() || '';
              const color = NETWORK_COLORS[net] || '#64748b';
              return (
                <div key={i} style={{ padding: '10px 0', borderBottom: i < Math.min(posts.length, 5) - 1 ? '1px solid #1e293b' : 'none', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ marginTop: 2, flexShrink: 0 }}>
                    <NetworkIcon network={net} size={12} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: '#cbd5e1', margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.text || post.content || 'Post content'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#475569' }}>
                      {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
                      {post.impressions && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Eye size={10} color="#64748b" /> {post.impressions.toLocaleString()}
                        </span>
                      )}
                      {post.likes && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Heart size={10} color="#64748b" /> {post.likes.toLocaleString()}
                        </span>
                      )}
                      {post.comments && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MessageCircle size={10} color="#64748b" /> {post.comments}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}