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
]
