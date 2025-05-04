import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Streamer, StreamerSchedule, insertStreamerScheduleSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  CalendarPlus, 
  CalendarIcon, 
  ClockIcon, 
  GamepadIcon, 
  Edit, 
  Trash, 
  ListX,
  Trophy 
} from "lucide-react";

// Valid game choices
const GAME_CHOICES = [
  "Boss Fighters",
  "KoKodi",
  "Nyan Heroes", 
  "Big Time", 
  "WorldShards", 
  "Off The Grid", 
  "RavenQuest"
];

// Extend schedule schema with validations
const scheduleFormSchema = insertStreamerScheduleSchema.extend({
  dayOfWeek: z.enum([
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ], {
    required_error: "Please select a day of the week",
  }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter a valid time in 24-hour format (HH:MM)",
  }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter a valid time in 24-hour format (HH:MM)",
  }),
  game: z.string().min(1, {
    message: "Please select a game",
  }),
  notes: z.string().max(500, {
    message: "Notes must not exceed 500 characters",
  }).optional(),
  title: z.string().optional(),
  isSpecialEvent: z.boolean().default(false),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface ScheduleCardProps {
  schedule: StreamerSchedule;
  isOwner: boolean;
  onEdit: (schedule: StreamerSchedule) => void;
  onDelete: (scheduleId: number) => void;
}

