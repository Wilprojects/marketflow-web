import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { RoleName } from './core/models/role.model';

/**
 * Rutas principales de MarketFlow Web.
 *
 * Estructura:
 * - /auth/login no usa layout.
 * - Las rutas internas usan MainLayout.
 */
export const routes: Routes = [

    /**
     * Ruta pública de login.
     */
    {
        path: 'auth/login',
        loadComponent: () =>
            import('./features/auth/login/login').then((component) => component.Login),
    },

    /**
     * Rutas privadas dentro del layout principal.
     */
    {
        path: '',
        canActivate: [authGuard],
        canActivateChild: [authGuard],
        loadComponent: () =>
            import('./layout/main-layout/main-layout').then((component) => component.MainLayout),
            children: [
                {
                    path: '',
                    redirectTo: 'dashboard',
                    pathMatch: 'full',
                },
                {
                    path: 'dashboard',
                    loadComponent: () =>
                        import('./features/dashboard/dashboard/dashboard').then((component) => component.Dashboard),
                },

                /**
                 * Módulos de gestión.
                 * Por ahora apuntan a ComingSoon.
                 */
                {
                    path: 'products',
                    loadComponent: () =>
                        import('./shared/components/coming-soon/coming-soon').then((component) => component.ComingSoon),
                        data: {
                            title: 'Productos',
                            description: 'Gestión de productos, stock, precios y bajo stock.',
                        },
                },
                {
                    path: 'categories',
                    children: [
                        
                        /**
                         * Listado de categorías.
                         *
                         * Cualquier usuario autenticado puede listar categorías.
                         */
                        {
                            path: '',
                            loadComponent: () =>
                                import('./features/categories/pages/category-list/category-list').then((component) => component.CategoryList,),
                        },

                        /**
                         * Crear categoría.
                         *
                         * Solo Administrador y Almacenero.
                         */
                        {
                            path: 'new',
                            canActivate: [roleGuard],
                            loadComponent: () =>
                                import('./features/categories/pages/category-form/category-form').then((component) => component.CategoryForm,),
                            data: {
                                roles: [RoleName.ADMIN, RoleName.WAREHOUSE],
                            },
                        },

                        /**
                         * Editar categoría.
                         *
                         * Solo Administrador y Almacenero.
                         */
                        {
                            path: ':id/edit',
                            canActivate: [roleGuard],
                            loadComponent: () =>
                                import('./features/categories/pages/category-form/category-form').then((component) => component.CategoryForm,),
                            data: {
                                roles: [RoleName.ADMIN, RoleName.WAREHOUSE],
                            },
                        },
                    ],
                },
                {
                    path: 'brands',
                    loadComponent: () =>
                        import('./shared/components/coming-soon/coming-soon').then((component) => component.ComingSoon),
                        data: {
                            title: 'Marcas',
                            description: 'Gestión de marcas de productos.',
                        },
                },

                /**
                 * Ventas: Administrador y Vendedor.
                 */
                {
                    path: 'sales',
                    canActivate: [roleGuard],
                    loadComponent: () =>
                        import('./shared/components/coming-soon/coming-soon').then((component) => component.ComingSoon),
                        data: {
                            roles: [RoleName.ADMIN, RoleName.SELLER],
                            title: 'Ventas',
                            description: 'Registro, consulta y cancelación de ventas.',
                        },
                },

                /**
                 * Compras e inventario: Administrador y Almacenero.
                 */
                {
                    path: 'purchases',
                    canActivate: [roleGuard],
                    loadComponent: () =>
                        import('./shared/components/coming-soon/coming-soon').then((component) => component.ComingSoon),
                        data: {
                            roles: [RoleName.ADMIN, RoleName.WAREHOUSE],
                            title: 'Compras',
                            description: 'Registro, consulta y cancelación de compras.',
                        },
                },
                {
                    path: 'inventory-movements',
                    canActivate: [roleGuard],
                    loadComponent: () =>
                        import('./shared/components/coming-soon/coming-soon').then((component) => component.ComingSoon),
                        data: {
                            roles: [RoleName.ADMIN, RoleName.WAREHOUSE],
                            title: 'Movimientos de inventario',
                            description: 'Entradas, salidas, ajustes e historial de stock.',
                        },
            },

            /**
             * Clientes: Adminsitrador y Vendedor.
             */
            {
                path: 'customers',
                canActivate: [roleGuard],
                loadComponent: () =>
                    import('./shared/components/coming-soon/coming-soon').then((component) => component.ComingSoon,),
                    data: {
                        roles: [RoleName.ADMIN, RoleName.SELLER],
                        title: 'Clientes',
                        description: 'Gestión de clientes del minimarket.',
                    },
            },

            /**
             * Proveedores: Administrador y Vendedor.
             */
            {
                path: 'suppliers',
                canActivate: [roleGuard],
                loadComponent: () =>
                    import('./shared/components/coming-soon/coming-soon').then((component) => component.ComingSoon),
                    data: {
                        roles: [RoleName.ADMIN, RoleName.WAREHOUSE],
                        title: 'Proveedores',
                        description: 'Gestión de proveedores para compras.',
                    },
            },

            /**
             * Reportes y adjuntos.
             */
            {
                path: 'reports',
                loadComponent: () =>
                    import('./shared/components/coming-soon/coming-soon').then((component) => component.ComingSoon,),
                    data: {
                        title: 'Reportes',
                        description: 'Indicadores de ventas, inventario y productos.',
                    },
            },
            {
                path: 'attachments',
                loadComponent: () =>
                    import('./shared/components/coming-soon/coming-soon').then((component) => component.ComingSoon),
                    data: {
                        title: 'Archivos adjuntos',
                        description: 'Gestión de comprobantes, documentos e imágenes.',
                    },
            },

            /**
             * Usuarios y roles: solo Administrador.
             */
            {
                path: 'users',
                canActivate: [roleGuard],
                loadComponent: () =>
                    import('./shared/components/coming-soon/coming-soon').then((component) => component.ComingSoon,),
                    data: {
                        roles: [RoleName.ADMIN],
                        title: 'Usuarios',
                        description: 'Administración de usuarios del sistema.',
                    },
            },
            {
                path: 'roles',
                canActivate: [roleGuard],
                loadComponent: () =>
                    import('./shared/components/coming-soon/coming-soon').then((component) => component.ComingSoon,),
                    data: {
                        roles: [RoleName.ADMIN],
                        title: 'Roles',
                        description: 'Consulta de roles disponibles en MarketFlow.',
                    },
            },
        ],
    },

    /**
     * Ruta comodín.
     */
    {
        path: '**',
        redirectTo: 'dashboard',
    },

];
