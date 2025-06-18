from django.contrib.auth import authenticate, login
from django.contrib.auth import get_user_model 
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Job
from .serializers import UserSerializer, JobSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta
from django.utils import timezone
from django.db import models
from rest_framework.permissions import AllowAny
from datetime import datetime

import re

User = get_user_model()

# Sign Up View
@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"error": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password)
    return Response({
        "message": "User created successfully",
        "user": {
            "id": user.id,
            "username": user.username
        }
    }, status=status.HTTP_201_CREATED)


# Sign In View
@api_view(['POST'])
@permission_classes([AllowAny])
def signin(request):
    username = request.data.get('username')
    password = request.data.get('password')
    # print("here")
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Login successful",
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "username": user.username,
            }
        })
    
    return Response({"error": "Invalid credentials"}, status=401)

# Fetch Jobs View (Only Authenticated Users)
@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def fetch_jobs(request):
    jobs = Job.objects.filter(user=request.user)
    return Response(JobSerializer(jobs, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_job(request):
    import re
    from datetime import datetime
    print("here1")

    def camel_to_snake(name):
        if '_' in name:
            return name.lower()
        s1 = re.sub(r'(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

    data = {camel_to_snake(k): v for k, v in request.data.items()}

    # Normalize time_stamps
    if 'progress_timestamps' in data:
        data['time_stamps'] = data['progress_timestamps']
    elif 'time_stamps' not in data:
        data['time_stamps'] = [{
            "label": "Created",
            "date": datetime.utcnow().isoformat()
        }]

    print("Received:", data)

    # Now it's safe to validate required fields
    required_fields = ['job_name', 'customer_name', 'contact_number', 'total_amount', 'advanced_amount', 'job_details', 'time_stamps']

    if not all(field in data for field in required_fields):
        return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

    if len(data['time_stamps']) > 5:
        return Response({"error": "A maximum of 5 timestamps are allowed."}, status=status.HTTP_400_BAD_REQUEST)

    job = Job.objects.create(
        user=request.user,
        job_name=data['job_name'],
        customer_name=data['customer_name'],
        contact_number=data['contact_number'],
        total_amount=data['total_amount'],
        advanced_amount=data['advanced_amount'],
        job_details=data['job_details'],
        time_stamps=data['time_stamps']
    )

    return Response(JobSerializer(job).data, status=status.HTTP_201_CREATED)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_job(request, job_id):
    try:
        job = Job.objects.get(id=job_id, user=request.user)
    except Job.DoesNotExist:
        return Response({"error": "Job not found or unauthorized access"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    allowed_fields = [
        'job_name',
        'customer_name',
        'contact_number',
        'total_amount',
        'advanced_amount',
        'job_details',
        'time_stamps',
        'completed'  # ✅ Add completed here
    ]

    if 'time_stamps' in data and len(data['time_stamps']) > 5:
        return Response({"error": "A maximum of 5 timestamps are allowed."}, status=status.HTTP_400_BAD_REQUEST)

    for field in allowed_fields:
        if field in data:
            setattr(job, field, data[field])

    job.save()
    return Response(JobSerializer(job).data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_old_paid_jobs(request):

    # threshold_date = timezone.now() - timedelta(days=30)
    threshold_date = timezone.now() - timedelta(days=365)
    jobs = Job.objects.filter(
        created_at__lt=threshold_date,
        total_amount=models.F('advanced_amount')
    )
    count = jobs.count()
    jobs.delete()
    return Response({"message": f"{count} old paid jobs deleted."})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_job_by_id(request, job_id):
    print("here3")
    try:
        job = Job.objects.get(id=job_id)
        job.delete()
        return Response({"message": f"Job {job_id} deleted successfully."}, status=status.HTTP_200_OK)
    except Job.DoesNotExist:
        return Response({"error": f"Job with id {job_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)