/**
 * Enum de roles del sistema.
 *
 * Debe coincidir con los roles definidos en el backend:
 * src/common/enums/role-name.enum.ts
 *
 * Usar enum evita escribir strings sueltos como:
 * 'admin', 'Admin', 'ADMINISTRADOR', etc.
 */

export enum RoleName {
    ADMIN = 'Administrador',
    SELLER = 'Vendedor',
    WAREHOUSE = 'Almacenero',
}