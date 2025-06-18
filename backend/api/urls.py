from django.urls import path
from .views import signup, signin, fetch_jobs, add_job, update_job, delete_old_paid_jobs, delete_job_by_id

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('signin/', signin, name='signin'),
    path('jobs/', fetch_jobs, name='fetch_jobs'),
    path('add-job/', add_job, name='add_job'),
    path('jobs/<int:job_id>/update/', update_job, name='update_job'),
    path('jobs/delete/', delete_old_paid_jobs, name='delete_old_paid_jobs'),
    path('jobs/<int:job_id>/delete/', delete_job_by_id, name='delete_job_by_id'),
]
