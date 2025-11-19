import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, X, Settings, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Incident } from '../types/incident';

export interface NotificationSettings {
  criticalIncidents: boolean;
  statusChanges: boolean;
  assignments: boolean;
  sound: boolean;
  desktop: boolean;
}

export interface Notification {
  id: string;
  type: 'critical' | 'status_change' | 'assignment' | 'escalation' | 'comment';
  title: string;
  message: string;
  incidentId?: string;
  incidentTitle?: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface IncidentNotificationsProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onClearAll: () => void;
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
  className?: string;
}

export function IncidentNotifications({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  settings,
  onSettingsChange,
  className
}: IncidentNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(settings.sound);

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.priority === 'high' && !n.read).length;

  // Reproducir sonido para notificaciones críticas
  useEffect(() => {
    if (soundEnabled && criticalCount > 0) {
      // En una implementación real, usarías un archivo de sonido
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+HyvmccCz2X2f======');
      audio.play().catch(() => {});
    }
  }, [criticalCount, soundEnabled]);

  // Solicitar permisos de notificación del navegador
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    if (settings.desktop) {
      requestNotificationPermission();
    }
  }, [settings.desktop]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'status_change': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'assignment': return <Bell className="h-4 w-4 text-blue-600" />;
      case 'escalation': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'comment': return <Bell className="h-4 w-4 text-gray-600" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'low': return 'border-l-green-500 bg-green-50 dark:bg-green-950/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return notificationTime.toLocaleDateString();
  };

  const updateSettings = (newSettings: NotificationSettings) => {
    onSettingsChange(newSettings);
    setSoundEnabled(newSettings.sound);
  };

  return (
    <div className={className}>
      {/* Botón de notificaciones */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`relative ${criticalCount > 0 ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''}`}
          >
            <Bell className={`h-4 w-4 ${criticalCount > 0 ? 'text-red-600' : ''}`} />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-600" />
                Notificaciones de Emergencia
                {unreadCount > 0 && (
                  <Badge variant="destructive">
                    {unreadCount} sin leer
                  </Badge>
                )}
              </DialogTitle>
              
              <div className="flex items-center gap-2">
                {/* Configuración de notificaciones */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configuración de Notificaciones</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Incidentes críticos</label>
                        <Switch
                          checked={settings.criticalIncidents}
                          onCheckedChange={(checked) => 
                            updateSettings({ ...settings, criticalIncidents: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Cambios de estado</label>
                        <Switch
                          checked={settings.statusChanges}
                          onCheckedChange={(checked) => 
                            updateSettings({ ...settings, statusChanges: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Asignaciones</label>
                        <Switch
                          checked={settings.assignments}
                          onCheckedChange={(checked) => 
                            updateSettings({ ...settings, assignments: checked })
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <label className="text-sm flex items-center gap-2">
                          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                          Sonido
                        </label>
                        <Switch
                          checked={settings.sound}
                          onCheckedChange={(checked) => 
                            updateSettings({ ...settings, sound: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Notificaciones del navegador</label>
                        <Switch
                          checked={settings.desktop}
                          onCheckedChange={(checked) => 
                            updateSettings({ ...settings, desktop: checked })
                          }
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                    Marcar todo leído
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay notificaciones</p>
                <p className="text-sm">Te notificaremos sobre incidentes importantes</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {notifications
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-l-4 rounded-lg ${getPriorityColor(notification.priority)} ${
                          notification.read ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                                  {notification.title}
                                </h4>
                                {notification.incidentTitle && (
                                  <Badge variant="outline" className="text-xs">
                                    {notification.incidentTitle}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimestamp(notification.timestamp)}</span>
                                {!notification.read && (
                                  <Badge variant="secondary" className="text-xs ml-auto">
                                    Nuevo
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMarkAsRead(notification.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteNotification(notification.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {notification.actionUrl && (
                          <Button variant="outline" size="sm" className="mt-3" asChild>
                            <a href={notification.actionUrl}>
                              Ver Incidente
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              </ScrollArea>
            )}

            {notifications.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {notifications.length} notificaciones en total
                </p>
                <Button variant="ghost" size="sm" onClick={onClearAll}>
                  Limpiar todo
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}