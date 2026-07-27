/**
 * Referencia simple de categoría dentro de un producto.
 *
 * Coincide con la respuesta del backend:
 * category: { id, name }
 */
export interface ProductCategory {
    id: string;
    name: string;
}

/**
 * Referencia simple de marca dentro de un producto.
 *
 * La marca puede ser null porque en el backend Product.brand es opcional.
 */
export interface ProductBrand {
    id: string;
    name: string;
}

/**
 * Representa un producto recibido desde el backend.
 *
 * Debe coincidir con ProductResponse del backend.
 */
export interface Product {
    id: string;
    code: string;
    barcode: string | null;
    name: string;
    description: string | null;
    purchase_price: number;
    sale_price: number;
    stock: number;
    min_stock: number;
    is_low_stock: boolean;
    is_active: boolean;
    category: ProductCategory;
    brand: ProductBrand | null;
    created_at: string;
    updated_at: string;
}

/**
 * Datos enviados al crear un producto.
 *
 * Endpoint:
 * POST /products
 */
export interface CreateProductRequest {
    code: string;
    barcode?: string | null;
    name: string;
    description?: string | null;
    purchase_price: number;
    sale_price: number;
    stock: number;
    min_stock: number;
    category_id: string;
    brand_id?: string;
    is_active?: boolean;
}

/**
 * Datos enviados al actualizar un producto.
 *
 * Endpoint:
 * PATCH /products/:id
 *
 * Los campos son opcionales porque PATCH permite actualización parcial.
 */
export interface UpdateProductRequest {
    code?: string;
    barcode?: string | null;
    name?: string;
    description?: string | null;
    purchase_price?: number;
    sale_price?: number;
    stock?: number;
    min_stock?: number;
    category_id?: string;
    brand_id?: string;
    is_active?: boolean;
}

/**
 * Filtros aceptados por el listado de productos.
 *
 * Endpoint:
 * GET /products?page=1&limit=10&search=agua&category_id=...&is_active=true
 */
export interface ProductFilters {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: string;
    brand_id?: string;
    is_active?: boolean;
    low_stock?: boolean;
}