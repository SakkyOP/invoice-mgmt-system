from rest_framework.response import Response

def hello_world_view(request):
    return Response("hello world!")