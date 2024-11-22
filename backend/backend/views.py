from django.http import HttpResponse

def hello_world_view(request):
    return HttpResponse("<h1>Sever is running!</h1>")