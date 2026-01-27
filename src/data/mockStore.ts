/**
 * Mock Data Store
 * 
 * Centralized in-memory data store for development and testing.
 * Phase 1: Read-only access only. No mutations.
 */

import type { User, Client, Task } from "@/src/domain/models"

// ============================================================================
// Mock Data Store (Read-Only for Phase 1)
// ============================================================================

class MockStore {
  // In-memory storage (read-only access in Phase 1)
  private readonly users: User[] = []
  private readonly clients: Client[] = []
  private readonly employees: any[] = [] // Using Worker model for now
  private readonly tasks: Task[] = []
  private readonly payments: any[] = []
  private readonly settings: Record<string, any> = {}

  constructor() {
    this.initializeSeedData()
  }

  // ============================================================================
  // Read-Only Accessors (Phase 1)
  // ============================================================================

  getUsers(): User[] {
    return [...this.users] // Return copy to prevent mutations
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id)
  }

  getUsersByRole(role: User["role"]): User[] {
    return this.users.filter((u) => u.role === role)
  }

  getUsersByStatus(status: User["status"]): User[] {
    return this.users.filter((u) => u.status === status)
  }

  getClients(): Client[] {
    return [...this.clients] // Return copy
  }

  getClientById(id: string): Client | undefined {
    return this.clients.find((c) => c.id === id)
  }

  getEmployees(): any[] {
    return [...this.employees] // Return copy
  }

  getEmployeeById(id: string): any | undefined {
    return this.employees.find((e) => e.id === id)
  }

  getTasks(): Task[] {
    return [...this.tasks] // Return copy
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find((t) => t.id === id)
  }

  getTasksByStatus(status: Task["status"]): Task[] {
    return this.tasks.filter((t) => t.status === status)
  }

  getPayments(): any[] {
    return [...this.payments] // Return copy
  }

  getSettings(): Record<string, any> {
    return { ...this.settings } // Return copy
  }

  getSetting(key: string): any {
    return this.settings[key]
  }

  // ============================================================================
  // Seed Data Initialization
  // ============================================================================

  private initializeSeedData() {
    // Seed Users (20+ users)
    this.users.push(
      {
        id: "user-1",
        name: "Maria Rodriguez",
        email: "maria@email.com",
        role: "Client",
        status: "Active",
        joinDate: "2024-01-15",
      },
      {
        id: "user-2",
        name: "James Wilson",
        email: "james@email.com",
        role: "Worker",
        status: "Active",
        joinDate: "2024-01-12",
      },
      {
        id: "user-3",
        name: "Sarah Johnson",
        email: "sarah@email.com",
        role: "Client",
        status: "Pending",
        joinDate: "2024-01-10",
      },
      {
        id: "user-4",
        name: "Mike Chen",
        email: "mike@email.com",
        role: "Supervisor",
        status: "Active",
        joinDate: "2024-01-08",
      },
      {
        id: "user-5",
        name: "Josue Garcia",
        email: "josue.garcia@jjdesertlandscaping.com",
        role: "Admin",
        status: "Active",
        joinDate: "2023-12-01",
      },
      {
        id: "user-6",
        name: "Emily Davis",
        email: "emily@email.com",
        role: "Client",
        status: "Active",
        joinDate: "2024-01-05",
      },
      {
        id: "user-7",
        name: "Robert Martinez",
        email: "robert@email.com",
        role: "Worker",
        status: "Active",
        joinDate: "2024-01-03",
      },
      {
        id: "user-8",
        name: "Lisa Anderson",
        email: "lisa@email.com",
        role: "Client",
        status: "Inactive",
        joinDate: "2023-11-20",
      },
      {
        id: "user-9",
        name: "David Thompson",
        email: "david@email.com",
        role: "Supervisor",
        status: "Active",
        joinDate: "2023-12-15",
      },
      {
        id: "user-10",
        name: "Jennifer Brown",
        email: "jennifer@email.com",
        role: "Client",
        status: "Active",
        joinDate: "2024-01-01",
      },
      {
        id: "user-11",
        name: "Michael Lee",
        email: "michael@email.com",
        role: "Worker",
        status: "Active",
        joinDate: "2023-12-20",
      },
      {
        id: "user-12",
        name: "Amanda White",
        email: "amanda@email.com",
        role: "Client",
        status: "Pending",
        joinDate: "2024-01-18",
      },
      {
        id: "user-13",
        name: "Christopher Taylor",
        email: "christopher@email.com",
        role: "Worker",
        status: "Active",
        joinDate: "2024-01-02",
      },
      {
        id: "user-14",
        name: "Jessica Moore",
        email: "jessica@email.com",
        role: "Client",
        status: "Active",
        joinDate: "2023-12-10",
      },
      {
        id: "user-15",
        name: "Daniel Harris",
        email: "daniel@email.com",
        role: "Supervisor",
        status: "Active",
        joinDate: "2023-11-25",
      },
      {
        id: "user-16",
        name: "Ashley Clark",
        email: "ashley@email.com",
        role: "Client",
        status: "Active",
        joinDate: "2024-01-07",
      },
      {
        id: "user-17",
        name: "Matthew Lewis",
        email: "matthew@email.com",
        role: "Worker",
        status: "Inactive",
        joinDate: "2023-10-15",
      },
      {
        id: "user-18",
        name: "Nicole Walker",
        email: "nicole@email.com",
        role: "Client",
        status: "Active",
        joinDate: "2023-12-28",
      },
      {
        id: "user-19",
        name: "Andrew Hall",
        email: "andrew@email.com",
        role: "Worker",
        status: "Active",
        joinDate: "2024-01-09",
      },
      {
        id: "user-20",
        name: "Samantha Young",
        email: "samantha@email.com",
        role: "Client",
        status: "Active",
        joinDate: "2024-01-11",
      },
      {
        id: "user-21",
        name: "Ryan King",
        email: "ryan@email.com",
        role: "Client",
        status: "Pending",
        joinDate: "2024-01-19",
      }
    )

    // Seed Clients (10+ clients)
    this.clients.push(
      {
        id: "client-1",
        name: "Johnson Family",
        email: "johnson@example.com",
        phone: "+1-555-0101",
        address: "1234 Desert View Dr, Phoenix, AZ 85001",
        serviceHistory: [],
        totalSpent: 2450.0,
      },
      {
        id: "client-2",
        name: "Smith Property Management",
        email: "smith@example.com",
        phone: "+1-555-0102",
        address: "5678 Cactus Rd, Phoenix, AZ 85002",
        serviceHistory: [],
        totalSpent: 12500.0,
      },
      {
        id: "client-3",
        name: "Martinez Residence",
        email: "martinez@example.com",
        phone: "+1-555-0103",
        address: "9012 Mountain View Ave, Phoenix, AZ 85003",
        serviceHistory: [],
        totalSpent: 1800.0,
      },
      {
        id: "client-4",
        name: "Thompson Commercial",
        email: "thompson@example.com",
        phone: "+1-555-0104",
        address: "3456 Business Blvd, Phoenix, AZ 85004",
        serviceHistory: [],
        totalSpent: 32000.0,
      },
      {
        id: "client-5",
        name: "Davis Home",
        email: "davis@example.com",
        phone: "+1-555-0105",
        address: "7890 Palm Street, Phoenix, AZ 85005",
        serviceHistory: [],
        totalSpent: 950.0,
      },
      {
        id: "client-6",
        name: "Anderson Estate",
        email: "anderson@example.com",
        phone: "+1-555-0106",
        address: "2345 Sunset Drive, Phoenix, AZ 85006",
        serviceHistory: [],
        totalSpent: 5600.0,
      },
      {
        id: "client-7",
        name: "Brown Property",
        email: "brown@example.com",
        phone: "+1-555-0107",
        address: "6789 Desert Rose Lane, Phoenix, AZ 85007",
        serviceHistory: [],
        totalSpent: 2100.0,
      },
      {
        id: "client-8",
        name: "White Residence",
        email: "white@example.com",
        phone: "+1-555-0108",
        address: "1234 Cactus Way, Phoenix, AZ 85008",
        serviceHistory: [],
        totalSpent: 3800.0,
      },
      {
        id: "client-9",
        name: "Moore Family",
        email: "moore@example.com",
        phone: "+1-555-0109",
        address: "4567 Mountain Peak Rd, Phoenix, AZ 85009",
        serviceHistory: [],
        totalSpent: 1500.0,
      },
      {
        id: "client-10",
        name: "Harris Commercial",
        email: "harris@example.com",
        phone: "+1-555-0110",
        address: "8901 Corporate Center, Phoenix, AZ 85010",
        serviceHistory: [],
        totalSpent: 18500.0,
      },
      {
        id: "client-11",
        name: "Clark Home",
        email: "clark@example.com",
        phone: "+1-555-0111",
        address: "5678 Valley View, Phoenix, AZ 85011",
        serviceHistory: [],
        totalSpent: 1200.0,
      },
      {
        id: "client-12",
        name: "Lewis Property",
        email: "lewis@example.com",
        phone: "+1-555-0112",
        address: "3456 Desert Bloom, Phoenix, AZ 85012",
        serviceHistory: [],
        totalSpent: 2900.0,
      }
    )

    // Seed Employees (using Worker model structure)
    this.employees.push(
      {
        id: "employee-1",
        name: "Mike Rodriguez",
        role: "Lawn Specialist",
        avatar: "/professional-lawn-worker.jpg",
        status: "available",
        rating: 4.8,
        completedTasks: 156,
      },
      {
        id: "employee-2",
        name: "Sarah Chen",
        role: "Landscape Designer",
        avatar: "/female-landscape-designer.jpg",
        status: "busy",
        rating: 4.9,
        completedTasks: 89,
      },
      {
        id: "employee-3",
        name: "David Wilson",
        role: "Tree Specialist",
        avatar: "/tree-specialist-worker.jpg",
        status: "available",
        rating: 4.7,
        completedTasks: 203,
      },
      {
        id: "employee-4",
        name: "Robert Martinez",
        role: "Irrigation Specialist",
        avatar: "/placeholder-user.jpg",
        status: "available",
        rating: 4.6,
        completedTasks: 112,
      },
      {
        id: "employee-5",
        name: "Christopher Taylor",
        role: "Hardscaping Specialist",
        avatar: "/placeholder-user.jpg",
        status: "busy",
        rating: 4.8,
        completedTasks: 78,
      },
      {
        id: "employee-6",
        name: "Andrew Hall",
        role: "Lawn Specialist",
        avatar: "/placeholder-user.jpg",
        status: "available",
        rating: 4.5,
        completedTasks: 95,
      },
      {
        id: "employee-7",
        name: "Michael Lee",
        role: "Supervisor",
        avatar: "/placeholder-user.jpg",
        status: "available",
        rating: 4.9,
        completedTasks: 0, // Supervisors don't have completed tasks
      }
    )

    // Seed Tasks (extend existing)
    this.tasks.push(
      {
        id: "1",
        title: "Weekly Lawn Maintenance - Johnson Residence",
        description: "Mow, edge, and trim lawn. Remove clippings.",
        status: "pending",
        priority: "medium",
        assignedTo: "Mike Rodriguez",
        dueDate: "2024-01-15",
        location: "1234 Desert View Dr, Phoenix, AZ",
        estimatedDuration: "2 hours",
      },
      {
        id: "2",
        title: "Landscape Installation - Smith Property",
        description: "Install new desert landscaping with native plants",
        status: "in-progress",
        priority: "high",
        assignedTo: "Sarah Chen",
        dueDate: "2024-01-18",
        location: "5678 Cactus Rd, Phoenix, AZ",
        estimatedDuration: "6 hours",
      },
      {
        id: "3",
        title: "Tree Trimming - Office Complex",
        description: "Trim palm trees and remove dead branches",
        status: "completed",
        priority: "low",
        assignedTo: "David Wilson",
        dueDate: "2024-01-12",
        location: "9012 Business Blvd, Phoenix, AZ",
        estimatedDuration: "4 hours",
      },
      {
        id: "4",
        title: "Irrigation Repair - Martinez Residence",
        description: "Fix broken sprinkler heads and adjust timing",
        status: "pending",
        priority: "high",
        assignedTo: "Robert Martinez",
        dueDate: "2024-01-20",
        location: "9012 Mountain View Ave, Phoenix, AZ",
        estimatedDuration: "3 hours",
      },
      {
        id: "5",
        title: "Patio Installation - Thompson Commercial",
        description: "Install flagstone patio with fire pit",
        status: "in-progress",
        priority: "medium",
        assignedTo: "Christopher Taylor",
        dueDate: "2024-01-22",
        location: "3456 Business Blvd, Phoenix, AZ",
        estimatedDuration: "8 hours",
      },
      {
        id: "6",
        title: "Weekly Maintenance - Davis Home",
        description: "Standard lawn care service",
        status: "completed",
        priority: "low",
        assignedTo: "Andrew Hall",
        dueDate: "2024-01-14",
        location: "7890 Palm Street, Phoenix, AZ",
        estimatedDuration: "2 hours",
      }
    )

    // Seed Payments (mock structure)
    this.payments.push(
      {
        id: "payment-1",
        clientId: "client-1",
        amount: 150.0,
        status: "completed",
        date: "2024-01-10",
        method: "credit_card",
      },
      {
        id: "payment-2",
        clientId: "client-2",
        amount: 500.0,
        status: "completed",
        date: "2024-01-12",
        method: "ach",
      },
      {
        id: "payment-3",
        clientId: "client-1",
        amount: 150.0,
        status: "pending",
        date: "2024-01-15",
        method: "credit_card",
      },
      {
        id: "payment-4",
        clientId: "client-3",
        amount: 200.0,
        status: "completed",
        date: "2024-01-08",
        method: "check",
      },
      {
        id: "payment-5",
        clientId: "client-4",
        amount: 1200.0,
        status: "completed",
        date: "2024-01-05",
        method: "ach",
      }
    )

    // Seed Settings
    this.settings = {
      companyName: "J&J Desert Landscaping LLC",
      companyEmail: "info@jjdesertlandscaping.com",
      companyPhone: "+1-555-0123",
      timezone: "America/Phoenix",
      currency: "USD",
      taxRate: 0.08,
      enableNotifications: true,
      enableEmailAlerts: true,
      maintenanceMode: false,
    }
  }
}

// Singleton instance
export const mockStore = new MockStore()
