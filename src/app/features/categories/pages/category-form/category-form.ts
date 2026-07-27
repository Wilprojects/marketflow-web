import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoriesService } from '../../services/categories.service';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { getApiErrorMessage } from '../../../../core/utils/error-message.util';
import { CreateCategoryRequest } from '../../models/category.model';

/**
 * Formulario de categoría.
 *
 * Se usa para:
 * - crear categoría
 * - editar categoría
 *
 * La diferencia se detecta por la URL:
 * - /categories/new       -> crear
 * - /categories/:id/edit  -> editar
 */
@Component({
  selector: 'app-category-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
})
export class CategoryForm {

  private readonly formBuilder = inject(FormBuilder);
  private readonly categoriesService = inject(CategoriesService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /**
   * Id recibido desde la URL.
   *
   * Si existe, estamos en modo edición.
   */
  private categoryId: string | null = null;

  /**
   * Indica si el formulario está en modo edición.
   */
  isEditMode = false;

  /**
   * Estado de carga cuando se consulta la categoría.
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
   * Formulario reactivo de categoría.
   */
  readonly categoryForm = this.formBuilder.nonNullable.group({
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
    this.categoryId = this.activatedRoute.snapshot.paramMap.get('id');
    this.isEditMode = !!this.categoryId;

    if (this.isEditMode && this.categoryId) {
      this.loadCategory(this.categoryId);
    }
  }

  /**
   * Getters para simplificar validaciones en el HTML.
   */
  get name() {
    return this.categoryForm.controls.name;
  }

  get description() {
    return this.categoryForm.controls.description;
  }

  /**
   * Carga los datos de una categoría para edición.
   */
  private loadCategory(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.categoriesService
      .getCategoryById(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (category) => {
          this.categoryForm.patchValue({
            name: category.name,
            description: category.description ?? '',
            is_active: category.is_active,
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
   * Si estamos en modo creación, llama POST /categories.
   * Si estamos en modo edición, llama PATCH /categories/:id.
   */
  onSubmit(): void {
    this.errorMessage = null;

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const payload = this.buildPayload();

    const request$ =
      this.isEditMode && this.categoryId
        ? this.categoriesService.updateCategory(this.categoryId, payload)
        : this.categoriesService.createCategory(payload);

    request$
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/categories');
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = getApiErrorMessage(error);
        },
      });
  }

  /**
   * Construye el payload para enviar al backend.
   *
   * Convertimos descripción vacía en null para evitar guardar strings vacíos.
   */
  private buildPayload(): CreateCategoryRequest {
    const rawValue = this.categoryForm.getRawValue();

    const description = rawValue.description.trim();

    return {
      name: rawValue.name.trim(),
      description: description.length > 0 ? description : null,
      is_active: rawValue.is_active,
    };
  }

}
