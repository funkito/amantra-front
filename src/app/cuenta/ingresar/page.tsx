import CustomerAccessForm from '@/components/storefront/CustomerAccessForm';
import SiteMenu from '@/components/storefront/SiteMenu';

function safeNextPath(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate?.startsWith('/') && !candidate.startsWith('//') ? candidate : '/';
}

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const nextPath = safeNextPath(resolvedSearchParams.next);

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '32px 20px 72px',
        color: '#f5efe4',
        background:
          'radial-gradient(circle at 18% 10%, rgba(212,175,55,0.14), transparent 30%), #140f0c',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <SiteMenu compact />
        <div style={{ minHeight: 'calc(100vh - 170px)', display: 'grid', placeItems: 'center', paddingTop: 40 }}>
          <CustomerAccessForm nextPath={nextPath} />
        </div>
      </div>
    </main>
  );
}