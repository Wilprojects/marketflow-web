import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { RoleName } from "../models/role.model";

/**
 * RoleGuard.
 *
 * Protege rutas según roles.
 *
 * Se usará en rutas como:
 *
 * {
 *   path: 'users',
 *   canActivate: [authGuard, roleGuard],
 *   data: {
 *     roles: [RoleName.ADMIN]
 *   }
 * }
 */
export const roleGuard: CanActivateFn = (route) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    /**
     * Leemos los roles permitidos desde la configuración de la ruta.
     */
    const allowedRoles = route.data['roles'] as RoleName[] | undefined;

    /**
     * Si la ruta no define roles, dejamos pasar.
     */
    if (!allowedRoles || allowedRoles.length === 0) {
        return true;
    }

    /**
     * Si el usuario tiene al menos uno de los roles permitidos,
     * puede acceder.
     */
    if (authService.hasAnyRole(allowedRoles)) {
        return true;
    }

    /**
     * Si no tiene permisos, lo enviamos al dashboard.
     */
    return router.createUrlTree(['/dashboard']);
};