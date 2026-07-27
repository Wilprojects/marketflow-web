import { RoleName } from "./role.model";

export interface AuthUser {
    id: string;
    username: string;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    roles: RoleName[];
}

export interface LoginRequest {
    identifier: string;  //Se usa identifier porque puede ser email o username en el backend
    password: string;
}

export interface LoginResponse {
    access_token: string;
    user: AuthUser;
}