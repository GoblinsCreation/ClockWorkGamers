import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notification } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  onMarkAllAsRead: () => void;
}

export default function NotificationList({ onMarkAllAsRead }: NotificationListProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch
  } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    refetchOnWindowFocus: true,
    staleTime: 30000 // Consider data stale after 30 seconds
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/notifications/mark-all-read');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      onMarkAllAsRead();
    },
    onError: (error) => {
      toast({
        title: 'Failed to mark all as read',
        description: 'Please try again later',
        variant: 'destructive'
      });
      console.error('Error marking all notifications as read:', error);
    }
  });

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <p className="text-destructive mb-4">Failed to load notifications</p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Notifications</h3>
        {notifications.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllAsRead} 
            disabled={markAllAsReadMutation.isPending}
            className="text-xs"
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Check className="h-3 w-3 mr-1" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-2">No notifications</p>
          <p className="text-xs text-muted-foreground">
            You'll see notifications for rental approvals, messages, and more here
          </p>
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto divide-y">
          {notifications.map((notification) => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
              onUpdate={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
                queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}