from django.db import models
from django.core.validators import MinValueValidator
from django.utils.timezone import now

class Invoice(models.Model):
    invoice_number = models.CharField(max_length=50, unique=True, db_index=True)
    customer_name = models.CharField(max_length=100, db_index=True)
    date = models.DateField(default=now().date)

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.customer_name}"
    
    class Meta:
        ordering = ["-date"] 

class InvoiceDetail(models.Model):
    invoice = models.ForeignKey(Invoice, related_name="details", on_delete=models.CASCADE)
    description = models.CharField(max_length=255, db_index=True)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    line_total = models.DecimalField(max_digits=12, decimal_places=2, editable=False)

    def save(self, *args, **kwargs):
        self.line_total = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Detail for Invoice {self.invoice.invoice_number}"
