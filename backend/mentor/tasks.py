import logging
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Appointment
from chat.models import Notification
from time import sleep

logger = logging.getLogger(__name__)
@shared_task
def test_task():
    logger.info("Test task started")
    try:
        sleep(5)  # Simulate some work
        logger.info("Test task completed")
        return "Test task completed successfully"
    except Exception as e:
        logger.error(f"Error in test_task: {str(e)}")
        raise

@shared_task
def check_upcoming_appointments():
    logger.info("Task check_upcoming_appointments started")
    now = timezone.now()
    upcoming_time = now + timedelta(minutes=5)
    logger.info(f"Checking appointments between {now} and {upcoming_time}")

    upcoming_appointments = Appointment.objects.filter(
        date=upcoming_time.date(),
        start_time__gte=now.time(),
        start_time__lte=upcoming_time.time(),
        status='scheduled'
    )

    logger.info(f"Found {upcoming_appointments.count()} upcoming appointments")

    for appointment in upcoming_appointments:
        logger.info(f"Processing appointment: {appointment}")
        # Create notification for user
        Notification.objects.create(
            user=appointment.user,
            content=f"Your appointment with {appointment.mentor.user.get_full_name()} starts in 5 minutes."
        )

        # Create notification for mentor
        Notification.objects.create(
            user=appointment.mentor.user,
            content=f"Your appointment with {appointment.user.get_full_name()} starts in 5 minutes."
        )

    logger.info("Task check_upcoming_appointments completed")