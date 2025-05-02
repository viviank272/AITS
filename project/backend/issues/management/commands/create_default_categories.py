from django.core.management.base import BaseCommand
from issues.models import Category

class Command(BaseCommand):
    help = 'Creates default categories for the support portal'

    def handle(self, *args, **kwargs):
        default_categories = [
            {
                'name': 'Academic',
                'description': 'Issues related to academic matters such as courses, grades, and academic records'
            },
            {
                'name': 'Financial',
                'description': 'Issues related to fees, payments, and financial matters'
            },
            {
                'name': 'Administrative',
                'description': 'Issues related to administrative processes and documentation'
            },
            {
                'name': 'Technical',
                'description': 'Issues related to technical problems with systems and services'
            },
            {
                'name': 'Student Services',
                'description': 'Issues related to student services and support'
            },
            {
                'name': 'Facilities',
                'description': 'Issues related to campus facilities and infrastructure'
            },
            {
                'name': 'Library',
                'description': 'Issues related to library services and resources'
            },
            {
                'name': 'Other',
                'description': 'Other issues not covered by the above categories'
            }
        ]

        for category_data in default_categories:
            Category.objects.get_or_create(
                name=category_data['name'],
                defaults={'description': category_data['description']}
            )
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created category "{category_data["name"]}"')
            ) 