export interface MenuItem {
  id: string;
  categoria: string;
  subcategoria: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_alternativo: string;
  imagen_url: string;
  activo: boolean;
  orden: number;
}

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  nombre: string;
  rol: 'superadmin' | 'admin';
  activo: boolean;
}

export interface MenuGroup {
  categoria: string;
  subcategorias: Record<string, MenuItem[]>;
}
