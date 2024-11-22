"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DatePicker } from '@/components/ui/date-picker'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface InvoiceDetail {
  id: number
  description: string
  quantity: number
  unit_price: number
  line_total: number
}

interface Invoice {
  id: number
  invoice_number: string
  customer_name: string
  date: string
}

interface EditInvoiceDialogProps {
  invoice: Invoice
  onClose: () => void
  onUpdate: () => void
}

export default function EditInvoiceDialog({ invoice, onClose, onUpdate }: EditInvoiceDialogProps) {
  const [editedInvoice, setEditedInvoice] = useState<Invoice>(invoice)
  const [details, setDetails] = useState<InvoiceDetail[]>([])
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date(invoice.date))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoiceDetails()
  }, [invoice])

  const fetchInvoiceDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000"}/api/invoices/${invoice.id}/details/`)
      if (!response.ok) {
        throw new Error('Error fetching invoice details')
      }
      const data = await response.json()
      setDetails(data)
    } catch (error) {
      setError('Error fetching invoice details. Please try again.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedInvoice(prev => ({ ...prev, [name]: value }))
  }

  const handleDetailChange = (id: number, field: keyof InvoiceDetail, value: string | number) => {
    setDetails(prev => prev.map(detail =>
      detail.id === id ? { ...detail, [field]: value } : detail
    ))
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL ?? ""}/api/invoices/${invoice.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editedInvoice,
          date: invoiceDate?.toISOString().split('T')[0],
          details,
        }),
      })
      if (response.ok) {
        onUpdate()
        onClose()
      } else {
        throw new Error("Failed to update invoice")
      }
    } catch (error) {
      setError("Error updating invoice. Please try again.")
    }
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invoice_number" className="text-right">
                Invoice Number
              </Label>
              <Input
                id="invoice_number"
                name="invoice_number"
                value={editedInvoice.invoice_number}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer_name" className="text-right">
                Customer Name
              </Label>
              <Input
                id="customer_name"
                name="customer_name"
                value={editedInvoice.customer_name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <DatePicker
                selected={invoiceDate}
                onSelect={(date) => setInvoiceDate(date)}
                className="col-span-3"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.map((detail) => (
                  <TableRow key={detail.id}>
                    <TableCell>
                      <Input
                        value={detail.description}
                        onChange={(e) => handleDetailChange(detail.id, 'description', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={detail.quantity}
                        onChange={(e) => handleDetailChange(detail.id, 'quantity', parseInt(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={detail.unit_price}
                        onChange={(e) => handleDetailChange(detail.id, 'unit_price', parseFloat(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>${(detail.quantity * detail.unit_price).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button onClick={handleSubmit}>Update Invoice</Button>
        </DialogContent>
      </Dialog>
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
    </>
  )
}

