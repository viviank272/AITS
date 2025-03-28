from rest_framework import serializers
from . models import *

class ReactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departments
        fields = ['dept_name', 'dept_description']
        
