'use client';

import BuilderPageLibrary from '@/components/builder/BuilderPageLibrary';
import BuilderWorkspace from '@/components/builder/BuilderWorkspace';

interface PageBuilderShellProps {
  slug?: string;
}

export default function PageBuilderShell({ slug = 'inicio' }: PageBuilderShellProps) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <BuilderPageLibrary currentSlug={slug} />
      <BuilderWorkspace slug={slug} />
    </div>
  );
}
