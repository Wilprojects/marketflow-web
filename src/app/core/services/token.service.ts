import { Injectable } from "@angular/core";

/**
 * Servicio responsable de manejar el token JWT.
 *
 * Este servicio centraliza el acceso a localStorage para no repetir
 * localStorage.getItem(), localStorage.setItem() o localStorage.removeItem()
 * en diferentes partes del proyecto.
 *
 * Por el momkento se usará localStorage.
 * Una mejora sería usar cookies HttpOnly.
 */
@Injectable({
    providedIn: 'root',
})
export class TokenService {
    /**
     * Clave con la que se guardará el token en localStorage.
     *
     * Usar una clave clara evita guardar el token con nombres ambiguos.
     */
    private readonly TOKEN_KEY = 'marketflow_access_token';

    /**
     * Guarda el JWT recibido del backend.
     */
    setToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    /**
     * Obtiene el JWT guardado.
     *
     * Si no existe, devuelve null.
     */
    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Elimina el JWT.
     *
     * Se usa al cerrar sesión o cuando el backend devuelve 401.
     */
    removeToken(): void {
        localStorage.removeItem(this.TOKEN_KEY);
    }

    /**
     * Indica si existe un token guardado.
     *
     * Esto no valida si el token expiró, solo verifica si existe.
     * Si el token expiró, el backend responderá 401 y el interceptor
     * limpiará la sesión.
     */
    hasToken(): boolean {
        return !!this.getToken();
    }
}