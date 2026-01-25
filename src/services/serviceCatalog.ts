import { services } from "@/src/data/mockData"
import type { Service } from "@/src/domain/models"

export const getServices = (): Service[] => services
