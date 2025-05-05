import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { Notification } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';
import { Check, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Icons for different notification types
import { 
  ShoppingCart, 
  Clock, 
  MailOpen, 
  Radio, 
  Users, 
  AlertCircle 
} from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onUpdate: () => void;
}

export default function NotificationItem({ notification, onUpdate }: NotificationItemProps) {
  const { toast } = useToast();

  // Get appropriate icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'rental_request_approved':
      case 'rental_request_rejected':
        return <ShoppingCart className="h-5 w-5 text-primary" />;
      case 'course_enrollment':
        return <Clock className="h-5 w-5 text-green-500" />;
      case 'streamer_live':
        return <Radio className="h-5 w-5 text-red-500" />;
      case 'new_message':
        return <MailOpen className="h-5 w-5 text-blue-500" />;
      case 'referral':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'system':
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  // Format the date to relative time
  const getFormattedDate = () => {
    if (!notification.createdAt) return 'Just now';
    
    const date = new Date(notification.createdAt);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/notifications/${notification.id}/mark-read`);
      return await res.json();
    },
    onSuccess: () => {
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: 'Failed to mark notification as read',
        description: 'Please try again',
        variant: 'destructive'
      });
      console.error('Error marking notification as read:', error);
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', `/api/notifications/${notification.id}`);
      return res.ok;
    },
    onSuccess: () => {
      onUpdate();
      toast({
        title: 'Notification deleted',
        description: 'The notification has been removed',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete notification',
        description: 'Please try again',
        variant: 'destructive'
      });
      console.error('Error deleting notification:', error);
    }
  });

  // Handle mark as read
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsReadMutation.mutate();
  };

  // Handle delete
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate();
  };

  // If the notification has a link, make it clickable
  const NotificationContent = () => (
    <div 
      className={cn(
        "flex items-start p-4 gap-3 hover:bg-muted/50 cursor-pointer",
        !notification.isRead && "bg-muted/20"
      )}
      onClick={() => !notification.isRead && markAsReadMutation.mutate()}
    >
      <div className="flex-shrink-0 mt-1">{getIcon()}</div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium",
          !notification.isRead && "font-semibold"
        )}>
          {notification.title}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {getFormattedDate()}
        </p>
      </div>
      
      <div className="flex flex-col gap-1 ml-2">
        {!notification.isRead && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleMarkAsRead}
            disabled={markAsReadMutation.isPending}
          >
            {markAsReadMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
        )}
        
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-destructive hover:text-destructive/90"
          onClick={handleDelete}
          disabled={deleteNotificationMutation.isPending}
        >
          {deleteNotificationMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );

  // If the notification has a link, wrap it in a Link component
  if (notification.link) {
    return (
      <Link href={notification.link}>
        <a className="block">
          <NotificationContent />
        </a>
      </Link>
    );
  }

  // Otherwise, just render the content
  return <NotificationContent />;
}