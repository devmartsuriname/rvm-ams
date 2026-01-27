// Temporary type stubs for external packages not yet installed
// These will be replaced when proper dependencies are added in Phase 5 - Final Configuration

declare module '@iconify/react' {
  export interface IconProps {
    icon: string
    width?: number | string
    height?: number | string
    color?: string
    className?: string
    style?: React.CSSProperties
    onClick?: () => void
    [key: string]: any
  }
  export const Icon: React.FC<IconProps>
}

declare module '@fullcalendar/core/index.js' {
  export interface EventInput {
    id?: string
    title?: string
    start?: Date | string
    end?: Date | string
    allDay?: boolean
    className?: string
    editable?: boolean
    [key: string]: any
  }
  export interface EventClickArg {
    event: any
    el: HTMLElement
    jsEvent: MouseEvent
  }
  export interface EventDropArg {
    event: any
    oldEvent: any
    delta: any
  }
}

declare module '@fullcalendar/interaction/index.js' {
  export interface DateClickArg {
    date: Date
    dateStr: string
    allDay: boolean
    jsEvent: MouseEvent
  }
  export interface DropArg {
    date: Date
    dateStr: string
    allDay: boolean
    draggedEl: HTMLElement
    jsEvent: MouseEvent
  }
}

// React Bootstrap - with FormControlProps export
declare module 'react-bootstrap' {
  import * as React from 'react'
  import { ComponentType, ReactNode, HTMLAttributes, FormHTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes } from 'react'
  
  // FormControlProps - required by Darkone form components
  export interface FormControlProps extends InputHTMLAttributes<HTMLInputElement> {
    as?: React.ElementType
    htmlSize?: number
    size?: 'sm' | 'lg'
    plaintext?: boolean
    readOnly?: boolean
    isValid?: boolean
    isInvalid?: boolean
    [key: string]: any
  }
  
  export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode
    className?: string
  }
  export const Card: ComponentType<CardProps> & {
    Header: ComponentType<CardProps>
    Body: ComponentType<CardProps>
    Footer: ComponentType<CardProps>
    Title: ComponentType<CardProps>
    Text: ComponentType<CardProps>
    Img: ComponentType<any>
  }
  export const CardBody: ComponentType<any>
  export const CardTitle: ComponentType<any>
  export const CardHeader: ComponentType<any>
  export const CardFooter: ComponentType<any>
  
  export const Row: ComponentType<any>
  export const Col: ComponentType<any>
  export const Container: ComponentType<any>
  export const Button: ComponentType<any>
  
  export const Dropdown: ComponentType<any> & {
    Toggle: ComponentType<any>
    Menu: ComponentType<any>
    Item: ComponentType<any>
    Divider: ComponentType<any>
    Header: ComponentType<any>
  }
  export const DropdownToggle: ComponentType<any>
  export const DropdownMenu: ComponentType<any>
  export const DropdownItem: ComponentType<any>
  export const DropdownHeader: ComponentType<any>
  export const DropdownDivider: ComponentType<any>
  
  export const Nav: ComponentType<any> & { Item: ComponentType<any>; Link: ComponentType<any> }
  export const Form: ComponentType<any> & {
    Group: ComponentType<any>
    Label: ComponentType<any>
    Control: ComponentType<any>
    Check: ComponentType<any>
    Select: ComponentType<any>
    Text: ComponentType<any>
    Range: ComponentType<any>
    Floating: ComponentType<any>
  }
  export const FormControl: ComponentType<FormControlProps>
  export const FormGroup: ComponentType<any>
  export const FormLabel: ComponentType<any>
  export const FormCheck: ComponentType<any>
  export const FormSelect: ComponentType<any>
  export const FormText: ComponentType<any>
  export const FloatingLabel: ComponentType<any>
  
  export const Offcanvas: ComponentType<any> & {
    Header: ComponentType<any>
    Title: ComponentType<any>
    Body: ComponentType<any>
  }
  export const OffcanvasHeader: ComponentType<any>
  export const OffcanvasBody: ComponentType<any>
  export const OffcanvasTitle: ComponentType<any>
  
  export const Modal: ComponentType<any> & {
    Header: ComponentType<any>
    Title: ComponentType<any>
    Body: ComponentType<any>
    Footer: ComponentType<any>
    Dialog: ComponentType<any>
  }
  
  export const Badge: ComponentType<any>
  export const Alert: ComponentType<any>
  export const Breadcrumb: ComponentType<any> & { Item: ComponentType<any> }
  export const Collapse: ComponentType<any>
  export const Accordion: ComponentType<any> & { Item: ComponentType<any>; Header: ComponentType<any>; Body: ComponentType<any> }
  export const AccordionItem: ComponentType<any>
  export const AccordionHeader: ComponentType<any>
  export const AccordionBody: ComponentType<any>
  export const Tab: ComponentType<any> & { Container: ComponentType<any>; Content: ComponentType<any>; Pane: ComponentType<any> }
  export const Tabs: ComponentType<any>
  export const ListGroup: ComponentType<any> & { Item: ComponentType<any> }
  export const ListGroupItem: ComponentType<any>
  export const Table: ComponentType<any>
  export const Spinner: ComponentType<any>
  export const ProgressBar: ComponentType<any>
  export const Pagination: ComponentType<any> & { Item: ComponentType<any>; First: ComponentType<any>; Prev: ComponentType<any>; Next: ComponentType<any>; Last: ComponentType<any>; Ellipsis: ComponentType<any> }
  export const Tooltip: ComponentType<any>
  export const OverlayTrigger: ComponentType<any>
  export const Popover: ComponentType<any> & { Header: ComponentType<any>; Body: ComponentType<any> }
  export const PopoverHeader: ComponentType<any>
  export const PopoverBody: ComponentType<any>
  export const Carousel: ComponentType<any> & { Item: ComponentType<any>; Caption: ComponentType<any> }
  export const CarouselItem: ComponentType<any>
  export const InputGroup: ComponentType<any> & { Text: ComponentType<any> }
  export const Image: ComponentType<any>
  export const Figure: ComponentType<any>
  export const Navbar: ComponentType<any> & { Brand: ComponentType<any>; Toggle: ComponentType<any>; Collapse: ComponentType<any> }
  export const CloseButton: ComponentType<any>
  export const ButtonGroup: ComponentType<any>
  export const ModalHeader: ComponentType<any>
  export const ModalBody: ComponentType<any>
  export const ModalFooter: ComponentType<any>
  export const ModalTitle: ComponentType<any>
  export const Stack: ComponentType<any>
  export const Placeholder: ComponentType<any>
  export const Ratio: ComponentType<any>
  export const Toast: ComponentType<any> & { Header: ComponentType<any>; Body: ComponentType<any> }
  export const ToastContainer: ComponentType<any>
  export const ToastHeader: ComponentType<any>
  export const ToastBody: ComponentType<any>
  
  // Additional exports needed by Darkone pages
  export const NavItem: ComponentType<any>
  export const NavLink: ComponentType<any>
  export const TabContainer: ComponentType<any>
  export const TabContent: ComponentType<any>
  export const TabPane: ComponentType<any>
  export type ToastContainerProps = any
  export type OverlayProps = any
}

