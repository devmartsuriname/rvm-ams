import { BootstrapVariantType } from './component-props'

export type IdType = string

export type EmailLabelType = 'Primary' | 'Social' | 'Promotions' | 'Updates' | 'Forums'

export type EmailType = {
  id: IdType
  fromId: string
  from?: any
  toId: string
  to?: any
  subject?: string
  content?: string
  attachments?: FileType[]
  label?: EmailLabelType
  starred?: boolean
  important?: boolean
  draft?: boolean
  deleted?: boolean
  read?: boolean
  createdAt: Date
}

export type NotificationType = {
  from: string
  content: string
  icon?: string
}

export type FileType = Partial<File> & {
  preview?: string
}
