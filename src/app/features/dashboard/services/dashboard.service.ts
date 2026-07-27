import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { DashboardFilters, DashboardReport } from "../models/dashboard.model";
import { Observable } from "rxjs";


/**
 * Servicio del Dashboard.
 *
 * Responsabilidad:
 * Comunicarse con el backend para obtener la información resumida
 * del dashboard principal.
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
    private readonly http = inject(HttpClient);

    /**
     * URL base del backend.
     *
     * Ejemplo:
     * http://localhost:3000/api/v1
     */
    private readonly apiUrl = environment.apiUrl;

    /**
     * Obtiene el dashboard desde el backend.
     *
     * Endpoint:
     * GET /reports/dashboard
     *
     * Puede recibir filtros opcionales:
     * - date_from
     * - date_to
     */
    getDashboard(filters?: DashboardFilters): Observable<DashboardReport> {
        let params = new HttpParams();

        /**
         * Solo agregamos el parámetro si tiene valor.
         * Así evitamos enviar query params vacíos.
         */
        if (filters?.date_from) {
            params = params.set('date_from', filters.date_from);
        }

        if (filters?.date_to) {
            params = params.set('date_to', filters.date_to);
        }

        return this.http.get<DashboardReport>(`${this.apiUrl}/reports/dashboard`, {params,});
    }
}