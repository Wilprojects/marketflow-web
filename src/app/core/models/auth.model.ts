import { RoleName } from "./role.model";

/**
 * Usuario autenticado.
 *
 * Esta estructura representa el usuario que devuelve el backend
 * cuando hacemos login o consultamos el perfil.
 */
export interface AuthUser {
    id: string;
    username: string;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    roles: RoleName[];
}

/**
 * Request para iniciar sesión.
 *
 * Nota:
 * El backend de MarketFlow no usa "email" directamente para login.
 * Usa "identifier", porque permite iniciar sesión con username o email.
 *
 * Ejemplo:
 * {
 *   identifier: 'admin',
 *   password: '123456'
 * }
 */
export interface LoginRequest {
    identifier: string;  //Se usa identifier porque puede ser email o username en el backend
    password: string;
}


/**
 * Respuesta del backend al iniciar sesión.
 *
 * El backend devuelve:
 * - access_token: JWT que se usará para acceder a rutas protegidas.
 * - user: información básica del usuario autenticado.
 */
export interface LoginResponse {
    access_token: string;
    user: AuthUser;
}

/**
 * Respuesta del endpoint:
 * GET /auth/profile
 *
 * El backend devuelve un objeto con la propiedad "user".
 */
export interface ProfileResponse {
    user: AuthUser;
}