import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const deployDir = path.join(root, 'para-subir-cpanel');

const entriesToCopy = [
  'src',
  'public',
  'prisma',
  'docs',
  'package.json',
  'package-lock.json',
  'next.config.ts',
  'tsconfig.json',
  'next-env.d.ts',
  'postcss.config.mjs',
  'eslint.config.mjs',
  'app.js',
  'README.md',
];

async function main() {
  await rm(deployDir, { recursive: true, force: true });
  await mkdir(deployDir, { recursive: true });

  for (const entry of entriesToCopy) {
    await cp(path.join(root, entry), path.join(deployDir, entry), { recursive: true });
  }

  await writeFile(
    path.join(deployDir, '.env.example'),
    [
      'DATABASE_URL="postgresql://USUARIO:CLAVE@HOST:5432/BASE?schema=public"',
      'NEXT_PUBLIC_SITE_URL="https://demo.tudominio.com"',
      '',
      '# Si luego activas Bold en producción, agrega aquí sus variables si decides usarlas por entorno.',
      '',
    ].join('\n'),
    'utf8'
  );

  await writeFile(
    path.join(deployDir, 'PASOS-CPANEL.md'),
    [
      '# Subida a cPanel',
      '',
      'Esta carpeta contiene el código fuente listo para subir a tu app Node.js en cPanel.',
      '',
      '## Qué NO incluye',
      '',
      '- `node_modules/`',
      '- `.next/`',
      '- `.env` real',
      '',
      '## Después de subir',
      '',
      '1. Crea la app Node.js en cPanel.',
      '2. Sube el contenido de esta carpeta al `Application Root`.',
      '3. Crea tu `.env` real usando `.env.example` como guía.',
      '4. En terminal de cPanel ejecuta:',
      '',
      '```bash',
      'npm install',
      'npx prisma generate',
      'npx prisma db push',
      'npm run build',
      '```',
      '',
      '5. Usa `app.js` como startup file.',
      '6. Reinicia la aplicación.',
      '',
      '## Nota',
      '',
      'El build standalone no se generó localmente por una restricción de Windows (`EPERM`).',
      'Por eso esta carpeta está pensada para que el build final ocurra en el servidor Linux de cPanel.',
      '',
    ].join('\n'),
    'utf8'
  );

  console.log(`Carpeta fuente lista para cPanel: ${deployDir}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
