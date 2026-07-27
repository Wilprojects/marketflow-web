import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { CreateProductRequest, Product, ProductFilters, UpdateProductRequest } from "../models/product.model";
import { PaginatedResponse } from "../../../core/models/pagination.model";
import { Observable } from "rxjs";

/**
 * Servicio de productos.
 *
 * Responsabilidad:
 * Comunicarse con el backend para listar, buscar, crear,
 * actualizar, activar y desactivar productos.
 */
@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);

  /**
   * URL base del backend.
   *
   * Ejemplo:
   * http://localhost:3000/api/v1
   */
  private readonly apiUrl = environment.apiUrl;

  /**
   * Obtiene productos con filtros y paginación.
   *
   * Endpoint:
   * GET /products
   */
  getProducts(filters: ProductFilters = {}): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();

    /**
     * Agregamos query params solo si tienen valor.
     * Esto evita enviar parámetros vacíos al backend.
     */
    if (filters.page) {
      params = params.set('page', filters.page);
    }

    if (filters.limit) {
      params = params.set('limit', filters.limit);
    }

    if (filters.search) {
      params = params.set('search', filters.search);
    }

    if (filters.category_id) {
      params = params.set('category_id', filters.category_id);
    }

    if (filters.brand_id) {
      params = params.set('brand_id', filters.brand_id);
    }

    if (filters.is_active !== undefined) {
      params = params.set('is_active', String(filters.is_active));
    }

    if (filters.low_stock !== undefined) {
      params = params.set('low_stock', String(filters.low_stock));
    }

    return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}/products`,{ params },);
  }

  /**
   * Obtiene productos con bajo stock.
   *
   * Endpoint:
   * GET /products/low-stock
   *
   * Lo dejamos disponible para futuras pantallas o widgets.
   * En el listado usaremos GET /products?low_stock=true para mantener paginación.
   */
  getLowStockProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/low-stock`);
  }

  /**
   * Obtiene un producto por id.
   *
   * Endpoint:
   * GET /products/:id
   */
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  /**
   * Crea un producto.
   *
   * Endpoint:
   * POST /products
   */
  createProduct(payload: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, payload);
  }

  /**
   * Actualiza un producto.
   *
   * Endpoint:
   * PATCH /products/:id
   */
  updateProduct(id: string,payload: UpdateProductRequest): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/products/${id}`, payload);
  }

  /**
   * Activa un producto.
   *
   * Endpoint:
   * PATCH /products/:id/activate
   */
  activateProduct(id: string): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/products/${id}/activate`,{},);
  }

  /**
   * Desactiva un producto.
   *
   * Endpoint:
   * PATCH /products/:id/deactivate
   */
  deactivateProduct(id: string): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/products/${id}/deactivate`,{},);
  }

  /**
   * Eliminación de un producto.
   *
   * En el backend realmente desactiva el producto.
   *
   * Endpoint:
   * DELETE /products/:id
   */
  removeProduct(id: string): Observable<Product> {
    return this.http.delete<Product>(`${this.apiUrl}/products/${id}`);
  }
}