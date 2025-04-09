from users.models import User
from academic.models import Department, College, Program

def create_test_users():
    # Create test lecturer
    lecturer = User.objects.create_user(
        username='lecturer1',
        email='lecturer@muk.ac.ug',
        full_name='Test Lecturer',
        password='lecturer123',
        user_type='lecturer'
    )
    print(f"Created lecturer: {lecturer.email}")

    # Create test student
    student = User.objects.create_user(
        username='student1',
        email='student@muk.ac.ug',
        full_name='Test Student',
        password='student123',
        user_type='student'
    )
    print(f"Created student: {student.email}")

if __name__ == '__main__':
    create_test_users() 