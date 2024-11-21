from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .pagination import InvoiceListPagination
from .models import Invoice, InvoiceDetail
from .serializers import InvoiceSerializer, InvoiceDetailSerializer
from .filters import InvoiceFilter

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.prefetch_related('details').all()
    serializer_class = InvoiceSerializer
    pagination_class = InvoiceListPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = InvoiceFilter
    
    @action(detail=True, methods=['get'])
    def totals(self, request, pk=None):
        invoice = self.get_object()
        total = sum(detail.line_total for detail in invoice.details.all())
        return Response({'invoice_id': invoice.id, 'total': total})
    
    ordering_fields = ['date', 'invoice_number', 'customer_name']
    ordering = ['-date']

class InvoiceDetailViewSet(viewsets.ModelViewSet):
    queryset = InvoiceDetail.objects.select_related('invoice').all()
    serializer_class = InvoiceDetailSerializer

    def get_queryset(self):
        invoice_id = self.kwargs['invoice_id']
        return self.queryset.filter(invoice__id=invoice_id)
    
    @action(detail=False, methods=['put'])
    def bulk_update(self, request):
        
        # This action expects a list of invoices to be updated
        updates = request.data
        if not isinstance(updates, list):
            return Response({"error": "Expected a list of updates."}, status=status.HTTP_400_BAD_REQUEST)

        response_data = []
        errors = []
        for update in updates:
            try:
                instance = InvoiceDetail.objects.get(pk=update.get('id'))
                serializer = self.get_serializer(instance, data=update, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                response_data.append(serializer.data)
            except Exception as e:
                errors.append({"id": update.get('id'), "error": str(e)})

        if errors:
            return Response(
                {"updated": response_data, "errors": errors},
                status=status.HTTP_207_MULTI_STATUS
            )

        return Response(response_data, status=status.HTTP_200_OK)