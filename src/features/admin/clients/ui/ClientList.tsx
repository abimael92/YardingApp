/**
 * Client List Component — admin earthy styling
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import {
  PlusIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import { getAllClients, deleteClient } from "@/src/services/clientService"
import type { Client as ClientEntity } from "@/src/domain/entities"
import { ClientStatus, ClientSegment } from "@/src/domain/entities"
import ClientForm from "./ClientForm"
import ClientDetail from "./ClientDetail"
import {
  AdminPageHeader,
  AdminHeaderButton,
  AdminStatsCard,
  AdminFilterSection,
  AdminSearchInput,
  AdminFilterSelect,
  adminStatusBadgeClass,
} from "@/src/features/admin/ui"

const ClientList = () => {
  const [clients, setClients] = useState<ClientEntity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientEntity | null>(null)
  const [editingClient, setEditingClient] = useState<ClientEntity | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const loadClients = async () => {
    setIsLoading(true)
    try {
      const allClients = await getAllClients()
      setClients(allClients)
    } catch (error) {
      console.error("Failed to load clients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesStatus = statusFilter === "all" || c.status === statusFilter
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.contactInfo.email.toLowerCase().includes(q) ||
        c.contactInfo.phone.includes(q)
      return matchesStatus && matchesSearch
    })
  }, [clients, searchQuery, statusFilter])

  const stats = useMemo(() => {
    const total = clients.length
    const active = clients.filter((c) => c.status === ClientStatus.ACTIVE).length
    const pending = clients.filter((c) => c.status === ClientStatus.PENDING).length
    const vip = clients.filter((c) => c.segment === ClientSegment.VIP).length
    return { total, active, pending, vip }
  }, [clients])

  const handleCreate = () => {
    setEditingClient(null)
    setIsFormOpen(true)
  }

  const handleEdit = (client: ClientEntity) => {
    setEditingClient(client)
    setIsFormOpen(true)
  }

  const handleView = (client: ClientEntity) => {
    setSelectedClient(client)
    setIsDetailOpen(true)
  }

  const handleDelete = async (client: ClientEntity) => {
    if (!confirm(`Are you sure you want to delete ${client.name}?`)) return
    try {
      await deleteClient(client.id)
      await loadClients()
    } catch (error) {
      console.error("Failed to delete client:", error)
      alert("Failed to delete client")
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingClient(null)
  }

  const handleFormSuccess = async () => {
    handleFormClose()
    await loadClients()
  }

  const formatCurrency = (money: { amount: number; currency: string }) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: money.currency }).format(money.amount)

  const getStatusBadge = (status: ClientStatus) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${adminStatusBadgeClass(status)}`}>
      {status}
    </span>
  )

  const columns: Column<ClientEntity>[] = [
    {
      key: "name",
      header: "Name",
      render: (client) => (
        <div className="font-medium text-[#8b4513] dark:text-[#d4a574]">{client.name}</div>
      ),
    },
    {
      key: "contactInfo",
      header: "Contact",
      render: (client) => (
        <div>
          <div className="text-gray-900 dark:text-white">{client.contactInfo.email}</div>
          <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400">{client.contactInfo.phone}</div>
        </div>
      ),
    },
    {
      key: "primaryAddress",
      header: "Address",
      render: (client) => (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {client.primaryAddress.street}, {client.primaryAddress.city}, {client.primaryAddress.state}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (client) => getStatusBadge(client.status),
    },
    {
      key: "totalSpent",
      header: "Total Spent",
      render: (client) => (
        <span className="font-medium text-[#8b4513] dark:text-[#d4a574]">{formatCurrency(client.totalSpent)}</span>
      ),
    },
  ]

  if (isLoading) {
    return <LoadingState message="Loading clients..." />
  }

  return (
    <>
      <div className="space-y-8">
        <AdminPageHeader
          title="Clients"
          subtitle="Manage all client accounts, contact info, and service history."
          icon={<UserGroupIcon className="w-7 h-7 text-white" />}
          actions={
            <>
              <AdminHeaderButton onClick={handleCreate}>
                <PlusIcon className="w-5 h-5" />
                Add Client
              </AdminHeaderButton>
            </>
          }
        />

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminStatsCard label="Total clients" value={stats.total} icon={<UserGroupIcon />} variant="default" />
            <AdminStatsCard label="Active" value={stats.active} icon={<ChartBarIcon />} variant="green" />
            <AdminStatsCard label="Pending" value={stats.pending} icon={<BuildingOfficeIcon />} variant="orange" />
            <AdminStatsCard label="VIP segment" value={stats.vip} icon={<CurrencyDollarIcon />} variant="brown" />
          </div>
        </section>

        <AdminFilterSection title="Search & filters">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminSearchInput
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search clients"
            />
            <AdminFilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              label="Status"
              icon={<UserGroupIcon className="w-4 h-4" />}
              options={[
                { value: "all", label: "All statuses" },
                { value: ClientStatus.ACTIVE, label: "Active" },
                { value: ClientStatus.PENDING, label: "Pending" },
                { value: ClientStatus.INACTIVE, label: "Inactive" },
                { value: ClientStatus.SUSPENDED, label: "Suspended" },
              ]}
            />
          </div>
        </AdminFilterSection>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">Client list</h2>
          <DataTable
            data={filteredClients}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            keyExtractor={(client) => client.id}
            emptyMessage="No clients match your filters. Try adjusting search or add a new client."
          />
        </section>
      </div>

      <ClientForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        client={editingClient}
      />

      {selectedClient && (
        <ClientDetail
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedClient(null)
          }}
          client={selectedClient}
        />
      )}
    </>
  )
}

export default ClientList
