from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """O'qilgan deb belgilash"""
        notif = self.get_object()
        notif.read = True
        notif.save(update_fields=['read'])
        return Response({'ok': True})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Hammasini o'qilgan deb belgilash"""
        self.get_queryset().filter(read=False).update(read=True)
        return Response({'ok': True})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """O'qilmagan bildirishnomalar soni"""
        count = self.get_queryset().filter(read=False).count()
        return Response({'count': count})
