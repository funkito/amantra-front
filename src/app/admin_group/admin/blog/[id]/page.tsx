import { notFound } from 'next/navigation';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminShell from '@/components/admin/AdminShell';
import BlogPostForm from '@/components/admin/BlogPostForm';
import { getAdminBlogPostFromBackend } from '@/lib/admin/backend-blog';
import { requireProductManager } from '@/lib/auth/guards';
import { getBackendApiUrl } from '@/lib/backend-api';
import { getPostTags } from '@/lib/content/public-blog';
import { prisma } from '@/lib/prisma';

export default async function AdminEditBlogPostPage(props: PageProps<'/admin_group/admin/blog/[id]'>) {
  const session = await requireProductManager();
  const { id } = await props.params;

  if (getBackendApiUrl()) {
    const post = await getAdminBlogPostFromBackend(id);

    if (!post) {
      notFound();
    }

    return (
      <AdminShell
        title="Edición de artículo"
        description="Ajusta portada, extracto, etiquetas y estado del contenido editorial desde el mismo panel."
        email={session.email}
        role={session.role}
      >
        <AdminBreadcrumbs
          items={[
            { label: 'Dashboard', href: '/admin_group' },
            { label: 'Blog', href: '/admin_group/admin/blog' },
            { label: 'Editar artículo' },
          ]}
        />

        <BlogPostForm mode="edit" postId={post.id} initialData={post} />
      </AdminShell>
    );
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const contentObject = typeof post.content === 'object' && post.content ? (post.content as Record<string, unknown>) : {};

  return (
    <AdminShell
      title="Edición de artículo"
      description="Ajusta portada, extracto, etiquetas y estado del contenido editorial desde el mismo panel."
      email={session.email}
      role={session.role}
    >
      <AdminBreadcrumbs
        items={[
          { label: 'Dashboard', href: '/admin_group' },
          { label: 'Blog', href: '/admin_group/admin/blog' },
          { label: 'Editar artículo' },
        ]}
      />

      <BlogPostForm
        mode="edit"
        postId={post.id}
        initialData={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: typeof contentObject.excerpt === 'string' ? contentObject.excerpt : '',
          body: typeof contentObject.body === 'string' ? contentObject.body : '',
          coverImage: typeof contentObject.coverImage === 'string' ? contentObject.coverImage : '',
          tags: getPostTags(post.content),
          published: post.published,
        }}
      />
    </AdminShell>
  );
}
