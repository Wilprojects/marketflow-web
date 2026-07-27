/**
 * Representa una marca recibida desde el backend.
 *
 * Debe coincidir con BrandResponse del backend.
 */
export interface Brand {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Datos enviados al crear una marca.
 *
 * Endpoint:
 * POST /brands
 */
export interface CreateBrandRequest {
    name: string;
    description?: string | null;
    is_active?: boolean;
}

/**
 * Datos enviados al actualizar una marca.
 *
 * Endpoint:
 * PATCH /brands/:id
 *
 * Los campos son opcionales porque PATCH permite actualización parcial.
 */
export interface UpdateBrandRequest {
    name?: string;
    description?: string | null;
    is_active?: boolean;
}

/**
 * Filtros aceptados por el listado de marcas.
 *
 * Endpoint:
 * GET /brands?page=1&limit=10&search=coca&is_active=true
 */
export interface BrandFilters {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
}