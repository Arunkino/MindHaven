from django.shortcuts import render
from rest_framework import viewsets
from .models import MentorAvailability
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .serializers import MentorAvailabilitySerializer

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
