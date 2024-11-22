"use client"

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import InvoiceDialog from './InvoiceDialog'
import AddInvoiceDialog from './AddInvoiceDialog'
import EditInvoiceDialog from './EditInvoiceDialog'
import Pagination from './Pagination'
import { useTheme } from "next-themes"
import { Moon, Sun, Filter, Plus, RefreshCcw, MoreVertical } from 'lucide-react'
import FilterDialog from './FilterDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Invoice {
  id: number
  invoice_number: string
  customer_name: string
  date: string
}

export default function InvoiceTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [filters, setFilters] = useState({})
  const { setTheme, theme } = useTheme()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices(currentPage)
  }, [currentPage, filters])

  const fetchInvoices = async (page: number) => {
    try {
      const queryParams = new URLSearchParams({ page: page.toString(), ...filters })
      const response = await fetch(`${import.meta.env.VITE_VITE_BACKEND_URL?? "http://localhost:8000"}/api/invoices/?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch invoices')
      }
      const data = await response.json()
      setInvoices(data.results)
      setTotalPages(invoices.length>0 ? Math.ceil(data.count / invoices.length) : 1)
    } catch (error) {
      setError('Error fetching invoices. Please try again.')
    }
  }

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL?? "http://localhost:8000"}/api/invoices/${id}/`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Failed to delete invoice')
      }
      fetchInvoices(currentPage)
    } catch (error) {
      setError('Error deleting invoice. Please try again.')
    }
  }

  const handleRefresh = () => {
    fetchInvoices(currentPage)
  }

  const handleClearFilters = () => {
    setFilters({})
    setCurrentPage(1)
  }

  return (
    <div className="container mx-auto p-4 max-w-[1200px]">
      <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
        <h1 className="text-2xl font-bold whitespace-nowrap">Invoices</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <div className="hidden sm:flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsFilterDialogOpen(true)}>
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              <span className="hidden sm:inline">Clear Filters</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Invoice</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="sm:hidden">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsFilterDialogOpen(true)}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleClearFilters}>
                Clear Filters
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRefresh}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id} onClick={() => setSelectedInvoice(invoice)} className="cursor-pointer">
                <TableCell>{invoice.invoice_number}</TableCell>
                <TableCell>{invoice.customer_name}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(invoice) }}>
                    ✏️
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(invoice.id) }}>
                    🗑️
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {invoices.length === 0 && (
          <div className="text-center py-4">
            No invoices found. Try adjusting your filters or add a new invoice.
          </div>
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      {selectedInvoice && (
        <InvoiceDialog
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
      {editingInvoice && (
        <EditInvoiceDialog
          invoice={editingInvoice}
          onClose={() => setEditingInvoice(null)}
          onUpdate={() => {
            setEditingInvoice(null)
            fetchInvoices(currentPage)
          }}
        />
      )}
      <AddInvoiceDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAddInvoice={() => {
          setIsAddDialogOpen(false)
          fetchInvoices(currentPage)
        }}
      />
      <FilterDialog
        isOpen={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        onApplyFilters={(newFilters) => {
          if (newFilters.date && !newFilters.end_date){
            delete newFilters.start_date
          }
          setFilters(newFilters)
          setCurrentPage(1)
        }}
      />
      <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

