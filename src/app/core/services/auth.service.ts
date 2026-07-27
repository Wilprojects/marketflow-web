import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { TokenService } from "./token.service";
import { SessionService } from "./session.service";
import { environment } from "../../../environments/environment";
import { LoginRequest, LoginResponse, ProfileResponse } from "../models/auth.model";
import { Observable, tap } from "rxjs";
import { RoleName } from "../models/role.model";

/**
 * Servicio principal de autenticación.
 *
 * Este servicio se encarga de comunicarse con el backend para:
 * - iniciar sesión
 * - obtener perfil
 * - cerrar sesión
 * - consultar si el usuario está autenticado
 * - validar roles
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
    /**
     * inject() es la forma moderna de inyectar dependencias
     * en servicios y guards funcionales.
     */
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly tokenService = inject(TokenService);
    private readonly sessionService = inject(SessionService);

    /**
     * URL base del backend.
     *
     * En desarrollo:
     * http://localhost:3000/api/v1
     */
    private readonly apiUrl = environment.apiUrl;

    /**
     * Inicia sesión contra el backend.
     *
     * Endpoint:
     * POST /auth/login
     *
     * Si el login es correcto:
     * - guarda el access_token
     * - guarda el usuario autenticado
     */
    login(loginRequest: LoginRequest): Observable<LoginResponse> {
        return this.http
            .post<LoginResponse>(`${this.apiUrl}/auth/login`, loginRequest)
            .pipe(
                tap((response) => {
                    /**
                     * Guardamos el token para que el interceptor lo pueda usar
                     * en futuras peticiones protegidas.
                     */
                    this.tokenService.setToken(response.access_token);

                    /**
                     * Guardamos el usuario para mostrarlo en layout, navbar
                     * y validar roles en frontend.
                     */
                    this.sessionService.setUser(response.user);
                }),
            );
    }

    /**
     * Consulta el perfil del usuario autenticado.
     *
     * Endpoint:
     * GET /auth/profile
     *
     * Este endpoint requiere JWT, por eso el interceptor agregará
     * automáticamente el header Authorization.
     */
    getProfile(): Observable<ProfileResponse> {
        return this.http.get<ProfileResponse>(`${this.apiUrl}/auth/profile`).pipe(
            tap((response) => {
                /**
                 * Actualizamos la sesión con la información más reciente
                 * que venga del backend.
                 */
                this.sessionService.setUser(response.user);
            }),
        );
    }

    /**
     * Cierra sesión.
     *
     * Elimina token y usuario guardado, luego redirige al login.
     */
    logout(): void {
        this.tokenService.removeToken();
        this.sessionService.clearUser();
        this.router.navigateByUrl('/auth/login');
    }

    /**
     * Verifica si existe un token guardado.
     *
     * Esta validación es rápida y útil para guards.
     * La validez real del token la confirma el backend.
     */
    isAuthenticated(): boolean {
        return this.tokenService.hasToken();
    }

    /**
     * Verifica si el usuario tiene al menos uno de los roles indicados.
     */
    hasAnyRole(roles: RoleName[]): boolean {
        return this.sessionService.hasAnyRole(roles);
    }
}