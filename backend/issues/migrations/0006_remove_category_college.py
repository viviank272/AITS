# Generated by Django 5.1.7 on 2025-04-24 05:50

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('issues', '0005_merge_20250422_1128'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='category',
            name='college',
        ),
    ]
