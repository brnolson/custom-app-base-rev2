import { NextRequest, NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { copilotApi } from 'copilot-node-sdk';

// Map company IDs to their GA4 property IDs, names, and Google Ads Customer IDs
const PROPERTY_MAPPING: Record<string, { propertyId: string; name: string; adsCustomerId: string }> = {
  'default': { propertyId: '270323387', name: 'Art Unlimited', adsCustomerId: '1196391424' },
  '7d52dc8e-c603-4c7e-ad27-60c15a86c12f': { propertyId: '270323387', name: 'Art Unlimited', adsCustomerId: '1196391424' },
  'fdb96a2c-a6ad-4238-9747-06b3ce7e8840': { propertyId: '266834246', name: 'Alans Roofing', adsCustomerId: '9499823115' },
  '61e7c938-fd52-4693-b79b-c2fb2349b61d': { propertyId: '260457321', name: 'Straight Line', adsCustomerId: '7116961973' },
  'de381a8e-db60-447f-9114-418d874f087b': { propertyId: '270368443', name: 'Bill West Roofing', adsCustomerId: '8289173629' },
};

export async function GET(request: NextRequest) {
  return NextResponse.json({
    companyId: 'default',
    companyName: 'Demo Company',
    dateRange: { startDate: '30daysAgo', endDate: 'today' },
    metrics: {
      activeUsers: 8432,
      sessions: 12100,
      pageViews: 31500,
      avgSessionDuration: 142.5,
      bounceRate: '41.20',
      newUsers: 5230,
      engagementRate: '58.80',
    },
    timeSeries: [
      { date: '20240101', activeUsers: 300, sessions: 420, pageViews: 1100 },
      { date: '20240102', activeUsers: 280, sessions: 390, pageViews: 980 },
      // add more days...
    ],
    topPages: [
      { title: 'Home', path: '/', views: 8200 },
      { title: 'About', path: '/about', views: 3100 },
    ],
    trafficSources: [
      { source: 'Organic Search', sessions: 5400 },
      { source: 'Direct', sessions: 3200 },
      { source: 'Social', sessions: 1800 },
    ],
    devices: [
      { device: 'desktop', users: 5100 },
      { device: 'mobile', users: 2900 },
      { device: 'tablet', users: 430 },
    ],
    countries: [
      { country: 'United States', users: 6200 },
      { country: 'United Kingdom', users: 980 },
      { country: 'Canada', users: 760 },
    ],
  });
}