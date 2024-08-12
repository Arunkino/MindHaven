#project urls.py (main url file)

from django.contrib import admin
from django.urls import path, include
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat.routing

from chat.views import NotificationListView, MarkNotificationReadView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('users.urls')),
    path('api/', include('api.urls')),
    path('mentor/', include('mentor.urls')),
    path('messages/', include('chat.urls')),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:notification_id>/mark-read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),

]

websocket_urlpatterns = [
    path('ws/', AuthMiddlewareStack(URLRouter(chat.routing.websocket_urlpatterns))),
]