function ScheduleCard({ schedule, isOwner, onEdit, onDelete }: ScheduleCardProps) {
  return (
    <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-orbitron flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-[hsl(var(--cwg-orange))]" />
              {schedule.dayOfWeek}
              {schedule.isSpecialEvent && (
                <span title="Special Event"><Trophy className="h-4 w-4 text-yellow-500" /></span>
              )}
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              <ClockIcon className="h-3 w-3 mr-1" />
              {schedule.startTime} - {schedule.endTime}
            </CardDescription>
          </div>
          
          {isOwner && (
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0" 
                onClick={() => onEdit(schedule)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 hover:text-red-500" 
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[hsl(var(--cwg-dark-blue))]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this scheduled stream? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => onDelete(schedule.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {schedule.title && (
          <h4 className="font-medium mb-2">{schedule.title}</h4>
        )}
        
        <div className="flex items-center gap-1 mb-2">
          <GamepadIcon className="h-4 w-4 text-[hsl(var(--cwg-muted))]" />
          <span className="text-[hsl(var(--cwg-text))]">{schedule.game}</span>
        </div>
        
        {schedule.notes && (
          <p className="text-sm text-[hsl(var(--cwg-muted))]">{schedule.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface StreamerScheduleViewProps {
  streamer: Streamer;
}

export default function StreamerScheduleView({ streamer }: StreamerScheduleViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<StreamerSchedule | null>(null);
  
  // Check if the authenticated user is the owner of this streamer profile or an admin
  const isOwner = user && (user.id === streamer.userId || user.isAdmin);
  
  // Fetch schedules for this streamer
  const { 
    data: schedules, 
    isLoading, 
    isError 
  } = useQuery<StreamerSchedule[]>({
    queryKey: [`/api/streamers/${streamer.id}/schedule`],
  });
  
  // Form setup with proper field names
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      streamerId: streamer.id,
      dayOfWeek: "Monday",
      startTime: "12:00",
      endTime: "14:00",
      game: GAME_CHOICES[0],
      notes: "",
      title: "",
      isSpecialEvent: false
    },
  });
  
  // Create schedule mutation
  const createMutation = useMutation({
    mutationFn: async (data: ScheduleFormValues) => {
      const res = await apiRequest("POST", `/api/streamers/${streamer.id}/schedule`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/streamers/${streamer.id}/schedule`] });
      setIsAddingSchedule(false);
      form.reset({
        streamerId: streamer.id,
        dayOfWeek: "Monday",
        startTime: "12:00",
        endTime: "14:00",
        game: GAME_CHOICES[0],
        notes: "",
        title: "",
        isSpecialEvent: false
      });
      toast({
        title: "Schedule Added",
        description: "Your streaming schedule has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add schedule: " + error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update schedule mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; values: Partial<ScheduleFormValues> }) => {
      const res = await apiRequest("PATCH", `/api/streamers/schedule/${data.id}`, data.values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/streamers/${streamer.id}/schedule`] });
      setEditingSchedule(null);
      setIsAddingSchedule(false);
      toast({
        title: "Schedule Updated",
        description: "Your streaming schedule has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update schedule: " + error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete schedule mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/streamers/schedule/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/streamers/${streamer.id}/schedule`] });
      toast({
        title: "Schedule Deleted",
        description: "Your streaming schedule has been deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete schedule: " + error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: ScheduleFormValues) => {
    if (editingSchedule) {
      updateMutation.mutate({ id: editingSchedule.id, values });
    } else {
      createMutation.mutate(values);
    }
  };
  
  const handleEditSchedule = (schedule: StreamerSchedule) => {
    setEditingSchedule(schedule);
    setIsAddingSchedule(true);
    
    // Set form values based on the schedule being edited
    form.reset({
      streamerId: schedule.streamerId,
      dayOfWeek: schedule.dayOfWeek as any, // Cast to match enum
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      game: schedule.game || GAME_CHOICES[0],
      notes: schedule.notes || "",
      title: schedule.title || "",
      isSpecialEvent: schedule.isSpecialEvent
    });
  };
  
  const handleCancelForm = () => {
    setIsAddingSchedule(false);
    setEditingSchedule(null);
    form.reset({
      streamerId: streamer.id,
      dayOfWeek: "Monday",
      startTime: "12:00",
      endTime: "14:00",
      game: GAME_CHOICES[0],
      notes: "",
      title: "",
      isSpecialEvent: false
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--cwg-orange))]" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <Card className="w-full bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
        <CardHeader>
          <CardTitle className="text-xl font-orbitron text-[hsl(var(--cwg-orange))]">
            Streaming Schedule
          </CardTitle>
          <CardDescription>
            Weekly streaming schedule for {streamer.displayName}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center py-16">
          <ListX className="h-12 w-12 text-[hsl(var(--cwg-muted))] mb-4" />
          <p className="text-[hsl(var(--cwg-muted))] text-center">
            Error loading schedule. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-orbitron text-[hsl(var(--cwg-orange))]">
              Streaming Schedule
            </CardTitle>
            <CardDescription>
              Weekly streaming schedule for {streamer.displayName}
            </CardDescription>
          </div>
          
          {isOwner && !isAddingSchedule && (
            <Button 
              className="w-full sm:w-auto"
              onClick={() => setIsAddingSchedule(true)}
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isAddingSchedule ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="dayOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Monday">Monday</SelectItem>
                          <SelectItem value="Tuesday">Tuesday</SelectItem>
                          <SelectItem value="Wednesday">Wednesday</SelectItem>
                          <SelectItem value="Thursday">Thursday</SelectItem>
                          <SelectItem value="Friday">Friday</SelectItem>
                          <SelectItem value="Saturday">Saturday</SelectItem>
                          <SelectItem value="Sunday">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="game"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select game" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GAME_CHOICES.map((game) => (
                            <SelectItem key={game} value={game}>
                              {game}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time (24h)</FormLabel>
                      <FormControl>
                        <Input placeholder="14:00" {...field} />
                      </FormControl>
                      <FormDescription>
                        Use 24-hour format (e.g., 14:00 for 2 PM)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time (24h)</FormLabel>
                      <FormControl>
                        <Input placeholder="16:00" {...field} />
                      </FormControl>
                      <FormDescription>
                        Use 24-hour format (e.g., 16:00 for 4 PM)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stream Title (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter stream title" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional details about this stream..."
                        className="resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Add important notes about this streaming session (max 500 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isSpecialEvent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Special Event</FormLabel>
                      <FormDescription>
                        Mark this as a special event (tournament, giveaway, etc.)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancelForm}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingSchedule ? "Update" : "Add"} Schedule
                </Button>
              </div>
            </form>
          </Form>
        ) : schedules && schedules.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {schedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                isOwner={!!isOwner}
                onEdit={handleEditSchedule}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-[hsl(var(--cwg-muted))] mb-4" />
            <h3 className="text-lg font-orbitron mb-2">No Schedule Available</h3>
            <p className="text-[hsl(var(--cwg-muted))] max-w-md mx-auto">
              {isOwner 
                ? "Add your streaming schedule to let your fans know when you'll be live!" 
                : `${streamer.displayName} hasn't posted a streaming schedule yet.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}