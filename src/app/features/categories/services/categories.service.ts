import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Category, CategoryFilters, CreateCategoryRequest, UpdateCategoryRequest } from "../models/category.model";
import { Observable } from "rxjs";
import { PaginatedResponse } from "../../../core/models/pagination.model";

/**
 * Servicio de categorías.
 *
 * Responsabilidad:
 * Comunicarse con el backend para listar, crear, actualizar,
 * activar y desactivar categorías.
 */
@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly http = inject(HttpClient);

  /**
   * URL base del backend.
   *
   * Ejemplo:
   * http://localhost:3000/api/v1
   */
  private readonly apiUrl = environment.apiUrl;

  /**
   * Obtiene categorías con filtros y paginación.
   *
   * Endpoint:
   * GET /categories
   */
  getCategories(filters: CategoryFilters = {},): Observable<PaginatedResponse<Category>> {
    let params = new HttpParams();

    /**
     * Agregamos query params solo si tienen valor.
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

    if (filters.is_active !== undefined) {
      params = params.set('is_active', String(filters.is_active));
    }

    return this.http.get<PaginatedResponse<Category>>(
      `${this.apiUrl}/categories`,{ params },
    );
  }

  /**
   * Obtiene una categoría por id.
   *
   * Endpoint:
   * GET /categories/:id
   */
  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`);
  }

  /**
   * Crea una categoría.
   *
   * Endpoint:
   * POST /categories
   */
  createCategory(payload: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, payload);
  }

  /**
   * Actualiza una categoría.
   *
   * Endpoint:
   * PATCH /categories/:id
   */
  updateCategory(id: string, payload: UpdateCategoryRequest,): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/categories/${id}`, payload,);
  }

  /**
   * Activa una categoría.
   *
   * Endpoint:
   * PATCH /categories/:id/activate
   */
  activateCategory(id: string): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/categories/${id}/activate`,{},);
  }

  /**
   * Desactiva una categoría.
   *
   * Endpoint:
   * PATCH /categories/:id/deactivate
   */
  deactivateCategory(id: string): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/categories/${id}/deactivate`,{},);
  }

  /**
   * Eliminación de una categoría.
   *
   * En el backend realmente desactiva la categoría.
   *
   * Endpoint:
   * DELETE /categories/:id
   */
  removeCategory(id: string): Observable<Category> {
    return this.http.delete<Category>(`${this.apiUrl}/categories/${id}`);
  }
}