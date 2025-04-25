from django.core.management.base import BaseCommand
from issues.models import Issue, Priority
from django.db.models import Count

class Command(BaseCommand):
    help = 'Check issues by priority level'

    def handle(self, *args, **options):
        # First, check all available priorities
        self.stdout.write("Available Priorities:")
        priorities = Priority.objects.all().order_by('-level')
        for priority in priorities:
            self.stdout.write(f"- {priority.name} (Level: {priority.level})")

        # Then check issues by priority
        self.stdout.write("\nIssues by Priority:")
        issues_by_priority = Issue.objects.values('priority__name').annotate(count=Count('issue_id')).order_by('-priority__level')
        
        if not issues_by_priority:
            self.stdout.write(self.style.WARNING("No issues found in the database"))
            return

        for item in issues_by_priority:
            priority_name = item['priority__name'] or 'No Priority'
            count = item['count']
            self.stdout.write(f"- {priority_name}: {count} issues")

        # Check for critical priority issues specifically
        highest_priority = Priority.objects.order_by('-level').first()
        if highest_priority:
            critical_issues = Issue.objects.filter(priority=highest_priority)
            self.stdout.write(f"\nCritical Priority Issues (Level {highest_priority.level}):")
            if critical_issues.exists():
                for issue in critical_issues:
                    self.stdout.write(f"- Issue #{issue.issue_id}: {issue.title}")
                    self.stdout.write(f"  Status: {issue.status.name if issue.status else 'No Status'}")
                    self.stdout.write(f"  Assignee: {issue.assignee.full_name if issue.assignee else 'Unassigned'}")
                    self.stdout.write(f"  Created: {issue.created_at}")
                    self.stdout.write("---")
            else:
                self.stdout.write(self.style.WARNING("No critical priority issues found"))
        else:
            self.stdout.write(self.style.ERROR("No priorities defined in the database")) 