from django.shortcuts import render
from rest_framework import viewsets
from .models import MentorAvailability,Appointment
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .serializers import MentorAvailabilitySerializer
from rest_framework.decorators import api_view, permission_classes
from mindhaven.agora_utils import generate_agora_token
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_agora_token(request, appointment_id):
    try:
        appointment = Appointment.objects.get(video_call_id=appointment_id)
        if request.user != appointment.user and request.user != appointment.mentor.user:
            return Response({'error': 'You are not authorized to join this call'}, status=403)
        
        # Generate a fresh token for each request
        token = generate_agora_token(str(appointment.video_call_id), 0)
        
        return Response({'token': token})
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
