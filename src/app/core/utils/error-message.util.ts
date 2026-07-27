import { HttpErrorResponse } from "@angular/common/http";
import { ApiErrorResponse } from "../models/api-error.model";

/**
 * Convierte un error técnico del backend en un mensaje entendible
 * para mostrarlo en pantalla.
 *
 * Lo usaremos principalmente en formularios, por ejemplo en login.
 */
export function getApiErrorMessage(error: unknown): string {
    
    //Si el error no viene de HttpClient, devolvemos un mensaje genérico.
    if (!(error instanceof HttpErrorResponse)) {
        return 'Ocurrió un error inesperado';
    }

    //El backend puede devolver un objeto con statusCode, message y error.
    const apiError = error.error as ApiErrorResponse | undefined;

    //Cuando fallan validaciones, NestJS puede devolver: message: ['campo requerido', 'campo inválido']
    if (Array.isArray(apiError?.message)) {
        return apiError.message.join(', ');
    }

    //Cuando el backend devuelve un mensaje simple.
    if (typeof apiError?.message === 'string') {
        return apiError.message;
    }

    //Algunos errores pueden venir en la propiedad "error".
    if (typeof apiError?.error === 'string') {
        return apiError.error;
    }

    /**
     * status 0 normalmente significa que Angular no pudo conectarse
     * al backend. Por ejemplo:
     * - backend apagado
     * - URL incorrecta
     * - problema de CORS
     */
    if (error.status === 0) {
        return 'No se pudo conectar con el servidor';
    }

    return 'Ocurrió un error al procesar la solicitud';
}