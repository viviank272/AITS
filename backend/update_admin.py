import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'muk_support_backend.settings')
django.setup()

from users.models import User

def update_admin_user():
    try:
        # Print all users
        print("All users in the database:")
        for user in User.objects.all():
            print(f"Email: {user.email}, Username: {user.username}, User Type: {user.user_type}")
        
        # Get the admin user
        admin_user = User.objects.get(username='kats')
        
        # Update user_type to 'admin'
        admin_user.user_type = 'admin'
        admin_user.save()
        
        print(f"\nSuccessfully updated user_type to 'admin' for user {admin_user.email}")
        print(f"Updated user details: Email: {admin_user.email}, Username: {admin_user.username}, User Type: {admin_user.user_type}")
        
    except User.DoesNotExist:
        print("Admin user not found")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == '__main__':
    update_admin_user() 