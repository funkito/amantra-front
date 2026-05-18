'use client';

import { useMemo, useState } from 'react';

interface BlogGridPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  createdAt: string;
  tags: string[];
}

interface BuilderBlogGridSectionProps {
  title?: string;
  body?: string;
  posts: BlogGridPost[];
  initialTag?: string;
  accentColor: string;
  limit: number;
  columns: number;
}

function getGridCardWidth(columns: number) {
  if (columns <= 1) return 720;
  if (columns === 2) return 520;
  if (columns === 3) return 360;
  return 300;
}

function trimText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

export default function BuilderBlogGridSection({
  title,
  body,
  posts,
  initialTag,
  accentColor,
  limit,
  columns,
}: BuilderBlogGridSectionProps) {
  const [activeTag, setActiveTag] = useState(initialTag ?? '');

  const availableTags = useMemo(
    () =>
      Array.from(new Set(posts.flatMap((post) => post.tags)))
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right, 'es')),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    const basePosts = activeTag
      ? posts.filter((post) => post.tags.some((tag) => tag.toLowerCase() === activeTag.toLowerCase()))
      : posts;

    return basePosts.slice(0, Math.min(limit, 8));
  }, [activeTag, posts, limit]);

  const cardWidth = getGridCardWidth(columns);

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <h2 style={{ margin: '0 0 10px', fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>{title}</h2>
        <p style={{ margin: 0, color: 'rgba(245,239,228,0.78)', lineHeight: 1.8 }}>{body}</p>
      </div>

      {availableTags.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button
            type="button"
            onClick={() => setActiveTag('')}
            style={buildTagButtonStyle(!activeTag)}
          >
            Todas
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              style={buildTagButtonStyle(activeTag.toLowerCase() === tag.toLowerCase())}
            >
              #{tag}
            </button>
          ))}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${cardWidth}px, ${cardWidth}px))`,
          justifyContent: 'start',
          gap: 16,
        }}
      >
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            style={{
              borderRadius: 22,
              padding: 18,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(212,175,55,0.12)',
              display: 'grid',
              alignContent: 'start',
              alignItems: 'start',
              gap: 10,
            }}
          >
            {post.coverImage ? (
              <div
                style={{
                  width: '100%',
                  minHeight: 150,
                  borderRadius: 16,
                  background: `linear-gradient(rgba(20,14,10,0.14), rgba(20,14,10,0.14)), url(${post.coverImage}) center / cover no-repeat`,
                }}
              />
            ) : null}
            <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Blog
            </div>
            <h3 style={{ margin: 0, fontSize: 22 }}>{trimText(post.title, 90)}</h3>
            <p style={{ margin: 0, color: 'rgba(245,239,228,0.76)', lineHeight: 1.7 }}>
              {trimText(post.excerpt || 'Artículo publicado desde el blog de Amantra.', 220)}
            </p>
            <div style={{ color: 'rgba(245,239,228,0.58)', fontSize: 13 }}>
              {new Date(post.createdAt).toLocaleDateString('es-CO')}
            </div>
            <a
              href={`/blog/${post.slug}`}
              style={{
                marginTop: 4,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 150,
                padding: '12px 18px',
                borderRadius: 999,
                background: accentColor,
                color: '#140e0a',
                textDecoration: 'none',
                fontWeight: 800,
              }}
            >
              Leer artículo
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}

function buildTagButtonStyle(active: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '2.4rem',
    padding: '0 0.95rem',
    borderRadius: 999,
    border: active ? '1px solid rgba(242, 200, 107, 0.65)' : '1px solid rgba(222, 183, 108, 0.2)',
    background: active ? 'rgba(242, 200, 107, 0.08)' : 'rgba(255, 248, 232, 0.04)',
    color: active ? '#fff2c8' : '#ccbda5',
    cursor: 'pointer',
    fontWeight: active ? 700 : 500,
  };
}
