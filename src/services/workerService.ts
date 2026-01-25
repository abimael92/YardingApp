import { workers } from "@/src/data/mockData"
import type { Worker } from "@/src/domain/models"

export const getWorkers = (): Worker[] => workers
