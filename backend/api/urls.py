from django.urls import path, include
from . import views

urlpatterns = [
    path('', include('rest_framework.urls', namespace='rest_framework')),
    path('invoices/', include('invoices.urls')),
]