import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminShell from '@/components/admin/AdminShell';
import BlogPostForm from '@/components/admin/BlogPostForm';
import BlogPostManagementTable from '@/components/admin/BlogPostManagementTable';
import { getAdminBlogPostsFromBackend } from '@/lib/admin/backend-blog';
import { requireProductManager } from '@/lib/auth/guards';
import { getBackendApiUrl } from '@/lib/backend-api';
import { getPostTags } from '@/lib/content/public-blog';
import { prisma } from '@/lib/prisma';

export default async function AdminBlogPage() {
  const session = await requireProductManager();
  const backendPosts = getBackendApiUrl() ? await getAdminBlogPostsFromBackend() : null;
  const posts = backendPosts
    ? []
    : await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });

  return (
    <AdminShell
      title="Blog y contenido"
      description="Administra artículos, visibilidad y estrategia de contenido desde una vista pensada para crecer."
      email={session.email}
      role={session.role}
    >
      <AdminBreadcrumbs
        items={[
          { label: 'Dashboard', href: '/admin_group' },
          { label: 'Blog', href: '/admin_group/admin/blog' },
          { label: 'Panel editorial' },
        ]}
      />

      <div style={{ display: 'grid', gap: '24px' }}>
        <BlogPostForm />
        <BlogPostManagementTable
          posts={backendPosts ?? posts.map((post) => {
            const contentObject =
              typeof post.content === 'object' && post.content ? (post.content as Record<string, unknown>) : {};

            return {
              id: post.id,
              title: post.title,
              slug: post.slug,
              excerpt: typeof contentObject.excerpt === 'string' ? contentObject.excerpt : '',
              tags: getPostTags(post.content),
              published: post.published,
              createdAt: post.createdAt.toISOString(),
              authorName: post.author.name ?? post.author.email,
            };
          })}
        />
      </div>
    </AdminShell>
  );
}
