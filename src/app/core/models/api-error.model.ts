

/**
 * Modelo genérico para errores que devuelve el backend.
 *
 * NestJS normalmente devuelve errores con esta forma:
 *
 * {
 *   statusCode: 401,
 *   message: 'Credenciales incorrectas',
 *   error: 'Unauthorized'
 * }
 *
 * A veces "message" puede ser un arreglo, especialmente cuando falla
 * la validación de un DTO.
 */
export interface ApiErrorResponse {
    statusCode?: number;
    message?: string | string[];
    error?: string;
}