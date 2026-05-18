# Manual de Uso del Website Builder

Guía práctica para administrar páginas visuales en Amantra usando el constructor por bloques.

## 1. ¿Qué hace el builder?

El builder permite crear páginas visuales sin tocar código.

Con este módulo puedes:

- crear páginas nuevas
- duplicar páginas existentes
- editar textos e imágenes
- reordenar bloques
- cambiar estilos visuales
- conectar bloques a productos y posts reales
- guardar borradores
- publicar páginas
- abrir una vista previa protegida

## 2. Ruta de acceso

Entra desde:

```text
http://localhost:3000/admin_group/admin/builder
```

Debes iniciar sesión con un usuario:

- `SUPERADMIN`
- `EDITOR`

## 3. Estructura de la pantalla

El builder tiene tres zonas principales:

### Sidebar izquierda

Aquí ves:

- biblioteca de páginas
- botón para crear página nueva
- botón para duplicar página actual
- paleta de bloques
- composiciones o plantillas rápidas

### Canvas central

Aquí construyes la página.

Puedes:

- agregar bloques
- reorganizarlos
- seleccionar uno
- editar textos inline

### Panel derecho

Aquí cambias propiedades del bloque o de la página:

- colores
- padding
- ancho
- alineación
- visibilidad responsive
- imagen
- CTA
- conexión con producto o post real

## 4. Barra superior

En la parte superior tienes estas acciones:

### Título

Es el nombre interno de la página.

Ejemplo:

```text
Landing verano Amantra
```

### Slug

Es la URL pública.

Ejemplo:

```text
verano-amantra
```

Eso genera esta ruta:

```text
http://localhost:3000/verano-amantra
```

### Undo / Redo

Sirve para deshacer o rehacer cambios recientes.

### Preview

Abre una vista previa protegida del admin.

Importante:

- primero guarda en servidor
- luego abre la vista previa
- funciona incluso si la página está en borrador

### Guardar borrador

Guarda la página sin hacerla pública.

### Publicar

Guarda y deja la página disponible en la ruta pública.

### Reset

Restablece el documento del builder al estado base actual del store. Úsalo con cuidado.

## 5. Biblioteca de páginas

En la parte izquierda puedes manejar varias páginas.

### Crear página nueva

Debes definir:

- título
- slug

Recomendaciones para el slug:

- usar minúsculas
- usar guiones
- no usar tildes
- no usar espacios

Ejemplo correcto:

```text
coleccion-bohemia
```

### Duplicar página

Esto copia:

- estructura
- bloques
- estilos
- textos

Luego debes cambiar:

- título
- slug

## 6. Tipos de bloques disponibles

Actualmente tienes estos bloques principales:

- `hero`
- `section`
- `columns`
- `product_grid`
- `featured_product`
- `blog_teaser`
- `rich_text`
- `image_banner`
- `newsletter_cta`

## 7. Cómo agregar un bloque

Puedes hacerlo desde la paleta izquierda.

Pasos:

1. abre la categoría
2. selecciona el bloque
3. agrégalo al canvas
4. selecciónalo para editarlo

## 8. Cómo mover bloques

En el canvas puedes:

- arrastrar
- soltar
- reordenar visualmente

El orden final del canvas será el orden de la página pública.

## 9. Cómo editar texto

Haz click sobre el contenido del bloque en el canvas.

Puedes editar:

- título
- subtítulo
- cuerpo
- CTA

Consejo:

usa textos cortos en bloques visuales como `hero` y textos más explicativos en `section` o `rich_text`.

## 10. Cómo usar el inspector

Cuando seleccionas un bloque, el panel derecho muestra sus propiedades.

### Propiedades comunes

- `Título visible`
- `Subtítulo`
- `Texto / cuerpo`
- `Padding X`
- `Padding Y`
- `Color de fondo`
- `Color de texto`
- `Preset visual`
- `Ancho de contenedor`
- `Alineación`
- `CTA label`
- `CTA href`
- `Visibilidad responsive`

### Duplicar bloque

Puedes clonar el bloque actual desde el inspector.

## 11. Tema global de la página

En el inspector también puedes modificar el tema general:

- fondo de página
- superficie
- color de texto
- color de acento

Esto afecta toda la página, no solo un bloque.

## 12. Media manager

El builder tiene una galería rápida para seleccionar imágenes.

### Qué puede hacer

- listar imágenes del builder
- listar imágenes de productos
- listar imágenes locales ya subidas
- buscar por nombre
- asignar una imagen al bloque seleccionado

