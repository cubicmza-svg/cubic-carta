# Setup del Panel de Admin — CUBIC Café & Bar

## 1. Configurar Google Service Account

### Paso a paso

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear un proyecto nuevo (ej: "cubic-carta")
3. Menú lateral → **APIs y servicios** → **Biblioteca**
4. Buscar **"Google Sheets API"** → Habilitar
5. Menú lateral → **IAM y administración** → **Cuentas de servicio**
6. Click **"Crear cuenta de servicio"**
   - Nombre: `cubic-admin`
   - Click "Crear y continuar" → "Listo"
7. Click en la cuenta creada → pestaña **"Claves"** → **"Agregar clave"** → JSON
8. Se descarga un archivo `.json` con las credenciales

### Dar acceso al Sheet

9. Abrir el archivo JSON descargado, copiar el valor de `client_email`
   (algo como `cubic-admin@cubic-carta.iam.gserviceaccount.com`)
10. En tu Google Sheet → Compartir → Pegar ese email → Rol: **Editor**

### Configurar la variable de entorno

11. Abrir el archivo JSON descargado
12. Copiar TODO el contenido y **convertirlo en una sola línea** (sin saltos de línea)
    - En el JSON, el `private_key` tiene `\n` que deben quedar como `\n` (escaped), no como saltos reales
13. Pegar en `.env.local`:

```
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"cubic-carta",...}
```

> **Tip para Vercel**: En Settings → Environment Variables, pegás el JSON tal cual (multi-línea está OK en Vercel).

---

## 2. Configurar Cloudinary

1. Crear cuenta gratuita en [cloudinary.com](https://cloudinary.com)
2. Dashboard → copiar:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Pegar en `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnop
```

---

## 3. Preparar el Google Sheet

### Hoja `carta` — agregar columnas nuevas

La hoja `carta` ya existe. Agregar estas 3 columnas al final:

| Columna H | Columna I | Columna J |
|-----------|-----------|-----------|
| `id`      | `activo`  | `orden`   |

Para los ítems existentes:
- Columna `activo`: poner `TRUE` en todas las filas
- Columna `orden`: poner 1, 2, 3... en orden dentro de cada subcategoría
- Columna `id`: dejar vacío por ahora (el panel admin los asigna automáticamente)

### Hoja `usuarios` — crear nueva pestaña

1. En el Google Sheet → click `+` para agregar hoja nueva
2. Renombrarla como **`usuarios`** (exactamente así)
3. Fila 1 (encabezados):

| A    | B       | C               | D       | E    | F       |
|------|---------|-----------------|---------|------|---------|
| `id` | `email` | `password_hash` | `nombre`| `rol`| `activo`|

4. Agregar el primer usuario (fila 2). Para generar el hash de la contraseña, correr en terminal:

```bash
node -e "const b=require('bcryptjs'); b.hash('cubic2024',10).then(h=>console.log(h))"
```

Copiar el hash resultante (empieza con `$2b$10$...`) y pegarlo en la columna `password_hash`.

Fila 2 completa:
```
1 | admin@cubic.com | $2b$10$... | Admin CUBIC | superadmin | TRUE
```

> ⚠ **Importante**: Cambiar la contraseña después del primer login.

---

## 4. Variables de entorno completas

Archivo `.env.local` (desarrollo):

```env
# NextAuth
NEXTAUTH_SECRET=cambiar_por_string_random_largo
NEXTAUTH_URL=http://localhost:3000

# Google Sheets
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_SHEET_ID=1TC8UYlQR0wpF4cUQYyYYqs6bUQpZvjRCVAsfXR6PfZg

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud
CLOUDINARY_API_KEY=tu_key
CLOUDINARY_API_SECRET=tu_secret
```

---

## 5. Deploy en Vercel

1. En [vercel.com](https://vercel.com) → tu proyecto `cubic-carta` → **Settings** → **Environment Variables**
2. Agregar cada variable del `.env.local`
   - Para `NEXTAUTH_URL`: usar la URL real del deploy (ej: `https://cubic-carta.vercel.app`)
   - Para `NEXTAUTH_SECRET`: generar con `openssl rand -base64 32`
3. **Redeploy** el proyecto para que tome las nuevas variables

---

## 6. Primer acceso al panel

1. Ir a `tu-dominio.vercel.app/admin`
2. Login con `admin@cubic.com` / `cubic2024`
3. Ir a **Usuarios** → cambiar la contraseña

---

## 7. Uso del panel

### Agregar un ítem nuevo
1. Admin → Carta → **+ Agregar ítem**
2. Completar categoría, nombre, precio
3. Subir foto (drag & drop o URL)
4. Click **Agregar ítem** → aparece en la carta pública en ≤5 minutos

### Ocultar un plato agotado
- En la lista de la carta → toggle del ítem a **OFF**
- El plato desaparece de la carta pública inmediatamente (próxima revalidación)

### Agregar imágenes desde el panel
- El panel permite subir fotos directo (hasta 5 MB, JPG/PNG/WebP)
- Se suben automáticamente a Cloudinary
- La URL se guarda en el Google Sheet

---

## Roles

| Rol         | Dashboard | Carta | Usuarios |
|-------------|-----------|-------|----------|
| `admin`     | ✓         | ✓     | ✗        |
| `superadmin`| ✓         | ✓     | ✓        |
