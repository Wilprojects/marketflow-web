import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),  //Manejo global de errores del navegador.
    provideZoneChangeDetection({ eventCoalescing: true }),  //Configuración de detección de cambios usando Zone.js.
    /**
     * Configuración de rutas.
     *
     * withComponentInputBinding permite enlazar parámetros de ruta
     * con inputs de componentes.
     */
    provideRouter(routes, withComponentInputBinding()),
    /**
     * Configuración de HttpClient con interceptor JWT.
     *
     * Todas las peticiones hechas con HttpClient pasarán por jwtInterceptor.
     */
    provideHttpClient(withInterceptors([jwtInterceptor])),
  ]
};