declare module 'react-bootstrap/esm/Feedback' {
  import { ComponentType } from 'react'
  const Feedback: ComponentType<any>
  export default Feedback
}

declare module 'react-bootstrap/Toast' {
  import { ComponentType } from 'react'
  export interface ToastProps {
    show?: boolean
    onClose?: () => void
    delay?: number
    autohide?: boolean
    animation?: boolean
    bg?: string
    className?: string
    children?: React.ReactNode
  }
  const Toast: ComponentType<ToastProps> & {
    Header: ComponentType<any>
    Body: ComponentType<any>
  }
  export default Toast
}

declare module 'react-bootstrap/ToastContainer' {
  import { ComponentType } from 'react'
  export interface ToastContainerProps {
    position?: string
    className?: string
    children?: React.ReactNode
  }
  const ToastContainer: ComponentType<ToastContainerProps>
  export default ToastContainer
}

// Flatpickr
declare module 'react-flatpickr' {
  import { ComponentType } from 'react'
  interface FlatpickrProps {
    value?: Date | string | Date[]
    onChange?: (dates: Date[], currentDateString: string) => void
    options?: any
    className?: string
    placeholder?: string
    disabled?: boolean
    name?: string
    id?: string
    [key: string]: any
  }
  const Flatpickr: ComponentType<FlatpickrProps>
  export default Flatpickr
}

// Helmet
declare module 'react-helmet-async' {
  import { ComponentType, ReactNode } from 'react'
  export interface HelmetProps {
    children?: ReactNode
  }
  export const Helmet: ComponentType<HelmetProps>
  export const HelmetProvider: ComponentType<{ children?: ReactNode }>
}

// Choices.js - with Options export and passedElement property
declare module 'choices.js' {
  export type Options = any

