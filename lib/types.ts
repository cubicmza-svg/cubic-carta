export interface MenuItem {
  id: string;
  categoria: string;
  subcategoria: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_alternativo: string;
  imagen_url: string; // URL externa o base64 data URL
  activo: boolean;
  orden: number;
}

export interface MenuGroup {
  categoria: string;
  subcategorias: Record<string, MenuItem[]>;
}
