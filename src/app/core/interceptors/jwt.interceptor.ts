import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { TokenService } from "../services/token.service";
import { SessionService } from "../services/session.service";
import { environment } from "../../../environments/environment";
import { catchError, throwError } from "rxjs";


/**
 * Interceptor JWT.
 *
 * Un interceptor permite modificar las peticiones HTTP antes de que salgan
 * hacia el backend.
 *
 * En este caso:
 * - agrega Authorization: Bearer TOKEN en peticiones protegidas.
 * - limpia la sesión si el backend responde 401.
 */
export const jwtInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn,) => {
    const tokenService = inject(TokenService);
    const sessionService = inject(SessionService);
    const router = inject(Router);

    /**
     * Obtenemos el token guardado en localStorage.
     */
    const token = tokenService.getToken();

    /**
     * Solo queremos agregar el token a peticiones que vayan
     * hacia nuestra API de MarketFlow.
     *
     * Esto evita enviar el JWT a URLs externas por error.
     */
    const isApiRequest = request.url.startsWith(environment.apiUrl);

    /**
     * No agregamos token a login o register.
     *
     * El usuario todavía no está autenticado en esas rutas.
     */
    const isAuthRequest = request.url.includes('/auth/login') || request.url.includes('/auth/register');

    /**
     * Si existe token, la petición es hacia la API y no es login/register,
     * clonamos la petición y agregamos el header Authorization.
     *
     * Las HttpRequest son inmutables en Angular, por eso se usa clone().
     */
    const authRequest = token && isApiRequest && !isAuthRequest ? request.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`,
        },
    })
    : request;

    /**
     * Continuamos la petición.
     *
     * Si el backend responde 401, significa que:
     * - el token no existe
     * - el token expiró
     * - el token es inválido
     */
    return next(authRequest).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && isApiRequest && !isAuthRequest) {
                /**
                 * Limpiamos token y usuario para evitar dejar una sesión inválida.
                 */
                tokenService.removeToken();
                sessionService.clearUser();

                /**
                 * Redirigimos al login.
                 */
                router.navigateByUrl('/auth/login');
            }

            /**
             * Reenviamos el error para que el componente también pueda manejarlo.
             */
            return throwError(() => error);
        }),
    );
};