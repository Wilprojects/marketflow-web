import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { getApiErrorMessage } from '../../../core/utils/error-message.util';

/**
 * Componente de Login.
 *
 * Responsabilidades:
 * - mostrar formulario de acceso
 * - validar identifier y password
 * - enviar credenciales al backend
 * - mostrar errores
 * - redirigir al dashboard si el login es correcto
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  /**
   * Controla si se está procesando el login.
   * Sirve para desactivar el botón y mostrar spinner.
   */
  isLoading = false;

  /**
   * Mensaje de error mostrado en pantalla.
   */
  errorMessage: string | null = null;

  /**
   * Formulario reactivo.
   *
   * nonNullable evita que los controles tengan valores null.
   */
  readonly loginForm = this.formBuilder.nonNullable.group({
    /**
     * identifier puede ser username o email.
     */
    identifier: ['', [Validators.required, Validators.minLength(3)]],

    /**
     * Password debe tener mínimo 6 caracteres,
     * igual que la validación del backend.
     */
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /**
   * Si el usuario ya tiene token y entra a /auth/login,
   * lo mandamos directamente al dashboard.
   */
  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/dashboard');
    }
  }

  /**
   * Getter para acceder fácilmente al control identifier desde el HTML.
   */
  get identifier() {
    return this.loginForm.controls.identifier;
  }

  /**
   * Getter para acceder fácilmente al control password desde el HTML.
   */
  get password() {
    return this.loginForm.controls.password;
  }

  /**
   * Se ejecuta cuando el usuario envía el formulario.
   */
  onSubmit(): void {
    /**
     * Limpiamos errores anteriores.
     */
    this.errorMessage = null;

    /**
     * Si el formulario no es válido, marcamos todos los campos
     * como tocados para mostrar los mensajes de validación.
     */
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    /**
     * Enviamos las credenciales al backend.
     *
     * getRawValue() devuelve un objeto con:
     * {
     *   identifier: string,
     *   password: string
     * }
     */
    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(
        /**
         * finalize se ejecuta tanto si la petición funciona
         * como si falla. Lo usamos para apagar el loading.
         */
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: () => {
          /**
           * Si el usuario intentó entrar a una ruta protegida antes del login,
           * authGuard mandó returnUrl como query param.
           *
           * Si no existe returnUrl, lo enviamos al dashboard.
           */
          const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl') || '/dashboard';

          this.router.navigateByUrl(returnUrl);
        },
        error: (error: HttpErrorResponse) => {
          /**
           * Convertimos el error del backend en un mensaje entendible.
           */
          this.errorMessage = getApiErrorMessage(error);
        },
      });
  }

}
