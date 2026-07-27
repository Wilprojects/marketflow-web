import { Component, EventEmitter, inject, Output } from '@angular/core';
import { RoleName } from '../../core/models/role.model';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionService } from '../../core/services/session.service';
import { AuthUser } from '../../core/models/auth.model';

/**
 * Item individual del menú lateral.
 */
interface SidebarMenuItem {
  label: string;
  icon: string;
  route: string;
  roles?: RoleName[];
}

/**
 * Grupo de opciones del menú.
 */
interface SidebarMenuGroup {
  title: string;
  items: SidebarMenuItem[];
}

/**
 * Sidebar.
 *
 * Muestra el menú principal del sistema.
 * Algunas opciones se muestran u ocultan según el rol del usuario.
 */
@Component({
  selector: 'app-sidebar',
  imports: [AsyncPipe, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  private readonly sessionService = inject(SessionService);

  /**
   * Evento para avisar al MainLayout que debe cerrar el sidebar en móvil.
   */
  @Output()
  readonly closeSidebar = new EventEmitter<void>();

  readonly currentUser$ = this.sessionService.currentUser$;

  /**
   * Menú principal de MarketFlow.
   *
   * roles:
   * Si no se define, cualquier usuario autenticado puede ver el item.
   * Si se define, el usuario debe tener al menos uno de esos roles.
   */
  readonly menuGroups: SidebarMenuGroup[] = [
    {
      title: 'Principal',
      items: [
        {
          label: 'Dashboard',
          icon: '📊',
          route: '/dashboard',
        },
      ],
    },
    {
      title: 'Gestión',
      items: [
        {
          label: 'Productos',
          icon: '📦',
          route: '/products',
        },
        {
          label: 'Categorías',
          icon: '🏷️',
          route: '/categories',
        },
        {
          label: 'Marcas',
          icon: '🏭',
          route: '/brands',
        },
      ],
    },
    {
      title: 'Operaciones',
      items: [
        {
          label: 'Ventas',
          icon: '🧾',
          route: '/sales',
          roles: [RoleName.ADMIN, RoleName.SELLER],
        },
        {
          label: 'Compras',
          icon: '🛒',
          route: '/purchases',
          roles: [RoleName.ADMIN, RoleName.WAREHOUSE],
        },
        {
          label: 'Inventario',
          icon: '📋',
          route: '/inventory-movements',
          roles: [RoleName.ADMIN, RoleName.WAREHOUSE],
        },
      ],
    },
    {
      title: 'Personas',
      items: [
        {
          label: 'Clientes',
          icon: '👥',
          route: '/customers',
          roles: [RoleName.ADMIN, RoleName.SELLER],
        },
        {
          label: 'Proveedores',
          icon: '🚚',
          route: '/suppliers',
          roles: [RoleName.ADMIN, RoleName.WAREHOUSE],
        },
      ],
    },
    {
      title: 'Sistema',
      items: [
        {
          label: 'Reportes',
          icon: '📈',
          route: '/reports',
        },
        {
          label: 'Adjuntos',
          icon: '📎',
          route: '/attachments',
        },
        {
          label: 'Usuarios',
          icon: '🔐',
          route: '/users',
          roles: [RoleName.ADMIN],
        },
        {
          label: 'Roles',
          icon: '🛡️',
          route: '/roles',
          roles: [RoleName.ADMIN],
        },
      ],
    },
  ];

  /**
   * Valida si un item debe mostrarse para el usuario actual.
   */
  canShowItem(item: SidebarMenuItem, user: AuthUser): boolean {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }

    return item.roles.some((role) => user.roles.includes(role));
  }

  onNavigate(): void {
    this.closeSidebar.emit();
  }

}
