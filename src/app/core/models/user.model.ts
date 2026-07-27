import { RoleName } from './role.model';

//Este modelo representa al usuario que viene del backend.
export interface User {
    id: string;
    username: string;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    is_active?: boolean;
    roles: RoleName[];
    created_at?: string;
    updated_at?: string;
}