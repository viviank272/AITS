from django.db import migrations

def add_critical_priority(apps, schema_editor):
    Priority = apps.get_model('issues', 'Priority')
    # Check if critical priority already exists
    if not Priority.objects.filter(name__icontains='critical').exists():
        Priority.objects.create(
            name='Critical',
            level=4,  # Highest level
            sla_hours=24  # 24 hours SLA for critical issues
        )

def remove_critical_priority(apps, schema_editor):
    Priority = apps.get_model('issues', 'Priority')
    Priority.objects.filter(name__icontains='critical').delete()

class Migration(migrations.Migration):
    dependencies = [
        ('issues', '0002_initial'),
    ]

    operations = [
        migrations.RunPython(add_critical_priority, remove_critical_priority),
    ] 