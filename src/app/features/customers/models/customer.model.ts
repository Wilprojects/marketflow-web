/**
 * Tipos de documento disponibles para clientes.
 *
 * Deben coincidir con los valores aceptados por el backend.
 */
export type CustomerDocumentType = 'DNI' | 'RUC' | 'CE' | 'PASSPORT' | 'OTHER';

/**
 * Representa un cliente recibido desde el backend.
 *
 * Debe coincidir con CustomerResponse del backend.
 */
export interface Customer {
    id: string;
    document_type: CustomerDocumentType;
    document_number: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Datos enviados al crear un cliente.
 *
 * Endpoint:
 * POST /customers
 */
export interface CreateCustomerRequest {
    document_type: CustomerDocumentType;
    document_number: string;
    first_name: string;
    last_name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    is_active?: boolean;
}

/**
 * Datos enviados al actualizar un cliente.
 *
 * Endpoint:
 * PATCH /customers/:id
 *
 * Los campos son opcionales porque PATCH permite actualización parcial.
 */
export interface UpdateCustomerRequest {
    document_type?: CustomerDocumentType;
    document_number?: string;
    first_name?: string;
    last_name?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    is_active?: boolean;
}

/**
 * Filtros aceptados por el listado de clientes.
 *
 * Endpoint:
 * GET /customers?page=1&limit=10&search=juan&is_active=true
 */
export interface CustomerFilters {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
}