from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta,datetime
import uuid



class Mentor(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mentor_profile')
    specialization = models.CharField(max_length=100, null=True)
    qualifications = models.TextField(blank=True, null=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    certificate = models.ImageField(upload_to='certificates/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.user.email
    
class MentorAvailability(models.Model):
    mentor = models.ForeignKey('Mentor', on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.IntegerField(choices=[(i, day) for i, day in enumerate(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])])
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_recurring = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.mentor.user.username} - {self.get_day_of_week_display()} ({self.start_time} to {self.end_time})"
    def __str__(self):
        return f"{self.mentor.user.username} - {self.date} ({self.start_time} to {self.end_time})"

    def is_open(self):
        now = timezone.now()
        session_start = timezone.make_aware(datetime.combine(self.date, self.start_time))
        return now >= session_start - timedelta(minutes=15) and now <= session_start
    


class AvailabilitySlot(models.Model):
    mentor_availability = models.ForeignKey(MentorAvailability, on_delete=models.CASCADE, related_name='slots')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=10, choices=[('available', 'Available'), ('booked', 'Booked'), ('blocked', 'Blocked')], default='available')

    def __str__(self):
        return f"{self.mentor_availability.mentor.user.username} - {self.date} ({self.start_time} to {self.end_time})"

class Appointment(models.Model):
    availability_slot = models.OneToOneField(AvailabilitySlot, on_delete=models.CASCADE, related_name='appointment')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='appointments')
    mentor = models.ForeignKey('Mentor', on_delete=models.CASCADE, related_name='appointments')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=25, choices=[
        ('scheduled', 'Scheduled'), ('completed', 'Completed'), ('cancelled_by_user', 'Cancelled by User'),
            ('cancelled_by_mentor', 'Cancelled by Mentor')
        ], default='scheduled')

    video_call_link = models.URLField(blank=True, null=True)
    video_call_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    notification_sent = models.BooleanField(default=False)
    agora_token = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.user.first_name} with {self.mentor.user.first_name} - {self.date} ({self.start_time} to {self.end_time})"

    def save(self, *args, **kwargs):
        if not self.video_call_link:
            self.video_call_link = f"{settings.DOMAIN}video-call/{self.video_call_id}/"
        super().save(*args, **kwargs)


class CallStatus(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='call_status')
    is_mentor_joined = models.BooleanField(default=False)
    is_user_joined = models.BooleanField(default=False)
    call_start_time = models.DateTimeField(null=True, blank=True)
    call_end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Call Status for Appointment {self.appointment.id}"