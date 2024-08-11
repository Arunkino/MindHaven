from django.urls import path, include
from .views import MentorAvailabilityViewSet, AvailabilitySlotViewSet, AppointmentViewSet, CustomTokenVerifyView, AdminDashboardViewSet
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'availabilities', MentorAvailabilityViewSet)
router.register(r'slots', AvailabilitySlotViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'admin', AdminDashboardViewSet, basename='admin')

urlpatterns = [
    path('', include(router.urls)),
    path('token/verify/', CustomTokenVerifyView.as_view(), name='token_verify'),
    path('available-slots/', AvailabilitySlotViewSet.as_view({'get': 'available'}), name='available-slots'),
    path('appointments/user/', AppointmentViewSet.as_view({'get': 'user_appointments'}), name='user-appointments'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]