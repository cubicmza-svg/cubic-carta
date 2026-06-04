# Setup — CUBIC Carta Digital (Neon PostgreSQL)

## Arquitectura

```
Carta pública  →  Next.js  →  Neon PostgreSQL
Panel admin    →  Next.js  →  Neon PostgreSQL
Variable conn  →  ALMACENAMIENTO_URL
```

Sin Google Sheets, sin Apps Script, sin KV. Todo en una base de datos PostgreSQL.

---

## 1. Crear la base de datos en Neon

1. Ir a [console.neon.tech](https://console.neon.tech) → **Create a project**
2. Nombre: `cubic-carta`, región: la más cercana
3. En el dashboard del proyecto → **Connection Details**
4. Seleccionar **Connection string** → copiar la URL completa:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

> La tabla `menu_items` **se crea automáticamente** al hacer seed — no necesitás correr SQL manual.

---

## 2. Variables de entorno

### En `.env.local` (desarrollo local)
```env
ADMIN_PASSWORD=cubic2024
ALMACENAMIENTO_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
```

### En Vercel (producción)
1. Vercel Dashboard → tu proyecto → **Settings** → **Environment Variables**
2. Agregar:

| Variable | Valor |
|---|---|
| `ADMIN_PASSWORD` | tu contraseña segura |
| `ALMACENAMIENTO_URL` | connection string de Neon |

---

## 3. Cargar la carta inicial (primer uso)

1. Deployar en Vercel (o correr localmente con `.env.local` configurado)
2. Ir a `tu-dominio/admin` → ingresar con la contraseña
3. Click **🌱 Datos iniciales** → confirmar
4. Se crean la tabla y se insertan los ~140 ítems

La carta pública en `/` ya mostrará los datos.

---

## 4. Schema de la tabla

```sql
CREATE TABLE menu_items (
  id                 SERIAL PRIMARY KEY,
  categoria          TEXT    NOT NULL DEFAULT '',
  subcategoria       TEXT    NOT NULL DEFAULT '',
  nombre             TEXT    NOT NULL DEFAULT '',
  descripcion        TEXT    NOT NULL DEFAULT '',
  precio             INTEGER NOT NULL DEFAULT 0,
  precio_alternativo TEXT    NOT NULL DEFAULT '',
  imagen_url         TEXT    NOT NULL DEFAULT '',
  activo             BOOLEAN NOT NULL DEFAULT TRUE,
  orden              INTEGER NOT NULL DEFAULT 0
);
```

---

## 5. Uso del panel `/admin`

| Acción | Cómo |
|---|---|
| Ver ítems | Botón **☰ ÍTEMS** |
| Agregar ítem | Botón **+ AGREGAR ÍTEM** |
| Editar ítem | Ícono **✎** en la fila |
| Eliminar ítem | Ícono **🗑** → confirmar **Sí** |
| Ocultar plato agotado | Editar → desmarcar "Visible en la carta" |
| Cargar carta inicial | Botón **🌱 Datos iniciales** (⚠ reemplaza todo) |
| Subir imagen | Tab **📁 Archivo** → JPEG/PNG, comprime automáticamente |

---

## 6. Imágenes

**Opción A — Subir desde el dispositivo:**
- Tab 📁 Archivo en el formulario
- Se comprime a ≤420px JPEG 72% y se guarda en la columna `imagen_url` como base64

**Opción B — URL externa:**
- Tab 🔗 URL → pegar URL pública (Google Drive, Imgur, etc.)
- Para Drive: `https://drive.google.com/uc?export=view&id=FILE_ID`

---

## 7. Plan gratuito de Neon

| Recurso | Límite |
|---|---|
| Almacenamiento | 512 MB |
| Compute hours | 191.9 h/mes |
| Proyectos | 1 |
| Ramas | 10 |

Con ~140 ítems y fotos base64 ≈ 4MB total — muy por debajo del límite.
