import { TokenGate } from '@/components/TokenGate';
import { GA4Dashboard } from '../components/GA4Dashboard';

export const revalidate = 180;

async function Content() {
  return (
    <div style={{
      margin: 0,
      padding: 0,
      background: '#080f1a',
      minHeight: '100vh',
      width: '100%',
    }}>
      <GA4Dashboard />
    </div>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <TokenGate searchParams={searchParams}>
      <Content />
    </TokenGate>
  );
}