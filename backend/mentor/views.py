from django.shortcuts import render
from rest_framework import viewsets
from .models import MentorAvailability,Appointment, CallStatus
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .serializers import MentorAvailabilitySerializer
from rest_framework.decorators import api_view, permission_classes
from mindhaven.agora_utils import generate_agora_token
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_agora_token(request, appointment_id):
    try:
        appointment = Appointment.objects.get(video_call_id=appointment_id)
        if request.user != appointment.user and request.user != appointment.mentor.user:
            return Response({'error': 'You are not authorized to join this call'}, status=403)
        
        # Generate a fresh token for each request
        token = generate_agora_token(str(appointment.video_call_id), 0)
        
        # Update call status
        call_status, created = CallStatus.objects.get_or_create(appointment=appointment)
        if request.user == appointment.user:
            call_status.is_user_joined = True
        else:
            call_status.is_mentor_joined = True
        call_status.save()
        
        return Response({
            'token': token,
            'is_mentor_joined': call_status.is_mentor_joined,
            'is_user_joined': call_status.is_user_joined
        })
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_call_status(request, appointment_id):
    try:
        appointment = Appointment.objects.get(video_call_id=appointment_id)
        call_status, created = CallStatus.objects.get_or_create(appointment=appointment)
        
        action = request.data.get('action')
        if action == 'start':
            call_status.call_start_time = timezone.now()
        elif action == 'end':
            call_status.call_end_time = timezone.now()
            call_status.is_mentor_joined = False
            call_status.is_user_joined = False
        
        call_status.save()
        return Response({'status': 'success'})
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    

class MentorAvailabilityViewSet(viewsets.ModelViewSet):
    queryset = MentorAvailability.objects.all()
    serializer_class = MentorAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'mentor_profile'):
            return MentorAvailability.objects.filter(mentor=user.mentor_profile)
        else:
            return MentorAvailability.objects.none()

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'mentor_profile'):
            serializer.save(mentor=self.request.user.mentor_profile)
        else:
            raise PermissionDenied("Only mentors can create availabilities.")
