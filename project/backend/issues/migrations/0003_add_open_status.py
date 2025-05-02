from django.db import migrations

def add_open_status(apps, schema_editor):
    # We get the model from the versioned app registry
    Status = apps.get_model("issues", "Status")
    # Check if the Open status already exists
    if not Status.objects.filter(name="Open").exists():
        Status.objects.create(
            name="Open",
            description="Issue is open and ready for processing",
            is_terminal=False
        )

def reverse_open_status(apps, schema_editor):
    # We get the model from the versioned app registry
    Status = apps.get_model("issues", "Status")
    # Remove any Open status
    Status.objects.filter(name="Open").delete()

class Migration(migrations.Migration):

    dependencies = [
        ('issues', '0002_initial'),
    ]

    operations = [
        migrations.RunPython(add_open_status, reverse_open_status),
    ] 