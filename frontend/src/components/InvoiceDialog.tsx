import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

interface InvoiceDialogProps {
  invoice: Invoice
  onClose: () => void
}

export default function InvoiceDialog({ invoice, onClose }: InvoiceDialogProps) {
  const [details, setDetails] = useState<InvoiceDetail[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchInvoiceDetails()
  }, [invoice])

  const fetchInvoiceDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.BACKEND_URL?? "http://localhost:8000"}/api/invoices/${invoice.id}/details/`)
      const data = await response.json()
      const formattedData = data.map((detail: any) => ({
      ...detail,
      quantity: Number(detail.quantity),
      unit_price: Number(detail.unit_price),
      line_total: Number(detail.line_total),
    }));
      setDetails(formattedData)
      setTotal(formattedData.reduce((sum: number, detail: InvoiceDetail) => sum + detail.line_total, 0))
    } catch (error) {
      console.error('Error fetching invoice details:', error)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>Invoice Number: {invoice.invoice_number}</div>
          <div>Customer Name: {invoice.customer_name}</div>
          <div>Date: {invoice.date}</div>
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
                  <TableCell>{detail.description}</TableCell>
                  <TableCell>{detail.quantity}</TableCell>
                  <TableCell>${detail.unit_price.toFixed(2)}</TableCell>
                  <TableCell>${detail.line_total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="font-bold">Total: ${total.toFixed(2)}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

