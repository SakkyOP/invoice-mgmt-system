import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { DatePicker } from "@/components/ui/date-picker"

interface FilterDialogProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: Record<string, any>) => void
}

export default function FilterDialog({ isOpen, onClose, onApplyFilters }: FilterDialogProps) {
  const [filters, setFilters] = useState<Record<string, any>>({})

  const handleFilterChange = (key: string, value: any) => {
    let updatedFilters = { ...filters }

    switch (key) {
      case 'quantity_range':
        delete updatedFilters.quantity_range
        updatedFilters.details__min_quantity = value[0]
        updatedFilters.details__max_quantity = value[1]
        break
      case 'unit_price_range':
        delete updatedFilters.unit_price_range
        updatedFilters.details__min_unit_price = value[0]
        updatedFilters.details__max_unit_price = value[1]
        break
      case 'total_value_range':
        delete updatedFilters.total_value_range
        updatedFilters.min_total_value = value[0]
        updatedFilters.max_total_value = value[1]
        break
      default:
        updatedFilters[key] = value
    }

    if (!updatedFilters.end_date && updatedFilters.start_date) {
      updatedFilters.date = updatedFilters.start_date
    }
    if (updatedFilters.end_date && ! updatedFilters.start_date) {
      updatedFilters.start_date = Date.now()
    }

    setFilters(updatedFilters)
  }

  const handleApplyFilters = () => {
    onApplyFilters(filters)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Invoices</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="invoice_number" className="text-right">
              Invoice Number
            </Label>
            <Input
              id="invoice_number"
              value={filters.invoice_number || ''}
              onChange={(e) => handleFilterChange('invoice_number', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customer_name" className="text-right">
              Customer Name
            </Label>
            <Input
              id="customer_name"
              value={filters.customer_name || ''}
              onChange={(e) => handleFilterChange('customer_name', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Start Date</Label>
            <DatePicker
              selected={filters.start_date}
              onSelect={(date) => handleFilterChange('start_date', date)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">End Date</Label>
            <DatePicker
              selected={filters.end_date}
              onSelect={(date) => handleFilterChange('end_date', date)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="details__description" className="text-right">
              Description
            </Label>
            <Input
              id="details__description"
              value={filters.details__description || ''}
              onChange={(e) => handleFilterChange('details__description', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Quantity Range</Label>
            <div className="col-span-3">
              <Slider
                defaultValue={[0, 100]}
                max={100}
                step={1}
                onValueChange={(value) => handleFilterChange('quantity_range', value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Unit Price Range</Label>
            <div className="col-span-3">
              <Slider
                defaultValue={[0, 1000]}
                max={1000}
                step={1}
                onValueChange={(value) => handleFilterChange('unit_price_range', value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Total Value Range</Label>
            <div className="col-span-3">
              <Slider
                defaultValue={[0, 10000]}
                max={10000}
                step={100}
                onValueChange={(value) => handleFilterChange('total_value_range', value)}
              />
            </div>
          </div>
        </div>
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
      </DialogContent>
    </Dialog>
  )
}

