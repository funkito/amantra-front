# Manual de Pruebas

Guía práctica para validar el panel administrativo, el Website Builder, el media manager y los flujos base de catálogo antes de seguir desarrollando.

## 1. Preparación

### Requisitos

- PostgreSQL local activo
- Variables de entorno configuradas en `.env`
- Dependencias instaladas con `npm install`
- Base sincronizada con Prisma

### Arranque recomendado

Ejecuta desde la raíz del proyecto:

```powershell
npx prisma db push
npx prisma generate
npm run dev
```

### URLs principales

- Sitio público: `http://localhost:3000`
- Login admin: `http://localhost:3000/admin_group/login`
- Dashboard admin: `http://localhost:3000/admin_group`
- Productos admin: `http://localhost:3000/admin_group/admin/products`
- Órdenes admin: `http://localhost:3000/admin_group/admin/orders`
- Usuarios admin: `http://localhost:3000/admin_group/admin/users`
- Configuración admin: `http://localhost:3000/admin_group/admin/settings`
- Builder visual: `http://localhost:3000/admin_group/admin/builder`

## 2. Checklist rápido

Valida esto antes de entrar a pruebas más detalladas:

- El servidor inicia sin errores críticos
- Puedes iniciar sesión en el admin
- El menú lateral muestra los módulos
- Puedes abrir `Productos`, `Órdenes`, `Usuarios`, `Configuración` y `Builder`
- El sitio público carga
- El builder abre sin pantalla en blanco

## 3. Pruebas del Dashboard Admin

### Objetivo

Comprobar navegación, shell del admin y accesos rápidos.

### Pasos

1. Inicia sesión con un usuario `SUPERADMIN` o `EDITOR`
2. Entra a `/admin_group`
3. Revisa el menú lateral
4. Abre cada módulo desde el menú
5. Usa breadcrumbs para regresar

### Resultado esperado

- El dashboard carga sin errores
- El menú lateral funciona
- No hay redirecciones infinitas
- Cada módulo abre dentro del mismo shell visual

## 4. Pruebas de Productos

### Objetivo

Validar CRUD, variantes, tags, imágenes y estados.

### Caso A: crear producto

1. Entra a `/admin_group/admin/products`
2. Completa:
   - nombre
   - descripción
   - precio base
   - estado
   - envío
   - variantes
   - tags
3. Sube imágenes
4. Guarda el producto

### Resultado esperado

- El producto se guarda
- Aparece en el listado
- Se ve miniatura, estado, fecha y acciones

### Caso B: editar producto

1. Pulsa `Editar`
2. Cambia nombre o precio
3. Guarda

### Resultado esperado

- Los cambios se reflejan en el listado y en el detalle

### Caso C: despublicar

1. Pulsa `Despublicar`

### Resultado esperado

- El estado cambia
- El producto deja de mostrarse en bloques públicos dinámicos que consumen productos publicados

### Caso D: eliminar

1. Pulsa `Eliminar`
2. Confirma

### Resultado esperado

- El producto desaparece del listado activo
- No rompe el sitio público

## 5. Pruebas de Usuarios

### Objetivo

Validar creación, edición, activación/desactivación y filtros.

### Pasos

1. Entra a `/admin_group/admin/users`
2. Crea un usuario `customer`
3. Crea un usuario `editor`
4. Edita uno
5. Desactiva uno
6. Elimina uno de prueba

### Resultado esperado

- El usuario se crea correctamente
- El estado activo/inactivo se refleja en la tabla
- Los filtros por rol y estado funcionan

## 6. Pruebas de Órdenes

### Objetivo

Validar listado, estado y detalle de líneas de pedido.

### Pasos

1. Crea una orden desde el checkout público
2. Entra a `/admin_group/admin/orders`
3. Busca por correo o ID
4. Abre el detalle
5. Cambia el estado

### Resultado esperado

- La orden aparece en el listado
- Se ven cliente, total y estado
- El detalle muestra productos, cantidades y líneas de pedido reales

## 7. Pruebas del Website Builder

### Objetivo

Validar el constructor visual, versiones, publicación y render público.

### Caso A: abrir el builder

1. Entra a `/admin_group/admin/builder`
2. Verifica:
   - sidebar izquierda
   - canvas central
   - inspector derecho
   - header con acciones

### Resultado esperado

- El builder carga sin error
- Hay una página activa
- El canvas responde

### Caso B: agregar bloques

1. Inserta bloques desde la paleta:
   - `hero`
   - `section`
   - `product_grid`
   - `featured_product`
   - `blog_teaser`
   - `image_banner`
2. Reordénalos
3. Selecciona uno y edita contenido

### Resultado esperado

- Los bloques aparecen en el canvas
- Se pueden reordenar
- El inspector cambia según el bloque seleccionado

### Caso C: edición inline

