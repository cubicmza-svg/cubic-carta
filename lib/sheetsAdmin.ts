import { google } from 'googleapis';
import type { MenuItem, AdminUser } from './types';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!;

function getSheets() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

// ─── Carta sheet ─────────────────────────────────────────────────────────────
// Columns: A=categoria B=subcategoria C=nombre D=descripcion E=precio
//          F=precio_alternativo G=imagen_url H=id I=activo J=orden

function rowToItem(row: string[]): MenuItem {
  return {
    categoria: row[0] ?? '',
    subcategoria: row[1] ?? '',
    nombre: row[2] ?? '',
    descripcion: row[3] ?? '',
    precio: parseFloat(row[4]) || 0,
    precio_alternativo: row[5] ?? '',
    imagen_url: row[6] ?? '',
    id: row[7] ?? '',
    activo: (row[8] ?? 'TRUE').toUpperCase() !== 'FALSE',
    orden: parseInt(row[9]) || 0,
  };
}

function itemToRow(item: Partial<MenuItem> & { id: string }): string[] {
  return [
    item.categoria ?? '',
    item.subcategoria ?? '',
    item.nombre ?? '',
    item.descripcion ?? '',
    String(item.precio ?? 0),
    item.precio_alternativo ?? '',
    item.imagen_url ?? '',
    item.id,
    item.activo !== false ? 'TRUE' : 'FALSE',
    String(item.orden ?? 0),
  ];
}

async function getCartaRows(): Promise<{ rows: string[][]; sheetId: number }> {
  const sheets = getSheets();
  const [valuesRes, metaRes] = await Promise.all([
    sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'carta!A:J',
    }),
    sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID }),
  ]);

  const rows = (valuesRes.data.values ?? []) as string[][];
  const cartaSheet = metaRes.data.sheets?.find(
    (s) => s.properties?.title === 'carta'
  );
  const sheetId = cartaSheet?.properties?.sheetId ?? 0;
  return { rows, sheetId };
}

export async function getAllItems(): Promise<MenuItem[]> {
  const { rows } = await getCartaRows();
  return rows
    .slice(1) // skip header
    .filter((row) => row[2]) // must have nombre
    .map((row) => rowToItem(row));
}

export async function addItem(
  item: Omit<MenuItem, 'id'>
): Promise<MenuItem> {
  const sheets = getSheets();
  const id = crypto.randomUUID();
  const newItem: MenuItem = { ...item, id };
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'carta!A:J',
    valueInputOption: 'RAW',
    requestBody: { values: [itemToRow(newItem)] },
  });
  return newItem;
}

export async function updateItem(
  id: string,
  updates: Partial<MenuItem>
): Promise<MenuItem> {
  const sheets = getSheets();
  const { rows } = await getCartaRows();

  const rowIndex = rows.findIndex((row, i) => i > 0 && row[7] === id);
  if (rowIndex === -1) throw new Error(`Item ${id} not found`);

  const existing = rowToItem(rows[rowIndex]);
  const updated: MenuItem = { ...existing, ...updates, id };
  const sheetRow = rowIndex + 1; // 1-indexed

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `carta!A${sheetRow}:J${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: { values: [itemToRow(updated)] },
  });
  return updated;
}

export async function deleteItem(id: string): Promise<void> {
  const sheets = getSheets();
  const { rows, sheetId } = await getCartaRows();

  const rowIndex = rows.findIndex((row, i) => i > 0 && row[7] === id);
  if (rowIndex === -1) throw new Error(`Item ${id} not found`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });
}

export async function toggleItem(id: string, activo: boolean): Promise<void> {
  await updateItem(id, { activo });
}

// ─── Usuarios sheet ──────────────────────────────────────────────────────────
// Columns: A=id B=email C=password_hash D=nombre E=rol F=activo

function rowToUser(row: string[]): AdminUser {
  return {
    id: row[0] ?? '',
    email: row[1] ?? '',
    password_hash: row[2] ?? '',
    nombre: row[3] ?? '',
    rol: (row[4] as 'superadmin' | 'admin') ?? 'admin',
    activo: (row[5] ?? 'TRUE').toUpperCase() !== 'FALSE',
  };
}

function userToRow(u: AdminUser): string[] {
  return [u.id, u.email, u.password_hash, u.nombre, u.rol, u.activo ? 'TRUE' : 'FALSE'];
}

export async function getUsers(): Promise<AdminUser[]> {
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'usuarios!A2:F',
    });
    return ((res.data.values ?? []) as string[][])
      .filter((row) => row[0])
      .map((row) => rowToUser(row));
  } catch {
    return [];
  }
}

export async function addUser(user: Omit<AdminUser, 'id'>): Promise<AdminUser> {
  const sheets = getSheets();
  const id = crypto.randomUUID();
  const newUser: AdminUser = { ...user, id };
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'usuarios!A:F',
    valueInputOption: 'RAW',
    requestBody: { values: [userToRow(newUser)] },
  });
  return newUser;
}

export async function updateUser(
  id: string,
  updates: Partial<AdminUser>
): Promise<AdminUser> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'usuarios!A:F',
  });
  const rows = ((res.data.values ?? []) as string[][]);
  const rowIndex = rows.findIndex((row, i) => i > 0 && row[0] === id);
  if (rowIndex === -1) throw new Error(`User ${id} not found`);

  const existing = rowToUser(rows[rowIndex]);
  const updated: AdminUser = { ...existing, ...updates, id };
  const sheetRow = rowIndex + 1;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `usuarios!A${sheetRow}:F${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: { values: [userToRow(updated)] },
  });
  return updated;
}
