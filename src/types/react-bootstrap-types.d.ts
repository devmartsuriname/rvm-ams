// Additional react-bootstrap module declarations
declare module 'react-bootstrap/esm/types' {
  export type Placement = 'auto' | 'top' | 'bottom' | 'left' | 'right' | 'auto-start' | 'auto-end' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'right-start' | 'right-end' | 'left-start' | 'left-end'
  export type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light' | string
  export type ButtonVariant = Variant | 'link' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'outline-warning' | 'outline-info' | 'outline-dark' | 'outline-light'
  export type Color = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light' | 'white' | 'muted'
  export type ResponsiveBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  export type GapValue = 0 | 1 | 2 | 3 | 4 | 5
  export type BsPrefixOnlyProps = { bsPrefix?: string }
  export type BsPrefixProps<T extends React.ElementType = 'div'> = BsPrefixOnlyProps & { as?: T }
  export type BsPrefixRefForwardingComponent<T extends React.ElementType, P = unknown> = React.ForwardRefExoticComponent<React.PropsWithoutRef<P & BsPrefixProps<T>> & React.RefAttributes<any>>
}