1. Haz click sobre textos del bloque
2. Edita título y cuerpo

### Resultado esperado

- El texto se actualiza en el canvas
- No aparecen errores en consola

### Caso D: inspector y estilos

1. Cambia:
   - padding
   - colores
   - ancho de contenedor
   - alineación
   - visibilidad responsive
2. Cambia el preset visual

### Resultado esperado

- El bloque responde visualmente a los cambios

### Caso E: páginas y versiones

1. Guarda borrador
2. Publica
3. Crea una nueva versión
4. Restaura una versión anterior

### Resultado esperado

- El guardado funciona
- Se generan versiones
- La restauración vuelve al estado esperado

### Caso F: biblioteca de páginas

1. Crea una nueva página
2. Duplica una página existente
3. Cambia entre páginas por slug

### Resultado esperado

- Las páginas se cargan correctamente
- El slug cambia sin romper el builder

## 8. Pruebas del Media Manager en Builder

### Objetivo

Validar subida, refresco y selección de imágenes desde el editor.

### Pasos

1. Entra al builder
2. Selecciona un bloque con imagen
3. En el inspector, ve a `Galería rápida`
4. Pulsa `Subir imágenes`
5. Selecciona una o varias imágenes `.jpg`, `.png` o `.webp`

### Resultado esperado

- La subida termina sin error
- La librería se refresca
- La primera imagen subida queda aplicada al bloque actual
- Las imágenes nuevas aparecen con source `builder`

### Validaciones recomendadas

- subir 1 imagen válida
- subir varias imágenes válidas
- intentar subir un archivo mayor a 5MB
- intentar subir un formato no permitido

### Resultado esperado

- archivos válidos: se aceptan
- archivo inválido: se muestra error amigable

## 9. Pruebas de bloques dinámicos

### Objetivo

Comprobar que el builder consume contenido real publicado.

### Caso A: featured product

1. Crea o publica un producto
2. En el builder, agrega bloque `featured_product`
3. En el inspector, selecciona `Producto real`
4. Guarda y publica la página
5. Abre la ruta pública de esa página

### Resultado esperado

- Se ve el producto real
- Toma nombre, descripción e imagen
- El CTA apunta a `/products/:id`

### Caso B: blog teaser

1. Publica un post
2. Agrega bloque `blog_teaser`
3. Selecciona el post en el inspector
4. Guarda y publica
5. Abre la página pública

### Resultado esperado

- Se ve el teaser con contenido real
- El CTA apunta a `/blog/:slug`

### Caso C: product grid

1. Asegúrate de tener productos en estado `PUBLISHED`
2. Agrega un bloque `product_grid`
3. Cambia columnas y límite
4. Publica la página

### Resultado esperado

- El grid muestra productos reales publicados
- Respeta el límite configurado

## 10. Pruebas de render público

### Objetivo

Validar que las páginas públicas renderizan desde JSON.

### Pasos

1. Publica una página en el builder
2. Abre `http://localhost:3000/[slug]`

### Resultado esperado

- La página carga
- Se muestran los bloques en orden
- Solo se renderizan páginas `published`

## 11. Pruebas de Configuración de Bold

### Objetivo

Dejar listo el entorno antes de pruebas oficiales con el asesor.

### Pasos

1. Entra a `/admin_group/admin/settings`
2. Completa:
   - URL pública del sitio
   - ambiente
   - llave de identidad
   - llave secreta
3. Guarda

### Resultado esperado

- La configuración se guarda
- Desaparece el mensaje de Bold no configurado

## 12. Errores comunes y qué revisar

### El builder no carga bien

Revisa:

- `npm run dev`
- errores de TypeScript o lint
- sesión admin activa

### No aparecen productos o posts en bloques dinámicos

Revisa:

- que estén publicados
- que existan en BD
- que el bloque esté realmente vinculado en el inspector

### No aparece una imagen nueva en la librería

Revisa:

- formato permitido
- tamaño máximo 5MB
- que la subida haya terminado
- que exista la carpeta `public/uploads/media`

### Una página pública no muestra cambios

Revisa:

- si guardaste como `draft` o `published`
- el slug correcto
- si el builder restauró una versión anterior por error

## 13. Checklist final antes de continuar desarrollo

Marca esto como completo:

- CRUD de productos funcionando
- CRUD de usuarios funcionando
- órdenes visibles y con detalle
- builder abre y guarda
- media manager sube imágenes
- bloques dinámicos leen productos y posts reales
- render público por slug funcionando
- configuración base de Bold cargada o pendiente según pruebas

## 14. Recomendación de siguiente paso

Cuando termines este manual, el siguiente orden recomendado es:

1. Probar media manager y builder completo
2. Probar páginas públicas por slug
3. Validar productos dinámicos
4. Hacer pruebas con el asesor de Bold
5. Continuar con el siguiente módulo o mejoras de producción
