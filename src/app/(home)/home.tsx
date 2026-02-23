import { Suspense } from 'react';
import { copilotApi } from 'copilot-node-sdk';
import { GA4Dashboard } from '@/app/components/GA4Dashboard';
import { TokenGate } from '@/components/TokenGate';

export const revalidate = 180;

async function Content({ searchParams }: { searchParams: SearchParams }) {
  const { token } = searchParams;
  const copilot = copilotApi({
    apiKey: process.env.COPILOT_API_KEY ?? '',
    token: typeof token === 'string' ? token : undefined,
  });

  try {
    await copilot.retrieveWorkspace();
  } catch (err) {
    console.error('retrieveWorkspace failed:', err);
    throw err; // still throw so we see it, but now it logs the real message
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#faf4ea', overflowY: 'auto' }}>
      <Suspense fallback={null}>
        <GA4Dashboard />
      </Suspense>
    </div>
  );
}

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <TokenGate searchParams={searchParams}>
      <Content searchParams={searchParams} />
    </TokenGate>
  );
}