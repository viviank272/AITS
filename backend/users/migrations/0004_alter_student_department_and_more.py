# Generated by Django 5.1.7 on 2025-04-01 10:10

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('academic', '0002_initial'),
        ('users', '0003_auto_20250401_1304'),
    ]

    operations = [
        migrations.AlterField(
            model_name='student',
            name='department',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='department_students', to='academic.department'),
        ),
        migrations.AlterField(
            model_name='student',
            name='registration_number',
            field=models.CharField(blank=True, help_text='Registration/enrollment number', max_length=20, null=True, unique=True),
        ),
        migrations.AlterField(
            model_name='student',
            name='student_number',
            field=models.CharField(blank=True, help_text='Unique student identifier number', max_length=20, null=True, unique=True),
        ),
    ]
