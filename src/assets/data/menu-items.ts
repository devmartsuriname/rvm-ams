import { MenuItemType } from '@/types/menu'

export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'menu',
    label: 'MENU',
    isTitle: true,
  },
  {
    key: 'dashboards',
    label: 'Dashboard',
    icon: 'mingcute:home-3-line',
    url: '/dashboards',
  },
  {
    key: 'search',
    label: 'Search',
    icon: 'solar:magnifer-outline',
    url: '/search',
  },
  {
    key: 'rvm-section',
    label: 'RVM CORE',
    isTitle: true,
  },
  {
    key: 'rvm-dossiers',
    label: 'Dossiers',
    icon: 'bx:folder',
    url: '/rvm/dossiers',
  },
  {
    key: 'rvm-meetings',
    label: 'Meetings',
    icon: 'bx:calendar',
    url: '/rvm/meetings',
  },
  {
    key: 'rvm-decisions',
    label: 'Decisions',
    icon: 'bx:check-circle',
    url: '/rvm/decisions',
  },
  {
    key: 'rvm-tasks',
    label: 'Tasks',
    icon: 'bx:task',
    url: '/rvm/tasks',
  },
  {
    key: 'rvm-audit',
    label: 'Audit Log',
    icon: 'bx:shield-quarter',
    url: '/rvm/audit',
  },
]
