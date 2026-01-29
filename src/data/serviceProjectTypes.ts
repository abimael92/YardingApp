/**
 * Maps each service (job offering) to allowed project types for invoicing.
 * Service IDs match mockData services (Lawn Care, Tree Services, etc.).
 *
 * Desert Landscaping → Installation only
 * Tree Services → Repair & Maintenance
 * Lawn Care → Maintenance only
 * Hardscaping → Installation only
 * Irrigation → Installation, Repair, AND Maintenance
 */

export type ProjectType = "maintenance" | "installation" | "repair"

/** Service id (from mockData) → allowed project types */
export const SERVICE_PROJECT_TYPES: Record<string, ProjectType[]> = {
  "1": ["maintenance"], // Lawn Care & Maintenance
  "2": ["repair", "maintenance"], // Tree Services & Pruning
  "3": ["installation"], // Desert Landscaping
  "4": ["installation", "repair", "maintenance"], // Irrigation Systems
  "5": ["installation"], // Hardscaping & Patios
}

export function getAllowedProjectTypes(serviceId: string): ProjectType[] {
  return SERVICE_PROJECT_TYPES[serviceId] ?? ["maintenance", "installation", "repair"]
}

export function formatAllowedTypes(types: ProjectType[]): string {
  if (types.length === 1) return `${types[0].charAt(0).toUpperCase() + types[0].slice(1)} only`
  return types.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(" & ")
}
