"use client"

import { formatISO } from 'date-fns'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
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
  description: string
  quantity: number
  unit_price: number
}

interface AddInvoiceDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddInvoice: () => void
}

export default function AddInvoiceDialog({ isOpen, onClose, onAddInvoice }: AddInvoiceDialogProps) {
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [details, setDetails] = useState<InvoiceDetail[]>([{ description: '', quantity: 0, unit_price: 0 }])
  const [error, setError] = useState<string | null>(null)

  const handleAddDetail = () => {
    setDetails([...details, { description: '', quantity: 0, unit_price: 0 }])
  }

  const handleRemoveDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index))
  }

  const handleDetailChange = <K extends keyof InvoiceDetail>(index: number, field: K, value: InvoiceDetail[K]) => {
    const newDetails = [...details]
    newDetails[index][field] = value
    setDetails(newDetails)
  }
  
  const handleSubmit = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_VITE_BACKEND_URL?? ""}/api/invoices/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_number: invoiceNumber,
          customer_name: customerName,
          date: formatISO(date??"", {representation: "date"}),
          details,
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to add invoice')
      }
      onAddInvoice()
    } catch (error) {
      setError('Error adding invoice. Please try again.')
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Invoice</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invoice_number" className="text-right">
                Invoice Number
              </Label>
              <Input
                id="invoice_number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer_name" className="text-right">
                Customer Name
              </Label>
              <Input
                id="customer_name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <DatePicker
                selected={date}
                onSelect={setDate}
                className="col-span-3"
              />
            </div>
            {details.map((detail, index) => (
              <div key={index} className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`description_${index}`} className="text-right">
                    Description
                  </Label>
                  <Input
                    id={`description_${index}`}
                    value={detail.description}
                    onChange={(e) => handleDetailChange(index, 'description', e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`quantity_${index}`} className="text-right">
                    Quantity
                  </Label>
                  <Input
                    id={`quantity_${index}`}
                    type="number"
                    value={detail.quantity}
                    onChange={(e) => handleDetailChange(index, 'quantity', parseInt(e.target.value))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`unit_price_${index}`} className="text-right">
                    Unit Price
                  </Label>
                  <Input
                    id={`unit_price_${index}`}
                    type="number"
                    step="0.01"
                    value={detail.unit_price}
                    onChange={(e) => handleDetailChange(index, 'unit_price', parseFloat(e.target.value))}
                    className="col-span-3"
                  />
                </div>
                {index > 0 && (
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveDetail(index)}>
                    ❌
                  </Button>
                )}
              </div>
            ))}
            <Button onClick={handleAddDetail}>
              + Add Detail
            </Button>
          </div>
          <Button onClick={handleSubmit}>Add Invoice</Button>
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

