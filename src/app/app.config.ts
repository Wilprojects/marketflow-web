import { ApplicationConfig, DEFAULT_CURRENCY_CODE, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';

/**
 * Registramos los datos regionales para Perú.
 *
 * Esto permite que Angular formatee fechas, números y moneda
 * usando configuración local peruana.
 */
registerLocaleData(localeEsPe);

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
     * El interceptor agregará Authorization: Bearer TOKEN
     * en las peticiones al backend.
     */
    provideHttpClient(withInterceptors([jwtInterceptor])),
    /**
     * Locale global para fechas, números y monedas.
     */
    {
      provide: LOCALE_ID,
      useValue: 'es-PE',
    },

    /**
     * Moneda por defecto para CurrencyPipe.
     */
    {
      provide: DEFAULT_CURRENCY_CODE,
      useValue: 'PEN',
    },
  ]
};
