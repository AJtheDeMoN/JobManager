from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Job

# Register Custom User Model
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'username', 'email', 'is_staff', 'is_active')
    search_fields = ('username', 'email')

# Register Job Model
@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('id', 'job_name', 'customer_name', 'contact_number', 'total_amount', 'created_at')
    search_fields = ('job_name', 'customer_name', 'contact_number')
    list_filter = ('created_at',)
