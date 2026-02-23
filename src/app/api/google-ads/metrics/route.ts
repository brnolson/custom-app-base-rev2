import { NextRequest, NextResponse } from 'next/server';
import { GoogleAdsApi } from 'google-ads-api';
import { copilotApi } from 'copilot-node-sdk';

export const dynamic = 'force-dynamic';

// Map company IDs to their Google Ads Customer IDs and names
const CUSTOMER_MAPPING: Record<string, { customerId: string; name: string; hasGoogleAds: boolean }> = {
//  'default': { customerId: '7116961973', name: 'Straight Line', hasGoogleAds: true },
  'default': { customerId: '1196391424', name: 'Art Unlimited', hasGoogleAds: false },
  '7d52dc8e-c603-4c7e-ad27-60c15a86c12f': { customerId: '1196391424', name: 'Art Unlimited', hasGoogleAds: false },
  'fdb96a2c-a6ad-4238-9747-06b3ce7e8840': { customerId: '9499823115', name: 'Alans Roofing', hasGoogleAds: true },
  '61e7c938-fd52-4693-b79b-c2fb2349b61d': { customerId: '7116961973', name: 'Straight Line', hasGoogleAds: true },
  'de381a8e-db60-447f-9114-418d874f087b': { customerId: '8289173629', name: 'Bill West Roofing', hasGoogleAds: true },
};

export async function GET(request: NextRequest) {
  return NextResponse.json({
    companyId: 'default',
    companyName: 'Art Unlimited',
    customerId: '123-456-7890',
    dateRange: { startDate: '30daysAgo', endDate: 'today' },
    metrics: {
      impressions: 84320,
      clicks: 3210,
      ctr: 3.81,
      cost: 1842.50,
      conversions: 142,
      conversionsValue: 18600.00,
      averageCpc: 0.57,
    },
    campaigns: [
      {
        id: '001',
        name: 'Spring Promo - Search',
        status: 'ENABLED',
        impressions: 32400,
        clicks: 1420,
        ctr: 4.38,
        cost: 810.00,
        conversions: 64,
        conversionsValue: 8200.00,
      },
      {
        id: '002',
        name: 'Brand Awareness - Display',
        status: 'ENABLED',
        impressions: 28900,
        clicks: 980,
        ctr: 3.39,
        cost: 620.00,
        conversions: 41,
        conversionsValue: 5300.00,
      },
      {
        id: '003',
        name: 'Retargeting - All Visitors',
        status: 'ENABLED',
        impressions: 23020,
        clicks: 810,
        ctr: 3.52,
        cost: 412.50,
        conversions: 37,
        conversionsValue: 5100.00,
      },
    ],
  });
}