# Deploy — CUBIC Carta Digital

## 1. Crear y configurar el Google Sheet

1. Ir a [sheets.google.com](https://sheets.google.com) → crear nueva hoja
2. Renombrar la pestaña inferior como **`carta`** (exactamente así, minúsculas)
3. Fila 1 (encabezados) — escribir exactamente estas columnas:

   | A | B | C | D | E | F | G |
   |---|---|---|---|---|---|---|
   | `categoria` | `subcategoria` | `nombre` | `descripcion` | `precio` | `precio_alternativo` | `imagen_url` |

4. Completar con los datos de la carta desde la fila 2
5. **Hacer público el Sheet:**
   - Archivo → Compartir → Compartir con otras personas
   - En "Acceso general" → cambiar a **"Cualquier persona con el enlace"** → Rol: **Lector**
   - Copiar el enlace

6. **Obtener el SHEET_ID:**
   - De la URL: `https://docs.google.com/spreadsheets/d/`**`ESTE_ES_EL_ID`**`/edit`
   - Copiar el ID (cadena larga de letras y números)

## 2. Configurar el proyecto

En el archivo `lib/getMenu.ts`, línea 6:

```ts
const SHEET_ID = 'TU_SHEET_ID'; // ← Reemplazar por el ID copiado
```

Verificar que funciona localmente:
```bash
npm install
npm run dev
```
Abrir `http://localhost:3000` — debería mostrar los datos del Sheet.

## 3. Deploy en Vercel

```bash
# Verificar que compila sin errores
npm run build

# Subir a GitHub
git init
git add .
git commit -m "CUBIC carta digital"
git remote add origin https://github.com/TU_USUARIO/cubic-carta.git
git push -u origin main
```

Luego en [vercel.com](https://vercel.com):
1. New Project → Import Git Repository → seleccionar `cubic-carta`
2. Framework Preset: **Next.js** (detectado automático)
3. Click **Deploy**
4. ¡Listo! La URL pública es `https://cubic-carta.vercel.app` (o similar)

> Cada vez que actualicen el Google Sheet, la carta se actualiza automáticamente en un máximo de **5 minutos** gracias al ISR (Incremental Static Regeneration) de Next.js.

## 4. Agregar imágenes a los platos

### Opción A — Google Drive (recomendado)
1. Subir la foto a Google Drive
2. Click derecho → "Compartir" → "Cualquier persona con el enlace puede ver"
3. Click derecho → "Obtener enlace"
4. Del link `https://drive.google.com/file/d/`**`FILE_ID`**`/view` copiar el FILE_ID
5. Construir la URL así: `https://drive.google.com/uc?export=view&id=FILE_ID`
6. Pegar esa URL en la columna `imagen_url` del Sheet

### Opción B — Imgur
1. Subir imagen a [imgur.com](https://imgur.com)
2. Copiar el link directo (ej: `https://i.imgur.com/XXXXX.jpg`)
3. Pegar en columna `imagen_url`

### Opción C — Cloudinary (mejor calidad/velocidad)
1. Crear cuenta gratuita en [cloudinary.com](https://cloudinary.com)
2. Subir imágenes → copiar la URL pública
3. Pegar en columna `imagen_url`

## 5. Estructura de datos del Sheet

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| `categoria` | Bloque principal del menú | `BRUNCH` |
| `subcategoria` | Sub-sección (puede estar vacío) | `DE CAMPO` |
| `nombre` | Nombre del plato | `Tostón de Campo` |
| `descripcion` | Ingredientes / descripción | `Con palta y huevo` |
| `precio` | Solo el número, sin $ | `11400` |
| `precio_alternativo` | Precio adicional con formato libre | `Para compartir: $20.000` |
| `imagen_url` | URL pública de la foto | `https://i.imgur.com/xxx.jpg` |

## 6. Mantenimiento

- **Cambiar precios**: editar directamente en el Sheet → actualiza en ≤5 min
- **Agregar platos**: nueva fila en el Sheet
- **Ocultar un plato**: borrar o dejar vacío el campo `nombre`
- **Nueva categoría**: escribir un nombre nuevo en la columna `categoria`
- **Forzar actualización inmediata**: en Vercel → Deployments → botón "Redeploy"
