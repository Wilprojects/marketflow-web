import { AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DashboardService } from '../services/dashboard.service';
import { RoleName } from '../../../core/models/role.model';
import { DashboardFilters, DashboardReport, InventoryMovementReason, InventoryMovementType, PaymentMethod } from '../models/dashboard.model';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { getApiErrorMessage } from '../../../core/utils/error-message.util';

/**
 * Dashboard principal de MarketFlow.
 *
 * Responsabilidades:
 * - consultar el resumen general del backend
 * - mostrar indicadores principales
 * - permitir filtrar por rango de fechas
 * - mostrar productos más vendidos
 * - mostrar productos con bajo stock
 * - mostrar resumen de inventario
 */
@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dashboardService = inject(DashboardService);
  private readonly sessionService = inject(SessionService);

  /**
  * Indica si el usuario actual puede consultar el dashboard completo.
  *
  * En el backend, GET /reports/dashboard está protegido para ADMIN.
  * Por eso validamos el rol antes de hacer la petición.
  */
  readonly canViewDashboard = this.sessionService.hasRole(RoleName.ADMIN);

  /**
  * Controla el estado de carga.
  */
  isLoading = false;

  /**
  * Mensaje de error visible para el usuario.
  */
  errorMessage: string | null = null;

  /**
  * Datos recibidos desde el backend.
  */
  dashboard: DashboardReport | null = null;

  /**
  * Formulario de filtros.
  *
  * Los inputs type="date" devuelven strings en formato YYYY-MM-DD,
  * que es compatible con el backend.
  */
  readonly filterForm = this.formBuilder.nonNullable.group({date_from: [''], date_to: [''],});

  /**
  * Al cargar el componente, consultamos el dashboard si el usuario es ADMIN.
  */
  ngOnInit(): void {
    if (this.canViewDashboard) {
      this.loadDashboard();
    }
  }

  /**
  * Consulta el dashboard al backend usando los filtros actuales.
  */
  loadDashboard(): void {
    this.errorMessage = null;
    this.isLoading = true;

    const filters = this.getFilters();

    this.dashboardService
      .getDashboard(filters)
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
        next: (dashboard) => {
          this.dashboard = dashboard;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = getApiErrorMessage(error);
        },
      });
  }

  /**
  * Limpia los filtros y vuelve a consultar el dashboard.
  */
  clearFilters(): void {
    this.filterForm.reset({date_from: '', date_to: '',});

    this.loadDashboard();
  }

  /**
  * Construye los filtros que se enviarán al service.
  *
  * Convertimos strings vacíos a undefined para no enviarlos al backend.
  */
  private getFilters(): DashboardFilters {
    const rawFilters = this.filterForm.getRawValue();

    return {
      date_from: rawFilters.date_from || undefined,
      date_to: rawFilters.date_to || undefined,
    };
  }

  /**
  * Traduce métodos de pago a texto amigable para la interfaz.
  */
  getPaymentMethodLabel(paymentMethod: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      CASH: 'Efectivo',
      CARD: 'Tarjeta',
      BANK_TRANSFER: 'Transferencia bancaria',
      DIGITAL_WALLET: 'Billetera digital',
      OTHER: 'Otro',
    };

    return labels[paymentMethod];
  }

  /**
  * Traduce tipos de movimiento de inventario.
  */
  getMovementTypeLabel(type: InventoryMovementType): string {
    const labels: Record<InventoryMovementType, string> = {
      IN: 'Entradas',
      OUT: 'Salidas',
      ADJUSTMENT: 'Ajustes',
    };

    return labels[type];
  }

  /**
  * Traduce motivos de movimiento de inventario.
  */
  getMovementReasonLabel(reason: InventoryMovementReason): string {
    const labels: Record<InventoryMovementReason, string> = {
      PURCHASE: 'Compra',
      PURCHASE_CANCELLED: 'Compra cancelada',
      SALE: 'Venta',
      SALE_CANCELLED: 'Venta cancelada',
      MANUAL_ENTRY: 'Entrada manual',
      MANUAL_EXIT: 'Salida manual',
      MANUAL_ADJUSTMENT: 'Ajuste manual',
      DAMAGE: 'Dañado',
      LOSS: 'Perdido',
      RETURN: 'Devuelto',
      OTHER: 'Otro',
    };

    return labels[reason];
  }

}
