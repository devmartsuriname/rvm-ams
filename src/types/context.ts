export type ThemeType = 'light' | 'dark'

export type OffcanvasControlType = {
  open: boolean
  toggle: () => void
}

export type MenuType = {
  theme: ThemeType
  size: 'default' | 'condensed' | 'hidden' | 'sm-hover'
}

export type LayoutState = {
  theme: ThemeType
  topbarTheme: ThemeType
  menu: MenuType
}

export type LayoutOffcanvasStatesType = {
  showThemeCustomizer: boolean
  showActivityStream: boolean
  showBackdrop: boolean
}

export type LayoutType = LayoutState & {
  themeMode: ThemeType
  changeTheme: (theme: ThemeType) => void
  changeTopbarTheme: (theme: ThemeType) => void
  changeMenu: {
    theme: (theme: MenuType['theme']) => void
    size: (size: MenuType['size']) => void
  }
  themeCustomizer: OffcanvasControlType
  activityStream: OffcanvasControlType
  toggleBackdrop: () => void
  resetSettings: () => void
}
