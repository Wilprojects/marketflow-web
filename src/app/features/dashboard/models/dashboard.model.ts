/**
 * Filtros enviados al endpoint:
 * GET /reports/dashboard
 *
 * El backend acepta date_from y date_to como query params.
 */
export interface DashboardFilters {
    date_from?: string;
    date_to?: string;
}

/**
 * Periodo usado por los reportes.
 */
export interface ReportPeriod {
    date_from: string | null;
    date_to: string | null;
}

/**
 * Métodos de pago disponibles.
 *
 * Deben coincidir con el enum PaymentMethod del backend.
 */
export type PaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'BANK_TRANSFER'
  | 'DIGITAL_WALLET'
  | 'OTHER';

/**
 * Tipos de movimiento de inventario.
 *
 * Deben coincidir con InventoryMovementType del backend.
 */
export type InventoryMovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

/**
 * Motivos de movimiento de inventario.
 *
 * Deben coincidir con InventoryMovementReason del backend.
 */
export type InventoryMovementReason =
  | 'PURCHASE'
  | 'PURCHASE_CANCELLED'
  | 'SALE'
  | 'SALE_CANCELLED'
  | 'MANUAL_ENTRY'
  | 'MANUAL_EXIT'
  | 'MANUAL_ADJUSTMENT'
  | 'DAMAGE'
  | 'LOSS'
  | 'RETURN'
  | 'OTHER';

/**
 * Resumen por método de pago.
 */
export interface PaymentMethodSummary {
    payment_method: PaymentMethod;
    sales_count: number;
    total: number;
}

/**
 * Resumen general de ventas.
 */
export interface SalesSummaryReport {
    period: ReportPeriod;
    sales_count: number;
    cancelled_sales_count: number;
    subtotal: number;
    discount_total: number;
    tax_total: number;
    total: number;
    average_ticket: number;
    payment_methods: PaymentMethodSummary[];
}

/**
 * Producto más vendido.
 */
export interface TopProductReport {
    product: {
        id: string;
        code: string;
        name: string;
    };
    quantity_sold: number;
    sales_count: number;
    total_sold: number;
}

/**
 * Producto con bajo stock.
 */
export interface LowStockProductReport {
    product: {
        id: string;
        code: string;
        name: string;
    };
    stock: number;
    min_stock: number;
    missing_quantity: number;
    category: {
        id: string;
        name: string;
    };
    brand: {
        id: string;
        name: string;
    } | null;
}

/**
 * Resumen de movimientos agrupado por tipo.
 */
export interface InventoryMovementTypeSummary {
    type: InventoryMovementType;
    movements_count: number;
    total_quantity: number;
}

/**
 * Resumen de movimientos agrupado por motivo.
 */
export interface InventoryMovementReasonSummary {
    reason: InventoryMovementReason;
    movements_count: number;
    total_quantity: number;
}

/**
 * Resumen general de inventario.
 */
export interface InventorySummaryReport {
    period: ReportPeriod;
    total_movements: number;
    by_type: InventoryMovementTypeSummary[];
    by_reason: InventoryMovementReasonSummary[];
}

/**
 * Respuesta completa del endpoint:
 * GET /reports/dashboard
 */
export interface DashboardReport {
    generated_at: string;
    period: ReportPeriod;
    sales_summary: SalesSummaryReport;
    top_products: TopProductReport[];
    low_stock: {
        count: number;
        products: LowStockProductReport[];
    };
    inventory_summary: InventorySummaryReport;
}