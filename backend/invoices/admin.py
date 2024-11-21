from django.contrib import admin
from .models import Invoice, InvoiceDetail

@admin.register(Invoice, InvoiceDetail)
class InvoiceAdmin(admin.ModelAdmin):
    pass
