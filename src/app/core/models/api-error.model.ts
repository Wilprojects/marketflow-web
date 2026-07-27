

//Nos ayudará a mostrar errores del backend en formularios y alertas
export interface ApiErrorResponse {
    statusCode?: number;
    message?: string | string[];
    error?: string;
}