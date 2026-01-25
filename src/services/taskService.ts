import { tasks } from "@/src/data/mockData"
import type { Task } from "@/src/domain/models"

export const getTasks = (): Task[] => tasks
