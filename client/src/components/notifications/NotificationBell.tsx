import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import NotificationList from './NotificationList';
import { useToast } from '@/hooks/use-toast';

export default function NotificationBell({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Fetch unread notification count
  const {
    data: unreadCount = 0,
    isLoading: countLoading,
    error: countError
  } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    retry: false,
    // Refresh the count every minute and whenever the component is focused
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });

  if (countError) {
    console.error('Error fetching notification count:', countError);
  }

  const handleMarkAllAsRead = () => {
    setOpen(false);
    toast({
      title: "All notifications marked as read",
      description: "Your notifications have been cleared",
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("relative", className)}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[350px] p-0 md:w-[450px]" 
        align="end"
        sideOffset={5}
      >
        <NotificationList onMarkAllAsRead={handleMarkAllAsRead} />
      </PopoverContent>
    </Popover>
  );
}