  export default class Choices {
    constructor(element: HTMLElement | string, options?: Options)
    passedElement: any
    destroy(): void
    disable(): void
    enable(): void
    getValue(valueOnly?: boolean): any
    setValue(items: any[]): void
    setChoices(choices: any[], value?: string, label?: string, replaceChoices?: boolean): void
    clearStore(): void
    clearInput(): void
    removeActiveItems(excludedId?: number): void
    removeHighlightedItems(runEvent?: boolean): void
    [key: string]: any
  }
}

// React Dropzone
declare module 'react-dropzone' {
  import { ComponentType } from 'react'
  export interface DropzoneState {
    isDragActive: boolean
    isDragAccept: boolean
    isDragReject: boolean
    acceptedFiles: File[]
    getRootProps: (props?: any) => any
    getInputProps: (props?: any) => any
    open: () => void
  }
  export interface DropzoneOptions {
    accept?: Record<string, string[]>
    disabled?: boolean
    maxSize?: number
    minSize?: number
    multiple?: boolean
    maxFiles?: number
    onDrop?: (acceptedFiles: File[], rejectedFiles: any[]) => void
    onDropAccepted?: (files: File[]) => void
    onDropRejected?: (files: any[]) => void
    noClick?: boolean
    noKeyboard?: boolean
    noDrag?: boolean
  }
  export function useDropzone(options?: DropzoneOptions): DropzoneState
  export interface DropzoneProps extends DropzoneOptions {
    children?: (state: DropzoneState) => React.ReactNode
  }
  const Dropzone: ComponentType<DropzoneProps>
  export default Dropzone
}

// React Toastify
declare module 'react-toastify' {
  import { ComponentType, ReactNode } from 'react'
  export interface ToastContainerProps {
    position?: string
    autoClose?: number | false
    hideProgressBar?: boolean
    newestOnTop?: boolean
    closeOnClick?: boolean
    rtl?: boolean
    pauseOnFocusLoss?: boolean
    draggable?: boolean
    pauseOnHover?: boolean
    theme?: string
    className?: string
  }
  export const ToastContainer: ComponentType<ToastContainerProps>
  export interface ToastOptions {
    position?: string
    autoClose?: number | false
    hideProgressBar?: boolean
    closeOnClick?: boolean
    pauseOnHover?: boolean
    draggable?: boolean
    progress?: number
    theme?: string
    type?: string
  }
  export const toast: {
    (content: ReactNode, options?: ToastOptions): void
    success: (content: ReactNode, options?: ToastOptions) => void
    error: (content: ReactNode, options?: ToastOptions) => void
    warn: (content: ReactNode, options?: ToastOptions) => void
    info: (content: ReactNode, options?: ToastOptions) => void
    dismiss: (id?: string | number) => void
  }
}

// Simplebar - with Props export
declare module 'simplebar-core' {
  export interface SimpleBarOptions {
    autoHide?: boolean
    scrollbarMinSize?: number
    scrollbarMaxSize?: number
    classNames?: Record<string, string>
    forceVisible?: boolean | string
    direction?: string
    timeout?: number
    clickOnTrack?: boolean
  }
  export default class SimpleBar {
    constructor(element: HTMLElement, options?: SimpleBarOptions)
    recalculate(): void
    getScrollElement(): HTMLElement
    getContentElement(): HTMLElement
    unMount(): void
  }
}

declare module 'simplebar-react' {
  import * as React from 'react'

  export interface Props {
    children?: React.ReactNode
    scrollableNodeProps?: any
    [key: string]: any
  }

  const SimpleBar: React.FC<Props>
  export default SimpleBar
}

// Cookies Next
declare module 'cookies-next' {
  export interface CookieOptions {
    maxAge?: number
    expires?: Date
    path?: string
    domain?: string
    secure?: boolean
    httpOnly?: boolean
    sameSite?: boolean | 'lax' | 'strict' | 'none'
  }
  export function setCookie(key: string, value: any, options?: CookieOptions): void
  export function getCookie(key: string, options?: any): string | undefined
  export function deleteCookie(key: string, options?: CookieOptions): void
  export function hasCookie(key: string, options?: any): boolean
  export function getCookies(options?: any): Record<string, string>
}

// Yup - with validate method, InferType, and permissive schemas
declare module 'yup' {
  export type AnySchema = any
  export type InferType<T> = any
  
  export type ObjectSchema<T extends object = any> = {
    validate: (value: any, options?: any) => Promise<any>
    validateSync: (value: any, options?: any) => any
    shape: (fields: any) => ObjectSchema<T>
    required: (message?: string) => ObjectSchema<T>
    nullable: () => ObjectSchema<T>
    optional: () => ObjectSchema<T>
    [key: string]: any
  }

