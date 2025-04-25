from django.db import migrations

def fix_priority_levels(apps, schema_editor):
    Priority = apps.get_model('issues', 'Priority')
    
    # Update priority levels
    Priority.objects.filter(name='Critical').update(level=4)
    Priority.objects.filter(name='High').update(level=3)
    Priority.objects.filter(name='Medium').update(level=2)
    Priority.objects.filter(name='Low').update(level=1)

def reverse_priority_levels(apps, schema_editor):
    Priority = apps.get_model('issues', 'Priority')
    
    # Reverse the priority levels
    Priority.objects.filter(name='Critical').update(level=1)
    Priority.objects.filter(name='High').update(level=2)
    Priority.objects.filter(name='Medium').update(level=3)
    Priority.objects.filter(name='Low').update(level=4)

class Migration(migrations.Migration):
    dependencies = [
        ('issues', '0006_remove_category_college'),
    ]

    operations = [
        migrations.RunPython(fix_priority_levels, reverse_priority_levels),
    ] 