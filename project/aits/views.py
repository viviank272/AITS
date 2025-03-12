

# Create your views here.
from django.shortcuts import render
from rest_framework.views import APIView
from . models import *
from rest_framework.response import Response
from . serializer import *
# Create your views here.

class ReactView(APIView):
  
    serializer_class = ReactSerializer

    def get(self, request):
        detail = [ {"dept_name": detail.dept_name, "dept_description": detail.dept_description} 
        for detail in Departments.objects.all()]
        return Response(detail)



    def post(self, request):

        serializer = ReactSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return  Response(serializer.data)

