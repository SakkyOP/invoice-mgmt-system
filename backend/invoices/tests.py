from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Invoice, InvoiceDetail
from datetime import date
from .serializers import InvoiceSerializer

# Model Tests
class InvoiceModelTestCase(TestCase):
    def setUp(self):
        self.invoice = Invoice.objects.create(
            invoice_number="INV-001",
            customer_name="John Doe",
            date=date(2024, 1, 1)
        )

    def tearDown(self):
        self.invoice.delete()
    
    def test_invoice_creation(self):
        self.assertEqual(self.invoice.invoice_number, "INV-001")
        self.assertEqual(self.invoice.customer_name, "John Doe")
        self.assertEqual(self.invoice.date, date(2024, 1, 1))

    def test_invoice_str_method(self):
        self.assertEqual(str(self.invoice), "Invoice INV-001 - John Doe")


class InvoiceDetailModelTestCase(TestCase):
    def setUp(self):
        self.invoice = Invoice.objects.create(
            invoice_number="INV-001",
            customer_name="John Doe"
        )
        self.invoice_detail = InvoiceDetail.objects.create(
            invoice=self.invoice,
            description="Product A",
            quantity=2,
            unit_price=50.00,
            line_total=100.00
        )

    def tearDown(self):
        self.invoice_detail.delete()
        self.invoice.delete()
    
    def test_invoice_detail_creation(self):
        self.assertEqual(self.invoice_detail.description, "Product A")
        self.assertEqual(self.invoice_detail.quantity, 2)
        self.assertEqual(self.invoice_detail.unit_price, 50.00)
        self.assertEqual(self.invoice_detail.line_total, 100.00)

    def test_invoice_foreign_key(self):
        self.assertEqual(self.invoice_detail.invoice, self.invoice)


# Serializers Tests
class InvoiceSerializerTestCase(TestCase):
    def setUp(self):
        self.invoice_data = {
            "invoice_number": "INV-002",
            "customer_name": "Jane Doe",
            "details": [
                {
                    "description": "Product B",
                    "quantity": 1,
                    "unit_price": "100.00"
                }
            ]
        }

    def test_invoice_serializer_valid(self):
        serializer = InvoiceSerializer(data=self.invoice_data)
        self.assertTrue(serializer.is_valid())

    def test_invoice_serializer_create(self):
        serializer = InvoiceSerializer(data=self.invoice_data)
        if serializer.is_valid():
            invoice = serializer.save()
            self.assertEqual(invoice.invoice_number, "INV-002")
            self.assertEqual(invoice.customer_name, "Jane Doe")
            self.assertEqual(invoice.details.count(), 1)

# API Client Testfrom django.urls import reverse
class InvoiceAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.invoice = Invoice.objects.create(
            invoice_number="INV-003",
            customer_name="Alice",
            date=date(2024, 1, 2)
        )
        self.invoice_detail = InvoiceDetail.objects.create(
            invoice=self.invoice,
            description="Product C",
            quantity=3,
            unit_price=30.00,
            line_total=90.00
        )

        self.invoice_list_url = reverse('invoice-list')  # URL for /invoices/
    
    def test_list_invoices(self):
        response = self.client.get(self.invoice_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 4)

    def test_create_invoice(self):
        invoice_data = {
            "invoice_number": "INV-004",
            "customer_name": "Bob",
            "details": [
                {
                    "description": "Product D",
                    "quantity": 4,
                    "unit_price": "25.00"
                }
            ]
        }
        response = self.client.post(self.invoice_list_url, invoice_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Invoice.objects.count(), 2)
        self.assertEqual(InvoiceDetail.objects.count(), 2)

    def test_update_invoice(self):
        update_data = {
            "invoice_number": "INV-004",
            "customer_name": "Alice Updated",
            "details": [
                {
                    "id": self.invoice_detail.id,
                    "description": "Product C Updated",
                    "quantity": 5,
                    "unit_price": "35.00"
                }
            ]
        }
        response = self.client.put(self.invoice_list_url + f"{self.invoice.id}/", update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.invoice.refresh_from_db()
        self.assertEqual(self.invoice.customer_name, "Alice Updated")
        self.assertEqual(self.invoice.details.first().description, "Product C Updated")

    def test_delete_invoice(self):
        response = self.client.delete(self.invoice_list_url + f"{self.invoice.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Invoice.objects.count(), 0)

