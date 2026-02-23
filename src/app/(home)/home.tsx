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

  // Keep workspace retrieval if needed elsewhere
  await copilot.retrieveWorkspace();

  return (
    <div style={{ background: '#080f1a', minHeight: '100vh', margin: 0, padding: 0, width: '100%' }}>
      <GA4Dashboard />
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