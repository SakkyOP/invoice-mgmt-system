import django_filters
from django.db.models import Sum
from .models import InvoiceDetail, Invoice

class InvoiceDetailFilter(django_filters.FilterSet):
    description = django_filters.CharFilter(lookup_expr='icontains')  # Partial match for description
    quantity = django_filters.NumberFilter()  # Exact match for quantity
    min_quantity = django_filters.NumberFilter(field_name='quantity', lookup_expr='gte')  # Min quantity
    max_quantity = django_filters.NumberFilter(field_name='quantity', lookup_expr='lte')  # Max quantity
    min_unit_price = django_filters.NumberFilter(field_name='unit_price', lookup_expr='gte')  # Min price
    max_unit_price = django_filters.NumberFilter(field_name='unit_price', lookup_expr='lte')  # Max price
    
    class Meta:
        model = InvoiceDetail
        fields = ['description', 'quantity', 'unit_price']

class InvoiceFilter(django_filters.FilterSet):
    invoice_number = django_filters.CharFilter(lookup_expr='icontains')  # Partial match for invoice number
    customer_name = django_filters.CharFilter(lookup_expr='icontains')  # Partial match for customer name
    date = django_filters.DateFilter()  # Exact match for date
    start_date = django_filters.DateFilter(field_name='date', lookup_expr='gte')  # Invoices on or after date
    end_date = django_filters.DateFilter(field_name='date', lookup_expr='lte')  # Invoices on or before date

    details__description = django_filters.CharFilter(field_name='details__description', lookup_expr='icontains')
    details__min_quantity = django_filters.NumberFilter(field_name='details__quantity', lookup_expr='gte')
    details__max_quantity = django_filters.NumberFilter(field_name='details__quantity', lookup_expr='lte')
    details__min_unit_price = django_filters.NumberFilter(field_name='details__unit_price', lookup_expr='gte')
    details__max_unit_price = django_filters.NumberFilter(field_name='details__unit_price', lookup_expr='lte')

    min_total_value = django_filters.NumberFilter(method='filter_min_total_value', label='Minimum Total Value')
    max_total_value = django_filters.NumberFilter(method='filter_max_total_value', label='Maximum Total Value')

    class Meta:
        model = Invoice
        fields = [
            'invoice_number',
            'customer_name',
            'date',
            'details__description',
            'details__quantity',
            'details__unit_price'
        ]

    def filter_min_total_value(self, queryset, name, value):
        return queryset.annotate(total_value=Sum('details__line_total')).filter(total_value__gte=value)

    def filter_max_total_value(self, queryset, name, value):
        return queryset.annotate(total_value=Sum('details__line_total')).filter(total_value__lte=value)
