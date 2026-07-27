import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Brand, BrandFilters, CreateBrandRequest, UpdateBrandRequest } from "../models/brand.model";
import { PaginatedResponse } from "../../../core/models/pagination.model";
import { Observable } from "rxjs";

/**
 * Servicio de marcas.
 *
 * Responsabilidad:
 * Comunicarse con el backend para listar, buscar, crear,
 * actualizar, activar y desactivar marcas.
 */
@Injectable({
  providedIn: 'root',
})
export class BrandsService {
  private readonly http = inject(HttpClient);

  /**
   * URL base del backend.
   *
   * Ejemplo:
   * http://localhost:3000/api/v1
   */
  private readonly apiUrl = environment.apiUrl;

  /**
   * Obtiene marcas con filtros y paginación.
   *
   * Endpoint:
   * GET /brands
   */
  getBrands(filters: BrandFilters = {}): Observable<PaginatedResponse<Brand>> {
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

    if (filters.is_active !== undefined) {
      params = params.set('is_active', String(filters.is_active));
    }

    return this.http.get<PaginatedResponse<Brand>>(`${this.apiUrl}/brands`, {params,});
  }

  /**
   * Obtiene una marca por id.
   *
   * Endpoint:
   * GET /brands/:id
   */
  getBrandById(id: string): Observable<Brand> {
    return this.http.get<Brand>(`${this.apiUrl}/brands/${id}`);
  }

  /**
   * Crea una marca.
   *
   * Endpoint:
   * POST /brands
   */
  createBrand(payload: CreateBrandRequest): Observable<Brand> {
    return this.http.post<Brand>(`${this.apiUrl}/brands`, payload);
  }

  /**
   * Actualiza una marca.
   *
   * Endpoint:
   * PATCH /brands/:id
   */
  updateBrand(id: string, payload: UpdateBrandRequest): Observable<Brand> {
    return this.http.patch<Brand>(`${this.apiUrl}/brands/${id}`, payload);
  }

  /**
   * Activa una marca.
   *
   * Endpoint:
   * PATCH /brands/:id/activate
   */
  activateBrand(id: string): Observable<Brand> {
    return this.http.patch<Brand>(`${this.apiUrl}/brands/${id}/activate`, {});
  }

  /**
   * Desactiva una marca.
   *
   * Endpoint:
   * PATCH /brands/:id/deactivate
   */
  deactivateBrand(id: string): Observable<Brand> {
    return this.http.patch<Brand>(`${this.apiUrl}/brands/${id}/deactivate`,{},);
  }

  /**
   * Eliminación de una marca.
   *
   * En el backend realmente desactiva la marca.
   *
   * Endpoint:
   * DELETE /brands/:id
   */
  removeBrand(id: string): Observable<Brand> {
    return this.http.delete<Brand>(`${this.apiUrl}/brands/${id}`);
  }
}