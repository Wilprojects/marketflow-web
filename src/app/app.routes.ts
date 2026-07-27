import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full',
    },
    {
        path: 'auth/login',
        loadComponent: () =>
            import('./features/auth/login/login').then((component) => component.Login),
    },
    {
        path: '**',
        redirectTo: 'auth/login',
    },

];
