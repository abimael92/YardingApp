/**
 * Client List Component
 * 
 * Displays all clients in a table with CRUD actions
 */

"use client"

import { useState, useEffect } from "react"
import { PlusIcon } from "@heroicons/react/24/outline"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import { getAllClients, deleteClient } from "@/src/services/clientService"
import type { Client as ClientEntity } from "@/src/domain/entities"
import { ClientStatus, ClientSegment } from "@/src/domain/entities"
import ClientForm from "./ClientForm"
import ClientDetail from "./ClientDetail"

const ClientList = () => {
  const [clients, setClients] = useState<ClientEntity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientEntity | null>(null)
  const [editingClient, setEditingClient] = useState<ClientEntity | null>(null)

  const loadClients = async () => {
    setIsLoading(true)
    try {
      const data = await getAllClients()
      setClients(data)
    } catch (error) {
      console.error("Failed to load clients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

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
    if (!confirm(`Are you sure you want to delete ${client.name}?`)) {
      return
    }

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

  const formatCurrency = (money: { amount: number; currency: string }) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currency,
    }).format(money.amount)
  }

  const getStatusBadge = (status: ClientStatus) => {
    const colors: Record<ClientStatus, string> = {
      [ClientStatus.ACTIVE]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      [ClientStatus.INACTIVE]:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      [ClientStatus.PENDING]:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      [ClientStatus.SUSPENDED]:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    )
  }

  const columns: Column<ClientEntity>[] = [
    {
      key: "name",
      header: "Name",
      render: (client) => (
        <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
      ),
    },
    {
      key: "contactInfo",
      header: "Contact",
      render: (client) => (
        <div>
          <div className="text-gray-900 dark:text-white">{client.contactInfo.email}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{client.contactInfo.phone}</div>
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
        <span className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(client.totalSpent)}
        </span>
      ),
    },
  ]

  if (isLoading) {
    return <LoadingState message="Loading clients..." />
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all client accounts and information
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Client
          </button>
        </div>

        {/* Table */}
        <DataTable
          data={clients}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          keyExtractor={(client) => client.id}
          emptyMessage="No clients found. Create your first client to get started."
        />
      </div>

      {/* Form Modal */}
      <ClientForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        client={editingClient}
      />

      {/* Detail Modal */}
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
