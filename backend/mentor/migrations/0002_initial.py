# Generated by Django 5.0.7 on 2024-07-27 12:43

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('mentor', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='appointment',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='appointments', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='appointment',
            name='availability_slot',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='appointment', to='mentor.availabilityslot'),
        ),
        migrations.AddField(
            model_name='mentor',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='mentor_profile', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='appointment',
            name='mentor',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='appointments', to='mentor.mentor'),
        ),
        migrations.AddField(
            model_name='mentoravailability',
            name='mentor',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='availabilities', to='mentor.mentor'),
        ),
        migrations.AddField(
            model_name='availabilityslot',
            name='mentor_availability',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='slots', to='mentor.mentoravailability'),
        ),
    ]
