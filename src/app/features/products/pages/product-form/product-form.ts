import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CreateProductRequest, Product } from '../../models/product.model';
import { ProductsService } from '../../services/products.service';
import { CategoriesService } from '../../../categories/services/categories.service';
import { BrandsService } from '../../../brands/services/brands.service';
import { finalize, forkJoin } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { getApiErrorMessage } from '../../../../core/utils/error-message.util';


/**
 * Opción simple usada en selects.
 */
interface SelectOption {
  id: string;
  name: string;
}

/**
 * Formulario de producto.
 *
 * Se usa para:
 * - crear producto
 * - editar producto
 *
 * La diferencia se detecta por la URL:
 * - /products/new       -> crear
 * - /products/:id/edit  -> editar
 */
@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {

  private readonly formBuilder = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly brandsService = inject(BrandsService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /**
   * Id recibido desde la URL.
   *
   * Si existe, estamos en modo edición.
   */
  private productId: string | null = null;

  /**
   * Indica si el formulario está creando o editando.
   */
  isEditMode = false;

  /**
   * Opciones para selects.
   */
  categoryOptions: SelectOption[] = [];
  brandOptions: SelectOption[] = [];

  /**
   * Estado de carga inicial.
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
   * Formulario reactivo de producto.
   *
   * Los nombres de campos se alinean con el backend.
   */
  readonly productForm = this.formBuilder.nonNullable.group({
    code: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ],
    ],
    barcode: ['', [Validators.maxLength(100)]],
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(150),
      ],
    ],
    description: ['', [Validators.maxLength(300)]],
    purchase_price: [0, [Validators.required, Validators.min(0.01)]],
    sale_price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^\d+$/),
      ],
    ],
    min_stock: [
      5,
      [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^\d+$/),
      ],
    ],
    category_id: ['', [Validators.required]],
    brand_id: [''],
    is_active: [true],
  });

  /**
   * Al iniciar, detectamos si estamos creando o editando.
   */
  ngOnInit(): void {
    this.productId = this.activatedRoute.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;

    if (this.isEditMode && this.productId) {
      this.loadEditData(this.productId);
    } else {
      this.loadCreateData();
    }
  }

  /**
   * Getters para usar validaciones fácilmente en el HTML.
   */
  get code() {
    return this.productForm.controls.code;
  }

  get barcode() {
    return this.productForm.controls.barcode;
  }

  get name() {
    return this.productForm.controls.name;
  }

  get description() {
    return this.productForm.controls.description;
  }

  get purchasePrice() {
    return this.productForm.controls.purchase_price;
  }

  get salePrice() {
    return this.productForm.controls.sale_price;
  }

  get stock() {
    return this.productForm.controls.stock;
  }

  get minStock() {
    return this.productForm.controls.min_stock;
  }

  get categoryId() {
    return this.productForm.controls.category_id;
  }

  /**
   * Carga categorías y marcas activas para crear producto.
   */
  private loadCreateData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin({
      categories: this.categoriesService.getCategories({
        page: 1,
        limit: 100,
        is_active: true,
      }),
      brands: this.brandsService.getBrands({
        page: 1,
        limit: 100,
        is_active: true,
      }),
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: ({ categories, brands }) => {
          this.categoryOptions = categories.data.map((category) => ({
            id: category.id,
            name: category.name,
          }));

          this.brandOptions = brands.data.map((brand) => ({
            id: brand.id,
            name: brand.name,
          }));
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = getApiErrorMessage(error);
        },
      });
  }

  /**
   * Carga:
   * - categorías activas
   * - marcas activas
   * - producto a editar
   */
  private loadEditData(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin({
      categories: this.categoriesService.getCategories({
        page: 1,
        limit: 100,
        is_active: true,
      }),
      brands: this.brandsService.getBrands({
        page: 1,
        limit: 100,
        is_active: true,
      }),
      product: this.productsService.getProductById(id),
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: ({ categories, brands, product }) => {
          this.categoryOptions = categories.data.map((category) => ({
            id: category.id,
            name: category.name,
          }));

          this.brandOptions = brands.data.map((brand) => ({
            id: brand.id,
            name: brand.name,
          }));

          /**
           * Si la categoría o marca del producto no aparece en las opciones
           * activas, la agregamos para que el formulario pueda mostrarla.
           */
          this.ensureCurrentProductOptions(product);

          this.productForm.patchValue({
            code: product.code,
            barcode: product.barcode ?? '',
            name: product.name,
            description: product.description ?? '',
            purchase_price: product.purchase_price,
            sale_price: product.sale_price,
            stock: product.stock,
            min_stock: product.min_stock,
            category_id: product.category.id,
            brand_id: product.brand?.id ?? '',
            is_active: product.is_active,
          });
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = getApiErrorMessage(error);
        },
      });
  }

  /**
   * Asegura que la categoría/marca actual del producto exista
   * dentro de las opciones del formulario.
   *
   * Esto ayuda cuando el producto está asociado a una categoría o marca
   * que luego fue desactivada.
   */
  private ensureCurrentProductOptions(product: Product): void {
    const hasCategory = this.categoryOptions.some(
      (category) => category.id === product.category.id,
    );

    if (!hasCategory) {
      this.categoryOptions = [
        {
          id: product.category.id,
          name: product.category.name,
        },
        ...this.categoryOptions,
      ];
    }

    if (product.brand) {
      const hasBrand = this.brandOptions.some(
        (brand) => brand.id === product.brand?.id,
      );

      if (!hasBrand) {
        this.brandOptions = [
          {
            id: product.brand.id,
            name: product.brand.name,
          },
          ...this.brandOptions,
        ];
      }
    }
  }

  /**
   * Envía el formulario.
   *
   * Si estamos en modo creación, llama POST /products.
   * Si estamos en modo edición, llama PATCH /products/:id.
   */
  onSubmit(): void {
    this.errorMessage = null;

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();

    /**
     * Validación visual antes de enviar.
     *
     * El backend también valida precios, pero hacerlo aquí mejora
     * la experiencia del usuario.
     */
    if (payload.sale_price < payload.purchase_price) {
      this.errorMessage = 'El precio de venta no puede ser menor que el precio de compra.';
      return;
    }

    this.isSaving = true;

    const request$ =
      this.isEditMode && this.productId
        ? this.productsService.updateProduct(this.productId, payload)
        : this.productsService.createProduct(payload);

    request$
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/products');
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
   * Además:
   * - code se envía en mayúsculas.
   * - strings vacíos opcionales se convierten en null o undefined.
   */
  private buildPayload(): CreateProductRequest {
    const rawValue = this.productForm.getRawValue();

    const barcode = rawValue.barcode.trim();
    const description = rawValue.description.trim();

    return {
      code: rawValue.code.trim().toUpperCase(),
      barcode: barcode.length > 0 ? barcode : null,
      name: rawValue.name.trim(),
      description: description.length > 0 ? description : null,
      purchase_price: Number(rawValue.purchase_price),
      sale_price: Number(rawValue.sale_price),
      stock: Number(rawValue.stock),
      min_stock: Number(rawValue.min_stock),
      category_id: rawValue.category_id,
      brand_id: rawValue.brand_id || undefined,
      is_active: rawValue.is_active,
    };
  }

}
