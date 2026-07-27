import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";

/**
 * AuthGuard.
 *
 * Protege rutas que requieren usuario autenticado.
 *
 * Si el usuario tiene token:
 * - permite entrar.
 *
 * Si no tiene token:
 * - redirige a /auth/login.
 */
export const authGuard: CanActivateFn = (_route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    /**
     * Si existe token, permitimos acceder a la ruta.
     */
    if (authService.isAuthenticated()) {
        return true;
    }

    /**
     * Si no hay token, redirigimos al login.
     *
     * También enviamos returnUrl para saber a qué ruta quería entrar
     * el usuario originalmente.
     */
    return router.createUrlTree(['/auth/login'], {
        queryParams: {
            returnUrl: state.url,
        },
    });
};