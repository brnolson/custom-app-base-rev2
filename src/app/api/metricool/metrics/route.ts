import { NextRequest, NextResponse } from 'next/server';
import { copilotApi } from 'copilot-node-sdk';

export const dynamic = 'force-dynamic';

// Map Assembly company IDs to Metricool blogIds
const BLOG_MAPPING: Record<string, { blogId: string; name: string }> = {
  'default': { blogId: '1920806', name: 'Straightline Roofing' },
  'fdb96a2c-a6ad-4238-9747-06b3ce7e8840': { blogId: '1920864', name: 'Alans Roofing' },
  '7d52dc8e-c603-4c7e-ad27-60c15a86c12f': { blogId: '1914400', name: 'Art Unlimited' },
  // Add more mappings as you get Assembly company IDs for each client
  'CRANDALL_COMPANY_ID': { blogId: '4374791', name: 'Crandall Roofing' },
  'MIDDLE_CREEK_COMPANY_ID': { blogId: '1929926', name: 'Middle Creek' },
  'NEPA_COMPANY_ID': { blogId: '1920835', name: 'NEPA Builders' },
  'QUANTUM_COMPANY_ID': { blogId: '1920899', name: 'Quantum Roofing' },
  'SRW_COMPANY_ID': { blogId: '4069038', name: 'SRW Products' },
  'STEVENS_COMPANY_ID': { blogId: '1920881', name: 'Stevens Roofing' },
  'STRAIGHTLINE_COMPANY_ID': { blogId: '1920806', name: 'Straightline Roofing' },
  'TITTLE_COMPANY_ID': { blogId: '3797430', name: 'Tittle Brothers' },
  'TRENT_COMPANY_ID': { blogId: '4947746', name: 'Trent Cotney' },
  'VANWEELDEN_COMPANY_ID': { blogId: '1920820', name: 'VanWeelden' },
};

export async function GET(request: NextRequest) {
  return NextResponse.json({
    companyId: 'default',
    companyName: 'Straightline Roofing',
    blogId: 'demo-blog-id',
    dateRange: { startDate: '30daysAgo', endDate: 'today' },
    profile: {
      name: 'Straightline Roofing',
      networks: ['instagram', 'facebook', 'twitter'],
    },
    stats: {
      followers: {
        instagram: 4820,
        facebook: 2310,
        twitter: 890,
      },
      impressions: {
        instagram: 18400,
        facebook: 9200,
        twitter: 3100,
      },
      engagements: {
        instagram: 1240,
        facebook: 620,
        twitter: 180,
      },
      engagementRate: 4.35,
      totalImpressions: 30700,
      totalEngagements: 2040,
    },
    posts: [
      {
        id: 'p1',
        network: 'instagram',
        text: 'Check out our latest roofing project!',
        publishedAt: '2024-01-15T10:00:00Z',
        impressions: 2400,
        engagements: 312,
        likes: 289,
        comments: 23,
      },
      {
        id: 'p2',
        network: 'facebook',
        text: 'Winter roofing tips for homeowners.',
        publishedAt: '2024-01-12T14:00:00Z',
        impressions: 1800,
        engagements: 198,
        likes: 176,
        comments: 22,
      },
      {
        id: 'p3',
        network: 'instagram',
        text: 'Before and after — new shingle install.',
        publishedAt: '2024-01-10T09:00:00Z',
        impressions: 3100,
        engagements: 420,
        likes: 398,
        comments: 22,
      },
    ],
  });
}