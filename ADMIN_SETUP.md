# Setup del Panel de Admin — CUBIC Café & Bar

El panel vive en `/admin`. Solo necesitás configurar 3 cosas:

---

## 1. Contraseña de acceso

En Vercel → Settings → Environment Variables, agregar:

```
ADMIN_PASSWORD = cubic2024
```

> Cambiar por una contraseña segura antes de deployar.

---

## 2. Mostrar el Sheet en el panel

La variable `NEXT_PUBLIC_SHEET_ID` ya está configurada con el ID de tu Sheet.
Verificar que en `.env.local` y en Vercel diga:

```
NEXT_PUBLIC_SHEET_ID = 1TC8UYlQR0wpF4cUQYyYYqs6bUQpZvjRCVAsfXR6PfZg
```

El panel abre el Sheet embebido. Para **editar**, el dueño del Sheet necesita estar
logueado en su cuenta de Google en ese navegador.

---

## 3. Configurar Apps Script para agregar ítems

El formulario del panel escribe filas en el Sheet via un Google Apps Script.

### Paso a paso (5 minutos)

1. Abrir el Google Sheet
2. Menú → **Extensiones** → **Apps Script**
3. Borrar todo el código que hay y pegar esto:

```javascript
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('carta');
    var data = JSON.parse(e.postData.contents);

    var id = Utilities.getUuid();
    var lastRow = sheet.getLastRow();
    var orden = lastRow; // orden = número de fila, ajustable

    sheet.appendRow([
      data.categoria      || '',
      data.subcategoria   || '',
      data.nombre         || '',
      data.descripcion    || '',
      data.precio         || 0,
      data.precio_alternativo || '',
      data.imagen_url     || '',
      id,
      data.activo !== false ? 'TRUE' : 'FALSE',
      orden
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, id: id }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Guardar (Ctrl+S) → nombre del proyecto: `cubic-admin`
5. Click **"Implementar"** → **"Nueva implementación"**
6. Tipo: **"Aplicación web"**
7. Ejecutar como: **"Yo"**
8. Quién tiene acceso: **"Cualquier persona"** (anonymous)
9. Click **"Implementar"** → Autorizar → Copiar la URL que aparece

La URL tiene este formato:
```
https://script.google.com/macros/s/AKfycb.../exec
```

10. Pegar esa URL en Vercel → Environment Variables:

```
APPS_SCRIPT_URL = https://script.google.com/macros/s/TU_SCRIPT_ID/exec
```

11. Redeploy en Vercel

---

## Variables de entorno en Vercel

| Variable | Valor |
|---|---|
| `ADMIN_PASSWORD` | tu contraseña segura |
| `NEXT_PUBLIC_SHEET_ID` | `1TC8UYlQR0wpF4cUQYyYYqs6bUQpZvjRCVAsfXR6PfZg` |
| `APPS_SCRIPT_URL` | URL copiada del paso 9 |

---

## Agregar imágenes

1. Subir foto a Google Drive
2. Click derecho → Compartir → "Cualquier persona con el enlace puede ver"
3. Click derecho → "Obtener enlace" → copiar el `FILE_ID` de la URL
4. Construir: `https://drive.google.com/uc?export=view&id=FILE_ID`
5. Pegar esa URL en el campo "URL de imagen" del formulario

---

## Uso del panel

- Ir a `tu-dominio.vercel.app/admin`
- Ingresar la contraseña
- **Columna izquierda**: el Sheet embebido (editá celdas directo, requiere estar logueado en Google)
- **Columna derecha**: formulario para agregar ítems nuevos rápidamente
- Para editar un ítem existente: hacerlo directo en el Sheet embebido o abrirlo en nueva pestaña