### Subir imágenes desde el builder

Pasos:

1. selecciona un bloque con imagen
2. ve a `Galería rápida`
3. pulsa `Subir imágenes`
4. elige archivos válidos

Formatos permitidos:

- `.jpg`
- `.png`
- `.webp`

Límite:

- `5MB` por archivo

Resultado esperado:

- las imágenes se optimizan automáticamente
- se guardan en `public/uploads/media`
- aparecen de inmediato en la librería
- la primera imagen subida se aplica al bloque actual

## 13. Bloques dinámicos conectados a contenido real

### Featured Product

Sirve para destacar un producto real.

Pasos:

1. agrega bloque `featured_product`
2. selecciónalo
3. en el inspector busca `Producto real`
4. elige un producto publicado

El bloque toma:

- título
- descripción
- imagen
- enlace al producto

### Blog Teaser

Sirve para destacar un post del blog.

Pasos:

1. agrega bloque `blog_teaser`
2. selecciónalo
3. en el inspector busca `Post real`
4. elige un post publicado

El bloque toma:

- título
- extracto
- imagen
- enlace al post

### Product Grid

Sirve para mostrar productos publicados automáticamente.

Puedes ajustar:

- columnas
- límite de productos

## 14. Visibilidad responsive

Cada bloque puede mostrarse o ocultarse por dispositivo:

- desktop
- tablet
- mobile

Esto se controla desde el inspector.

Ejemplo de uso:

- mostrar un `hero` completo solo en desktop
- ocultar un bloque pesado en mobile

## 15. Guardado, borrador y publicación

### Guardar borrador

Úsalo cuando:

- todavía estás trabajando
- no quieres exponer la página al público
- quieres conservar cambios sin publicar

### Publicar

Úsalo cuando:

- la página ya está lista
- quieres abrir la URL pública

Importante:

- la ruta pública solo muestra páginas `published`
- los borradores solo se ven en el preview protegido del admin

## 16. Vista previa

El botón `Preview`:

- guarda primero la página en servidor
- luego abre una vista previa interna del admin

Ruta de ejemplo:

```text
/admin_group/admin/builder/preview/inicio
```

Ventajas:

- funciona aunque la página esté en borrador
- no devuelve `404` por no estar publicada
- te deja volver al builder fácilmente

## 17. Versiones

El builder guarda snapshots de versiones.

Desde el inspector puedes:

- ver versiones recientes
- restaurar una versión previa

Esto es útil si:

- hiciste un cambio visual que no te gustó
- quieres volver a una versión anterior

## 18. Buenas prácticas recomendadas

### Para títulos

- usar frases claras
- evitar párrafos largos en encabezados

### Para imágenes

- usar imágenes limpias y bien recortadas
- mantener coherencia visual entre bloques

### Para CTA

Usar verbos claros como:

- `Explorar colección`
- `Ver producto`
- `Leer artículo`
- `Descubrir más`

### Para estructura de página

Orden recomendado:

1. `hero`
2. bloque de apoyo (`section` o `columns`)
3. producto destacado o grid
4. bloque editorial o banner
5. CTA final

## 19. Errores comunes

### El preview da error

Revisa:

- que la página pueda guardarse
- que el slug no esté vacío
- que sigas autenticado en el admin

### La página pública no abre

Revisa:

- que esté en `published`
- que el slug sea correcto

### No aparecen productos en `product_grid`

Revisa:

- que existan productos publicados
- que no estén eliminados

### No aparece un producto en `featured_product`

Revisa:

- que esté publicado
- que realmente lo hayas seleccionado en el inspector

### No aparece una imagen subida

Revisa:

- formato permitido
- peso máximo
- que la subida haya terminado

## 20. Flujo recomendado de trabajo

Para crear una página nueva, usa este orden:

1. crea la página con título y slug
2. agrega estructura base
3. define tema global
4. agrega imágenes
5. conecta productos o posts reales
6. revisa responsive
7. guarda borrador
8. abre preview
9. corrige
10. publica

## 21. Checklist antes de publicar

- título correcto
- slug correcto
- imágenes cargadas
- CTA revisados
- bloques en el orden correcto
- preview revisado
- productos/posts dinámicos bien conectados
- responsive revisado

## 22. Recomendación final

Usa el builder para:

- landings comerciales
- páginas estacionales
- colecciones especiales
- páginas editoriales de campaña

No lo uses todavía para:

- lógica compleja de checkout
- formularios avanzados con validación de negocio
- flujos críticos de pago

Eso conviene dejarlo en módulos dedicados.
