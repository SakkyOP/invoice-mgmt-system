from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import InvoiceViewSet, InvoiceDetailViewSet

router = DefaultRouter()
router.register(r'', InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('', include(router.urls), name='invoice'),
    path('<int:invoice_id>/details/', InvoiceDetailViewSet.as_view({
        'get': 'list',
        'post': 'create',
    }), name='invoice-details'),
    path('<int:invoice_id>/details/<int:pk>/', InvoiceDetailViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy',
    }), name='invoice-detail'),
]
