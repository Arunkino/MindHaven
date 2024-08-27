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
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_agora_token(request, appointment_id):
    try:
        print("In get_agora_token")
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
        response = {
            'token': token,
            'is_mentor_joined': call_status.is_mentor_joined,
            'is_user_joined': call_status.is_user_joined
        }
        print("Response from get_agora_token:", response)
        
        return Response(response)
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_call_status(request, appointment_id):
    try:
        logger.debug(f"Updating call status for appointment {appointment_id}")
        appointment = Appointment.objects.get(video_call_id=appointment_id)
        call_status, created = CallStatus.objects.get_or_create(appointment=appointment)
        
        action = request.data.get('action')
        logger.debug(f"Action received: {action}")

        if action == 'start':
            call_status.call_start_time = timezone.now()
        elif action == 'end':
            call_status.call_end_time = timezone.now()
            call_status.is_mentor_joined = False
            call_status.is_user_joined = False
        elif action == 'remoteJoined':
            if request.user.role == 'mentor':
                call_status.is_user_joined = True
            else:
                call_status.is_mentor_joined = True
        
        call_status.save()
        
        # Send WebSocket message
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"call_{appointment_id}",
            {
                "type": "call_status_update",
                "message": {
                    "action": action,
                    "is_mentor_joined": call_status.is_mentor_joined,
                    "is_user_joined": call_status.is_user_joined,
                    "call_start_time": call_status.call_start_time.isoformat() if call_status.call_start_time else None,
                    "call_end_time": call_status.call_end_time.isoformat() if call_status.call_end_time else None,
                }
            }
        )
        
        logger.debug(f"Call status updated successfully: {call_status.__dict__}")
        return Response({'status': 'success'})
    except Appointment.DoesNotExist:
        logger.error(f"Appointment not found: {appointment_id}")
        return Response({'error': 'Appointment not found'}, status=404)
    except Exception as e:
        logger.exception(f"Error updating call status: {str(e)}")
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
