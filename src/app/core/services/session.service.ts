import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { AuthUser } from "../models/auth.model";
import { RoleName } from "../models/role.model";

/**
 * Servicio responsable de manejar los datos del usuario autenticado.
 *
 * Este servicio guarda el usuario en localStorage y además expone
 * un observable para que otros componentes puedan reaccionar cuando
 * la sesión cambie.
 *
 * Ejemplo:
 * - Navbar puede mostrar el username.
 * - Sidebar puede mostrar opciones según el rol.
 * - Dashboard puede mostrar los datos del usuario actual.
 */
@Injectable({
    providedIn: 'root',
})
export class SessionService {
    /**
     * Clave usada para guardar el usuario autenticado en localStorage.
     */
    private readonly USER_KEY = 'marketflow_auth_user';

    /**
     * BehaviorSubject mantiene el último valor emitido.
     *
     * Iniciamos con el usuario guardado en localStorage, si existe.
     * Esto permite que al recargar la página no se pierda visualmente
     * la información del usuario.
     */
    private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());

    /**
     * Observable público para que los componentes puedan escuchar cambios
     * del usuario actual sin modificarlo directamente.
     */
    readonly currentUser$ = this.currentUserSubject.asObservable();

    /**
     * Guarda el usuario autenticado en localStorage y actualiza el observable.
     */
    setUser(user: AuthUser): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
    }

    /**
     * Devuelve el usuario actual de forma síncrona.
     *
     * Esto es útil para guards o validaciones rápidas de roles.
     */
    getCurrentUser(): AuthUser | null {
        return this.currentUserSubject.value;
    }

    /**
     * Limpia el usuario guardado y notifica a los componentes.
     */
    clearUser(): void {
        localStorage.removeItem(this.USER_KEY);
        this.currentUserSubject.next(null);
    }

    /**
     * Verifica si el usuario tiene un rol específico.
     */
    hasRole(role: RoleName): boolean {
        return this.getCurrentUser()?.roles.includes(role) ?? false;
    }

    /**
     * Verifica si el usuario tiene al menos uno de los roles permitidos.
     *
     * Ejemplo:
     * hasAnyRole([RoleName.ADMIN, RoleName.WAREHOUSE])
     */
    hasAnyRole(roles: RoleName[]): boolean {
        const currentUser = this.getCurrentUser();

        if (!currentUser) {
            return false;
        }

        return roles.some((role) => currentUser.roles.includes(role));
    }

    /**
     * Intenta recuperar el usuario desde localStorage.
     *
     * Si no existe o el JSON está dañado, devuelve null.
     */
    private getStoredUser(): AuthUser | null {
        const storedUser = localStorage.getItem(this.USER_KEY);

        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser) as AuthUser;
        } 
        catch {
            /**
             * Si por algún motivo el valor guardado no es un JSON válido,
             * lo eliminamos para evitar errores futuros.
             */
            localStorage.removeItem(this.USER_KEY);
            return null;
        }
    }
}