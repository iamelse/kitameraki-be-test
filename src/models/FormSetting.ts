import { FormField } from "./FormField"

export interface FormSetting {
  id: string
  organizationId: string

  fields: FormField[]
}