  export function object<T extends object = any>(shape?: any): ObjectSchema<T>
  export function string(): AnySchema
  export function number(): AnySchema
  export function boolean(): AnySchema
  export function bool(): AnySchema
  export function date(): AnySchema
  export function array<T = any>(): AnySchema
  export function mixed<T = any>(): AnySchema

  export const ref: (...args: any[]) => any
  export const setLocale: (...args: any[]) => void
  export const lazy: (fn: (value: any) => any) => any
}

// Axios
declare module 'axios' {
  export interface AxiosRequestConfig {
    url?: string
    method?: string
    baseURL?: string
    headers?: Record<string, string>
    params?: any
    data?: any
    timeout?: number
    withCredentials?: boolean
    responseType?: string
    [key: string]: any
  }
  export interface AxiosResponse<T = any> {
    data: T
    status: number
    statusText: string
    headers: Record<string, string>
    config: AxiosRequestConfig
  }
  export interface AxiosError<T = any> extends Error {
    config: AxiosRequestConfig
    code?: string
    request?: any
    response?: AxiosResponse<T>
    isAxiosError: boolean
  }
  export interface AxiosInstance {
    (config: AxiosRequestConfig): Promise<AxiosResponse>
    (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>
    defaults: AxiosRequestConfig
    interceptors: {
      request: any
      response: any
    }
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
    options<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
  }
  export function create(config?: AxiosRequestConfig): AxiosInstance
  const axios: AxiosInstance & {
    create: typeof create
    isAxiosError(payload: any): payload is AxiosError
  }
  export default axios
}

// Axios Mock Adapter - with permissive constructor and reply method
declare module 'axios-mock-adapter' {
  import { AxiosInstance, AxiosRequestConfig } from 'axios'

  export interface AxiosMockAdapterOptions {
    delayResponse?: number
    onNoMatch?: 'passthrough' | 'throwException' | null
    [key: string]: any
  }

  export default class MockAdapter {
    constructor(axiosInstance: AxiosInstance, options?: AxiosMockAdapterOptions)

    onGet(url?: string | RegExp, body?: any): MockAdapter
    onPost(url?: string | RegExp, body?: any): MockAdapter
    onPut(url?: string | RegExp, body?: any): MockAdapter
    onPatch(url?: string | RegExp, body?: any): MockAdapter
    onDelete(url?: string | RegExp, body?: any): MockAdapter
    onHead(url?: string | RegExp, body?: any): MockAdapter
    onOptions(url?: string | RegExp, body?: any): MockAdapter
    onAny(url?: string | RegExp, body?: any): MockAdapter
    
    reply(callback: (config: any) => any): MockAdapter
    reply(status: number, data?: any, headers?: Record<string, string>): MockAdapter
    replyOnce(callback: (config: any) => any): MockAdapter
    replyOnce(status: number, data?: any, headers?: Record<string, string>): MockAdapter
    
    passThrough(): MockAdapter
    networkError(): MockAdapter
    networkErrorOnce(): MockAdapter
    timeout(): MockAdapter
    timeoutOnce(): MockAdapter
    reset(): void
    restore(): void
    resetHistory(): void
    history: Record<string, AxiosRequestConfig[]>

