/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');

const standaloneServer = path.join(__dirname, '.next', 'standalone', 'server.js');
const rootServer = path.join(__dirname, 'server.js');

if (fs.existsSync(standaloneServer)) {
  require(standaloneServer);
} else if (fs.existsSync(rootServer)) {
  require(rootServer);
} else {
  throw new Error(
    'No se encontró el servidor de Next. Ejecuta primero "npm run build" o sube la salida standalone completa.'
  );
}
