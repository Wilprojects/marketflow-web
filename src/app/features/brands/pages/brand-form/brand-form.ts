import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BrandsService } from '../../services/brands.service';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { getApiErrorMessage } from '../../../../core/utils/error-message.util';
import { CreateBrandRequest } from '../../models/brand.model';

/**
 * Formulario de marca.
 *
 * Se usa para:
 * - crear marca
 * - editar marca
 *
 * La diferencia se detecta por la URL:
 * - /brands/new       -> crear
 * - /brands/:id/edit  -> editar
 */
@Component({
  selector: 'app-brand-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './brand-form.html',
  styleUrl: './brand-form.css',
})
export class BrandForm {
  
  private readonly formBuilder = inject(FormBuilder);
  private readonly brandsService = inject(BrandsService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /**
   * Id recibido desde la URL.
   *
   * Si existe, estamos en modo edición.
   */
  private brandId: string | null = null;

  /**
   * Indica si el formulario está creando o editando.
   */
  isEditMode = false;

  /**
   * Estado de carga cuando se consulta una marca existente.
   */
  isLoading = false;

  /**
   * Estado de guardado.
   */
  isSaving = false;

  /**
   * Mensaje de error visible para el usuario.
   */
  errorMessage: string | null = null;

  /**
   * Formulario reactivo de marca.
   */
  readonly brandForm = this.formBuilder.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ],
    ],
    description: ['', [Validators.maxLength(250)]],
    is_active: [true],
  });

  /**
   * Al iniciar, detectamos si estamos creando o editando.
   */
  ngOnInit(): void {
    this.brandId = this.activatedRoute.snapshot.paramMap.get('id');
    this.isEditMode = !!this.brandId;

    if (this.isEditMode && this.brandId) {
      this.loadBrand(this.brandId);
    }
  }

  /**
   * Getter para usar validaciones de name fácilmente en el HTML.
   */
  get name() {
    return this.brandForm.controls.name;
  }

  /**
   * Getter para usar validaciones de description fácilmente en el HTML.
   */
  get description() {
    return this.brandForm.controls.description;
  }

  /**
   * Carga los datos de una marca para edición.
   */
  private loadBrand(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.brandsService
      .getBrandById(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (brand) => {
          this.brandForm.patchValue({
            name: brand.name,
            description: brand.description ?? '',
            is_active: brand.is_active,
          });
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = getApiErrorMessage(error);
        },
      });
  }

  /**
   * Envía el formulario.
   *
   * Si estamos en modo creación, llama POST /brands.
   * Si estamos en modo edición, llama PATCH /brands/:id.
   */
  onSubmit(): void {
    this.errorMessage = null;

    if (this.brandForm.invalid) {
      this.brandForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const payload = this.buildPayload();

    const request$ =
      this.isEditMode && this.brandId
        ? this.brandsService.updateBrand(this.brandId, payload)
        : this.brandsService.createBrand(payload);

    request$
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/brands');
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = getApiErrorMessage(error);
        },
      });
  }

  /**
   * Construye el payload para enviar al backend.
   *
   * Aunque el formulario sirve para crear y editar, siempre enviamos
   * los campos principales completos.
   *
   * Por eso devolvemos CreateBrandRequest:
   * - createBrand necesita name obligatorio.
   * - updateBrand también lo acepta porque UpdateBrandRequest permite
   *   esos mismos campos de forma opcional.
   *
   * Además, convertimos descripción vacía en null para evitar
   * guardar strings vacíos.
   */
  private buildPayload(): CreateBrandRequest {
    const rawValue = this.brandForm.getRawValue();

    const description = rawValue.description.trim();

    return {
      name: rawValue.name.trim(),
      description: description.length > 0 ? description : null,
      is_active: rawValue.is_active,
    };
  }
}
