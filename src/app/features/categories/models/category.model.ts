/**
 * Representa una categoría recibida desde el backend.
 *
 * Debe coincidir con CategoryResponse del backend.
 */
export interface Category {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Datos enviados al crear una categoría.
 *
 * Endpoint:
 * POST /categories
 */
export interface CreateCategoryRequest {
    name: string;
    description?: string | null;
    is_active?: boolean;
}

/**
 * Datos enviados al actualizar una categoría.
 *
 * Endpoint:
 * PATCH /categories/:id
 */
export interface UpdateCategoryRequest {
    name?: string;
    description?: string | null;
    is_active?: boolean;
}

/**
 * Filtros aceptados por el listado de categorías.
 *
 * Endpoint:
 * GET /categories?page=1&limit=10&search=bebidas&is_active=true
 */
export interface CategoryFilters {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
}