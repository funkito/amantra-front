'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import BlogPostActions from '@/components/admin/BlogPostActions';

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  authorName: string;
};

interface BlogPostManagementTableProps {
  posts: BlogPostRow[];
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    color: '#FFFFF0',
    backgroundColor: 'rgba(255,255,255,0.02)',
    '& fieldset': { borderColor: 'rgba(212,175,55,0.12)' },
    '&:hover fieldset': { borderColor: 'rgba(212,175,55,0.35)' },
    '&.Mui-focused fieldset': { borderColor: '#D4AF37' },
  },
  '& .MuiInputLabel-root': { color: '#BDBDBD' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#D4AF37' },
};

export default function BlogPostManagementTable({ posts }: BlogPostManagementTableProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesQuery = normalizedQuery
        ? [post.title, post.slug, post.excerpt, post.tags.join(' '), post.authorName].join(' ').toLowerCase().includes(normalizedQuery)
        : true;
      const matchesStatus =
        status === 'ALL' ? true : status === 'PUBLISHED' ? post.published : !post.published;

      return matchesQuery && matchesStatus;
    });
  }, [posts, query, status]);

  const paginatedPosts = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredPosts.slice(start, start + rowsPerPage);
  }, [filteredPosts, page, rowsPerPage]);

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: 'hidden',
        borderRadius: '24px',
        bgcolor: '#111',
        border: '1px solid rgba(212, 175, 55, 0.16)',
      }}
    >
      <Box
        sx={{
          p: 3,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.4fr 0.4fr' },
          gap: 2,
        }}
      >
        <TextField
          fullWidth
          label="Buscar artículo"
          placeholder="Título, slug, autor o etiqueta"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          sx={fieldSx}
        />

        <TextField
          select
          fullWidth
          label="Estado"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as 'ALL' | 'PUBLISHED' | 'DRAFT');
            setPage(0);
          }}
          sx={fieldSx}
        >
          <MenuItem value="ALL">Todos</MenuItem>
          <MenuItem value="PUBLISHED">Publicados</MenuItem>
          <MenuItem value="DRAFT">Borradores</MenuItem>
        </TextField>
      </Box>

      {posts.length === 0 ? (
        <Box sx={{ px: 3, pb: 4 }}>
          <Box
            sx={{
              border: '1px solid rgba(212, 175, 55, 0.16)',
              borderRadius: '20px',
              p: 4,
              color: '#BDBDBD',
              textAlign: 'center',
            }}
          >
            Aún no hay artículos creados.
          </Box>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Artículo</TableCell>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Estado</TableCell>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Fecha</TableCell>
                  <TableCell sx={{ color: '#D4AF37', borderColor: 'rgba(212,175,55,0.1)' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPosts.map((post) => (
                  <TableRow key={post.id} hover sx={{ '& td': { borderColor: 'rgba(212,175,55,0.08)' } }}>
                    <TableCell sx={{ color: '#FFFFF0' }}>
                      <Typography sx={{ color: '#FFFFF0', fontWeight: 700 }}>{post.title}</Typography>
                      <Typography sx={{ color: '#8f846d', fontSize: '0.9rem', mt: 0.4 }}>
                        /blog/{post.slug} · {post.authorName}
                      </Typography>
                      <Typography sx={{ color: '#D7D0C3', fontSize: '0.94rem', mt: 1 }}>
                        {post.excerpt}
                      </Typography>
                      {post.tags.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1.2 }}>
                          {post.tags.map((tag) => (
                            <Chip
                              key={`${post.id}-${tag}`}
                              label={tag}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(212,175,55,0.12)',
                                color: '#D4AF37',
                              }}
                            />
                          ))}
                        </Box>
                      ) : null}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={post.published ? 'Publicado' : 'Borrador'}
                        size="small"
                        sx={{
                          bgcolor: post.published ? 'rgba(112,255,140,0.12)' : 'rgba(212,175,55,0.12)',
                          color: post.published ? '#9BD4A4' : '#D4AF37',
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ color: '#D7D0C3' }}>
                      {new Date(post.createdAt).toLocaleDateString('es-CO')}
                    </TableCell>

                    <TableCell>
                      <BlogPostActions postId={post.id} published={post.published} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredPosts.length}
            page={page}
            onPageChange={(_event, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20]}
            labelRowsPerPage="Filas por página"
            sx={{
              color: '#D7D0C3',
              borderTop: '1px solid rgba(212,175,55,0.08)',
              '.MuiTablePagination-selectIcon': { color: '#D7D0C3' },
              '.MuiSelect-select': { color: '#D7D0C3' },
              '.MuiSvgIcon-root': { color: '#D7D0C3' },
            }}
          />
        </>
      )}
    </Paper>
  );
}
