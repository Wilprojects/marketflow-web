import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomersService } from '../../services/customers.service';
import { Customer, CustomerDocumentType, CustomerFilters } from '../../models/customer.model';
import { PaginationMeta } from '../../../../core/models/pagination.model';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { getApiErrorMessage } from '../../../../core/utils/error-message.util';

/**
 * Pantalla de listado de clientes.
 *
 * Responsabilidades:
 * - consultar clientes al backend
 * - aplicar filtros
 * - manejar paginación
 * - activar/desactivar clientes
 */
@Component({
  selector: 'app-customer-list',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css',
})
export class CustomerList implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly customersService = inject(CustomersService);

  /**
   * Datos de la tabla.
   */
  customers: Customer[] = [];

  /**
   * Metadata de paginación devuelta por el backend.
   */
  meta: PaginationMeta | null = null;

  /**
   * Estado de carga principal del listado.
   */
  isLoading = false;

  /**
   * Id del cliente que se está activando o desactivando.
   *
   * Sirve para bloquear solo el botón de la fila afectada.
   */
  actionLoadingId: string | null = null;

  /**
   * Mensajes visuales para el usuario.
   */
  errorMessage: string | null = null;
  successMessage: string | null = null;

  /**
   * Paginación actual.
   */
  currentPage = 1;
  readonly pageSize = 10;

  /**
   * Formulario de filtros.
   *
   * is_active se maneja como string porque viene de un select:
   * - ''      -> todos
   * - 'true'  -> activos
   * - 'false' -> inactivos
   */
  readonly filterForm = this.formBuilder.nonNullable.group({search: [''],is_active: [''],});

  /**
   * Al iniciar la pantalla, cargamos la primera página.
   */
  ngOnInit(): void {
    this.loadCustomers();
  }

  /**
   * Carga clientes desde el backend.
   */
  loadCustomers(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const filters = this.getFilters();

    this.customersService
      .getCustomers(filters)
      .pipe(
        /**
         * finalize se ejecuta tanto en éxito como en error.
         * Lo usamos para apagar el loading.
         */
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.customers = response.data;
          this.meta = response.meta;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = getApiErrorMessage(error);
        },
      });
  }

  /**
   * Aplica filtros desde la página 1.
   */
  applyFilters(): void {
    this.currentPage = 1;
    this.loadCustomers();
  }

  /**
   * Limpia filtros y recarga listado.
   */
  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      is_active: '',
    });

    this.currentPage = 1;
    this.loadCustomers();
  }

  /**
   * Cambia de página.
   */
  goToPage(page: number): void {
    if (!this.meta) {
      return;
    }

    if (page < 1 || page > this.meta.totalPages) {
      return;
    }

    this.currentPage = page;
    this.loadCustomers();
  }

  /**
   * Activa o desactiva un cliente según su estado actual.
   */
  toggleCustomerStatus(customer: Customer): void {
    const action = customer.is_active ? 'desactivar' : 'activar';

    const confirmed = confirm(`¿Estás seguro de ${action} el cliente "${this.getCustomerFullName(customer)}"?`,);

    if (!confirmed) {
      return;
    }

    this.actionLoadingId = customer.id;
    this.errorMessage = null;
    this.successMessage = null;

    const request$ = customer.is_active
      ? this.customersService.deactivateCustomer(customer.id)
      : this.customersService.activateCustomer(customer.id);

    request$
      .pipe(
        finalize(() => {
          this.actionLoadingId = null;
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = `El cliente fue ${
            customer.is_active ? 'desactivado' : 'activado'
          } correctamente.`;

          this.loadCustomers();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = getApiErrorMessage(error);
        },
      });
  }

  /**
   * Devuelve el nombre completo del cliente.
   */
  getCustomerFullName(customer: Customer): string {
    return `${customer.first_name} ${customer.last_name}`.trim();
  }

  /**
   * Traduce el tipo de documento a un texto más amigable.
   */
  getDocumentTypeLabel(documentType: CustomerDocumentType): string {
    const labels: Record<CustomerDocumentType, string> = {
      DNI: 'DNI',
      RUC: 'RUC',
      CE: 'Carnet de extranjería',
      PASSPORT: 'Pasaporte',
      OTHER: 'Otro',
    };

    return labels[documentType];
  }

  /**
   * Genera una lista corta de páginas para la paginación.
   */
  get pages(): number[] {
    if (!this.meta || this.meta.totalPages <= 0) {
      return [];
    }

    const totalPages = this.meta.totalPages;
    const maxVisiblePages = 5;

    const initialStart = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2),
    );

    const end = Math.min(totalPages, initialStart + maxVisiblePages - 1);
    const start = Math.max(1, end - maxVisiblePages + 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  /**
   * Construye filtros para enviar al backend.
   */
  private getFilters(): CustomerFilters {
    const rawFilters = this.filterForm.getRawValue();

    return {
      page: this.currentPage,
      limit: this.pageSize,
      search: rawFilters.search.trim() || undefined,
      is_active:
        rawFilters.is_active === ''
          ? undefined
          : rawFilters.is_active === 'true',
    };
  }

}
