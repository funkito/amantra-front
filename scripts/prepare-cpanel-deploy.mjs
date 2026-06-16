import { cp, mkdir, rm, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const standaloneDir = path.join(root, '.next', 'standalone');
const staticDir = path.join(root, '.next', 'static');
const publicDir = path.join(root, 'public');
const prismaDir = path.join(root, 'prisma');
const deployDir = path.join(root, 'para-subir-cpanel');
const deployStaticDir = path.join(deployDir, '.next', 'static');

async function ensureExists(target, label) {
  try {
    await stat(target);
  } catch {
    throw new Error(`Falta ${label}: ${target}. Ejecuta primero "npm run build".`);
  }
}

async function main() {
  await ensureExists(standaloneDir, 'el build standalone');
  await ensureExists(staticDir, 'la carpeta .next/static');

  await rm(deployDir, { recursive: true, force: true });
  await mkdir(deployStaticDir, { recursive: true });

  await cp(standaloneDir, deployDir, { recursive: true });
  await cp(staticDir, deployStaticDir, { recursive: true });
  await cp(publicDir, path.join(deployDir, 'public'), { recursive: true });
  await cp(prismaDir, path.join(deployDir, 'prisma'), { recursive: true });

  await writeFile(
    path.join(deployDir, 'app.js'),
    "require('./server.js');\n",
    'utf8'
  );

  await writeFile(
    path.join(deployDir, '.env.example'),
    [
      'DATABASE_URL="postgresql://USUARIO:CLAVE@HOST:5432/BASE?schema=public"',
      'NEXT_PUBLIC_SITE_URL="https://demo.tudominio.com"',
      '',
    ].join('\n'),
    'utf8'
  );

  await writeFile(
    path.join(deployDir, 'README-CPANEL.md'),
    [
      '# Archivos listos para cPanel',
      '',
      'Sube el contenido de esta carpeta a la ruta de tu app Node.js en cPanel.',
      '',
      '## Qué contiene',
      '',
      '- `server.js`: servidor standalone generado por Next.js',
      '- `app.js`: archivo de arranque para cPanel/Passenger',
      '- `.next/static`: assets estáticos del build',
      '- `public/`: imágenes y archivos públicos',
      '- `prisma/`: schema por si necesitas `prisma generate` o revisión del deploy',
      '- `.env.example`: ejemplo de variables de entorno',
      '',
      '## Antes de subir',
      '',
      '1. Crea la app Node.js en cPanel.',
      '2. Usa `app.js` como startup file.',
      '3. Crea el archivo `.env` con tus credenciales reales.',
      '4. Si tu hosting lo permite, ejecuta `npx prisma generate` y reinicia la app.',
      '',
      '## Recomendación',
      '',
      'Sube esta carpeta a un subdominio tipo `demo.tudominio.com` para la presentación.',
      '',
    ].join('\n'),
    'utf8'
  );

  console.log(`Carpeta de deploy lista: ${deployDir}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
