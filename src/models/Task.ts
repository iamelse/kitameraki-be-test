export interface Task {
  id: string
  organizationId: string

  title: string
  description?: string
  status: "open" | "in_progress" | "done"

  createdAt: string
  updatedAt?: string

  customFields?: Record<string, any>
}