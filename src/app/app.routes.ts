import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

/**
 * Rutas principales de MarketFlow Web.
 *
 * Tenemos rutas como:
 * - login público
 * - dashboard protegido
 */
export const routes: Routes = [

    /**
     * Ruta raíz.
     *
     * Si el usuario entra a http://localhost:4200,
     * lo enviamos al dashboard.
     *
     * Si no tiene token, authGuard lo mandará al login.
     */
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full',
    },
    /**
     * Ruta pública de login.
     */
    {
        path: 'auth/login',
        loadComponent: () =>
            import('./features/auth/login/login').then((component) => component.Login),
    },
    /**
     * Ruta protegida de dashboard.
     */
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/dashboard/dashboard/dashboard').then((component) => component.Dashboard),
    },
    /**
     * Ruta comodín.
     *
     * Siempre debe ir al final, porque captura cualquier ruta no encontrada.
     */
    {
        path: '**',
        redirectTo: 'dashboard',
    },

];
