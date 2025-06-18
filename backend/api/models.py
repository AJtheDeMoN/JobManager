from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

# Custom User Model
class User(AbstractUser):
    groups = models.ManyToManyField(Group, related_name="api_users_groups", blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name="api_users_permissions", blank=True)

# Job Model
class Job(models.Model):
    job_name = models.CharField(max_length=255)
    customer_name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=15)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    advanced_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    job_details = models.TextField()
    time_stamps = models.JSONField(default=list)  # To store up to 5 timestamps

    completed = models.BooleanField(default=False)  # ✅ New field

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.job_name} - {self.customer_name}"


