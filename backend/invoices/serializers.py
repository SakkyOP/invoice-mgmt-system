from rest_framework import serializers
from .models import Invoice, InvoiceDetail

class InvoiceDetailSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    
    class Meta:
        model = InvoiceDetail
        fields = ['id', 'description', 'quantity', 'unit_price', 'line_total']
        read_only_fields = ['line_total']

class InvoiceSerializer(serializers.ModelSerializer):
    details = InvoiceDetailSerializer(many=True)

    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'customer_name', 'date', 'details']

    def validate_details(self, value):
        """
        Ensure at least one InvoiceDetail is provided.
        """
        if self.instance:
            return value
        
        if not value or len(value) == 0:
            raise serializers.ValidationError("At least one invoice detail is required.")
        return value

    def create(self, validated_data):
        """
        Create Invoice and associated InvoiceDetails.
        """
        details_data = validated_data.pop('details')
        invoice = Invoice.objects.create(**validated_data)

        # Create related InvoiceDetails
        for detail_data in details_data:
            InvoiceDetail.objects.create(invoice=invoice, **detail_data)

        return invoice
    
    def update(self, instance, validated_data):
        # Update fields that are part of the invoice itself
        instance.invoice_number = validated_data.get('invoice_number', instance.invoice_number)
        instance.customer_name = validated_data.get('customer_name', instance.customer_name)
        instance.date = validated_data.get('date', instance.date)

        # Handle nested details field (InvoiceDetail objects)
        details_data = validated_data.pop('details', [])
        for detail_data in details_data:
            # Either update existing details or create new ones
            detail_instance = instance.details.get(id=detail_data['id'])  # Retrieve the existing InvoiceDetail instance
            detail_instance.description = detail_data.get('description', detail_instance.description)
            detail_instance.quantity = detail_data.get('quantity', detail_instance.quantity)
            detail_instance.unit_price = detail_data.get('unit_price', detail_instance.unit_price)
            detail_instance.line_total = detail_data.get('line_total', detail_instance.line_total)
            detail_instance.save()

        instance.save()  # Save the updated invoice instance
        return instance