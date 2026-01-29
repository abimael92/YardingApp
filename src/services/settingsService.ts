/**
 * Settings Service
 * 
 * Service layer for system settings management.
 * Phase 1: Read-only access only.
 */

import { mockStore } from "@/src/data/mockStore"

// ============================================================================
// Service Interface (API-ready)
// ============================================================================

export interface SettingsService {
  getAll(): Record<string, unknown>
  get(key: string): unknown
}

// ============================================================================
// Service Implementation (Read-Only for Phase 1)
// ============================================================================

export const settingsService: SettingsService = {
  getAll: () => mockStore.getSettings(),

  get: (key: string) => mockStore.getSetting(key),
}

// ============================================================================
// Convenience Functions
// ============================================================================

export const getAllSettings = () => settingsService.getAll()
export const getSetting = (key: string) => settingsService.get(key)