    [key: string]: any
  }
}

// JVectorMap
declare module 'jsvectormap' {
  export interface JsvectormapOptions {
    map?: string
    selector?: string | HTMLElement
    backgroundColor?: string
    draggable?: boolean
    zoomButtons?: boolean
    zoomOnScroll?: boolean
    zoomOnScrollSpeed?: number
    zoomMax?: number
    zoomMin?: number
    zoomAnimate?: boolean
    showTooltip?: boolean
    zoomStep?: number
    focusOn?: any
    markers?: any[]
    markerStyle?: any
    markerLabelStyle?: any
    markersSelectable?: boolean
    markersSelectableOne?: boolean
    lines?: any[]
    lineStyle?: any
    selectedMarkers?: number[]
    selectedRegions?: string[]
    regionStyle?: any
    regionLabelStyle?: any
    regionsSelectable?: boolean
    regionsSelectableOne?: boolean
    series?: any
    visualizeData?: any
    labels?: any
    onLoaded?: (map: any) => void
    onViewportChange?: (scale: number, transX: number, transY: number) => void
    onRegionClick?: (event: any, code: string) => void
    onRegionSelected?: (code: string, isSelected: boolean, selectedRegions: string[]) => void
    onMarkerClick?: (event: any, markerIndex: number) => void
    onMarkerSelected?: (markerIndex: number, isSelected: boolean, selectedMarkers: number[]) => void
    onRegionTooltipShow?: (event: any, tooltip: any, code: string) => void
    onMarkerTooltipShow?: (event: any, tooltip: any, markerIndex: number) => void
    [key: string]: any
  }
  class Jsvectormap {
    constructor(options: JsvectormapOptions)
    setSelected(type: string, keys: string[]): void
    clearSelected(type: string): void
    getSelected(type: string): string[]
    addMarkers(markers: any[]): void
    removeMarkers(): void
    addLine(from: string, to: string, style?: any): void
    removeLines(): void
    reset(): void
    destroy(): void
    extend(name: string, value: any): void
    getMap(name: string): any
    [key: string]: any
  }
  export default Jsvectormap
}

declare module 'jsvectormap/dist/maps/world' {}
declare module 'jsvectormap/dist/maps/canada' {}
declare module 'jsvectormap/dist/maps/spain' {}
declare module 'jsvectormap/dist/maps/iraq' {}
declare module 'jsvectormap/dist/maps/russia' {}

// Preline
declare module 'preline/preline' {
  export interface IStaticMethods {
    autoInit(): void
    [key: string]: any
  }
}

// ApexCharts
declare module 'apexcharts' {
  export interface ApexOptions {
    chart?: any
    series?: any[]
    xaxis?: any
    yaxis?: any
    colors?: string[]
    stroke?: any
    fill?: any
    legend?: any
    dataLabels?: any
    tooltip?: any
    grid?: any
    plotOptions?: any
    labels?: string[]
    responsive?: any[]
    theme?: any
    title?: any
    subtitle?: any
    annotations?: any
    markers?: any
    noData?: any
    states?: any
    [key: string]: any
  }
  class ApexCharts {
    constructor(el: HTMLElement, options: ApexOptions)
    render(): Promise<void>
    updateSeries(series: any[], animate?: boolean): void
    updateOptions(options: ApexOptions, redrawPaths?: boolean, animate?: boolean): void
    destroy(): void
    [key: string]: any
  }
  export default ApexCharts
}

declare module 'react-apexcharts' {
  import { ComponentType } from 'react'
  import { ApexOptions } from 'apexcharts'
  
  export interface ApexChartProps {
    type?: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'boxPlot' | 'radar' | 'polarArea' | 'rangeBar' | 'rangeArea' | 'treemap'
    series?: any[]
    width?: string | number
    height?: string | number
    options?: ApexOptions
    [key: string]: any
  }
  
  const ReactApexChart: ComponentType<ApexChartProps>
  export default ReactApexChart
}

// React Select
declare module 'react-select' {
  import { ComponentType } from 'react'
  export interface SelectOption {
    value: any
    label: string
    [key: string]: any
  }
  export interface SelectProps {
    options?: SelectOption[]
    value?: any
    onChange?: (value: any) => void
    isMulti?: boolean
    isSearchable?: boolean
    isClearable?: boolean
    isDisabled?: boolean
    placeholder?: string
    className?: string
    classNamePrefix?: string
    [key: string]: any
  }
  const Select: ComponentType<SelectProps>
  export default Select
}

// React Quill
declare module 'react-quill' {
  import { ComponentType } from 'react'
  export interface ReactQuillProps {
    value?: string
    onChange?: (value: string) => void
    theme?: string
    modules?: any
    formats?: string[]
    placeholder?: string
    readOnly?: boolean
    className?: string
    [key: string]: any
  }
  const ReactQuill: ComponentType<ReactQuillProps>
  export default ReactQuill
}

// Google Maps React
declare module 'google-maps-react' {
  import { ComponentType } from 'react'
  export const GoogleApiWrapper: (config: any) => (component: any) => any
  export const Map: ComponentType<any>
  export const Marker: ComponentType<any>
  export const InfoWindow: ComponentType<any>
  export const Polyline: ComponentType<any>
  export const Polygon: ComponentType<any>
  export const Circle: ComponentType<any>
  export const Rectangle: ComponentType<any>
  export const HeatMap: ComponentType<any>
}

// GridJS React
declare module 'gridjs-react' {
  import { ComponentType } from 'react'
  export interface GridProps {
    data?: any[]
    columns?: any[]
    search?: boolean | any
    sort?: boolean | any
    pagination?: boolean | any
    className?: any
    [key: string]: any
  }
  export const Grid: ComponentType<GridProps>
}

// React Bootstrap ESM InputGroupText
declare module 'react-bootstrap/esm/InputGroupText' {
  import { ComponentType } from 'react'
  const InputGroupText: ComponentType<any>
  export default InputGroupText
}
