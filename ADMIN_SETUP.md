# Setup — CUBIC Carta Digital (Vercel KV)

## Arquitectura

```
Carta pública  →  Next.js  →  Vercel KV (Redis)
Panel admin    →  Next.js  →  Vercel KV (Redis)
Imágenes       →  base64 en KV  o  URL externa
```

Sin Google Sheets, sin Apps Script, sin servicios externos.

---

## 1. Crear la base de datos Vercel KV

1. Ir a [vercel.com](https://vercel.com) → tu proyecto → pestaña **Storage**
2. Click **Create Database** → elegir **KV**
3. Nombre: `cubic-kv` → **Create**
4. En la pestaña **.env.local** del KV recién creado → copiar las 3 variables:
   ```
   KV_REST_API_URL=https://...upstash.io
   KV_REST_API_TOKEN=...
   KV_REST_API_READ_ONLY_TOKEN=...
   ```
5. Pegar en tu `.env.local` local

> Las variables se agregan automáticamente al proyecto en Vercel — no hace falta agregarlas manualmente en Settings.

---

## 2. Variables de entorno en `.env.local`

```env
ADMIN_PASSWORD=cubic2024
KV_REST_API_URL=https://YOUR_KV.upstash.io
KV_REST_API_TOKEN=YOUR_TOKEN
KV_REST_API_READ_ONLY_TOKEN=YOUR_READ_ONLY_TOKEN
```

---

## 3. Cargar la carta inicial

1. Deployar en Vercel (o correr localmente con las variables configuradas)
2. Ir a `tu-dominio/admin` → ingresar con la contraseña
3. Click **🌱 Datos iniciales** → confirmar
4. Se cargan todos los ítems de la carta en KV (≈140 ítems)

La carta pública en `/` ya mostrará los datos inmediatamente.

---

## 4. Deploy en Vercel

```bash
git add .
git commit -m "setup: migrar a Vercel KV"
git push
```

Vercel detecta el push y deploya automáticamente. Las variables de KV ya están conectadas al proyecto desde el paso 1.

---

## 5. Uso del panel `/admin`

| Acción | Cómo |
|---|---|
| Ver todos los ítems | Botón **☰ ÍTEMS** |
| Agregar ítem nuevo | Botón **+ AGREGAR ÍTEM** |
| Editar un ítem | Ícono **✎** en la fila |
| Eliminar un ítem | Ícono **🗑** → confirmar con **Sí** |
| Activar/desactivar | Editar → toggle "Visible en la carta" |
| Subir imagen | En el formulario → tab **📁 Archivo** (comprime a JPEG 72%, máx 420px) |
| Cargar carta desde cero | Botón **🌱 Datos iniciales** (⚠ reemplaza todo) |

---

## 6. Imágenes

**Opción A — Subir desde el dispositivo** (recomendado para fotos del local):
- En el formulario de ítem → tab **📁 Archivo**
- Se comprime automáticamente y se guarda como base64 en KV

**Opción B — URL externa** (Drive, Imgur, Cloudinary):
- Tab **🔗 URL** → pegar la URL pública
- Para Google Drive: `https://drive.google.com/uc?export=view&id=FILE_ID`

---

## 7. Límites del plan gratuito de Vercel KV

| Recurso | Límite gratuito |
|---|---|
| Almacenamiento | 256 MB |
| Requests/mes | 30.000 |
| Tamaño por valor | hasta 100 MB |

Con ~140 ítems y fotos base64 de ~30KB c/u → ≈4MB total. Muy por debajo del límite.
