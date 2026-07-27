import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { CreateCustomerRequest, Customer, CustomerFilters, UpdateCustomerRequest } from "../models/customer.model";
import { Observable } from "rxjs";
import { PaginatedResponse } from "../../../core/models/pagination.model";

/**
 * Servicio de clientes.
 *
 * Responsabilidad:
 * Comunicarse con el backend para listar, buscar, crear,
 * actualizar, activar y desactivar clientes.
 */
@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private readonly http = inject(HttpClient);

  /**
   * URL base del backend.
   *
   * Ejemplo:
   * http://localhost:3000/api/v1
   */
  private readonly apiUrl = environment.apiUrl;

  /**
   * Obtiene clientes con filtros y paginación.
   *
   * Endpoint:
   * GET /customers
   */
  getCustomers(filters: CustomerFilters = {},): Observable<PaginatedResponse<Customer>> {
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

    return this.http.get<PaginatedResponse<Customer>>(`${this.apiUrl}/customers`,{ params },);
  }

  /**
   * Obtiene un cliente por id.
   *
   * Endpoint:
   * GET /customers/:id
   */
  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/customers/${id}`);
  }

  /**
   * Crea un cliente.
   *
   * Endpoint:
   * POST /customers
   */
  createCustomer(payload: CreateCustomerRequest): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/customers`, payload);
  }

  /**
   * Actualiza un cliente.
   *
   * Endpoint:
   * PATCH /customers/:id
   */
  updateCustomer(id: string, payload: UpdateCustomerRequest,): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/customers/${id}`,payload,);
  }

  /**
   * Activa un cliente.
   *
   * Endpoint:
   * PATCH /customers/:id/activate
   */
  activateCustomer(id: string): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/customers/${id}/activate`,{},);
  }

  /**
   * Desactiva un cliente.
   *
   * Endpoint:
   * PATCH /customers/:id/deactivate
   */
  deactivateCustomer(id: string): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/customers/${id}/deactivate`,{},);
  }

  /**
   * Eliminación de un cliente.
   *
   * En el backend realmente desactiva el cliente.
   *
   * Endpoint:
   * DELETE /customers/:id
   */
  removeCustomer(id: string): Observable<Customer> {
    return this.http.delete<Customer>(`${this.apiUrl}/customers/${id}`);
  }
}