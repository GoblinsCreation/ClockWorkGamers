import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, PlusCircle, Clock, Edit, Trash2, CalendarDays } from "lucide-react";
import { Streamer, StreamerSchedule, InsertStreamerSchedule } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type Day = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
const DAYS_OF_WEEK: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface ScheduleFormData {
  dayOfWeek: Day;
  startTime: string;
  endTime: string;
  game?: string;
  title?: string;
  notes?: string;
  isSpecialEvent: boolean;
}

const GAMES = ["Boss Fighters", "KoKodi", "Nyan Heroes", "Big Time", "WorldShards", "Off The Grid", "RavenQuest"];

export default function StreamerSchedule({ streamer }: { streamer: Streamer }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeDay, setActiveDay] = useState<Day>("Monday");
  const [editingSchedule, setEditingSchedule] = useState<StreamerSchedule | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>({
    dayOfWeek: "Monday",
    startTime: "18:00",
    endTime: "22:00",
    game: "",
    title: "",
    notes: "",
    isSpecialEvent: false,
  });

  // Check if the logged-in user is the owner of this streamer profile or an admin
  const canEdit = user && (user.id === streamer.userId || user.isAdmin);

  // Fetch streamer schedules
  const { data: schedules = [], isLoading } = useQuery<StreamerSchedule[]>({
    queryKey: [`/api/streamers/${streamer.id}/schedule`],
  });

  // Create a new schedule
  const createScheduleMutation = useMutation({
    mutationFn: async (data: Omit<InsertStreamerSchedule, "streamerId">) => {
      const res = await apiRequest(
        "POST", 
        `/api/streamers/${streamer.id}/schedule`, 
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/streamers/${streamer.id}/schedule`] });
      toast({
        title: "Schedule created",
        description: "Your streaming schedule has been updated.",
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create schedule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update an existing schedule
  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<StreamerSchedule> }) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/streamers/schedule/${id}`, 
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/streamers/${streamer.id}/schedule`] });
      toast({
        title: "Schedule updated",
        description: "Your streaming schedule has been updated.",
      });
      setIsEditDialogOpen(false);
      setEditingSchedule(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update schedule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a schedule
  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(
        "DELETE", 
        `/api/streamers/schedule/${id}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/streamers/${streamer.id}/schedule`] });
      toast({
        title: "Schedule deleted",
        description: "The schedule has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete schedule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const resetForm = () => {
    setFormData({
      dayOfWeek: "Monday",
      startTime: "18:00",
      endTime: "22:00",
      game: "",
      title: "",
      notes: "",
      isSpecialEvent: false,
    });
  };

  const handleCreateSchedule = () => {
    createScheduleMutation.mutate({
      dayOfWeek: formData.dayOfWeek,
      startTime: formData.startTime,
      endTime: formData.endTime,
      game: formData.game,
      title: formData.title,
      notes: formData.notes,
      isSpecialEvent: formData.isSpecialEvent,
    });
  };

  const handleUpdateSchedule = () => {
    if (!editingSchedule) return;
    
    updateScheduleMutation.mutate({
      id: editingSchedule.id,
      data: {
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        game: formData.game,
        title: formData.title,
        notes: formData.notes,
        isSpecialEvent: formData.isSpecialEvent,
      }
    });
  };

  const openEditDialog = (schedule: StreamerSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      dayOfWeek: schedule.dayOfWeek as Day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      game: schedule.game || "",
      title: schedule.title || "",
      notes: schedule.notes || "",
      isSpecialEvent: schedule.isSpecialEvent,
    });
    setIsEditDialogOpen(true);
  };

  // Group schedules by day
  const schedulesByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = schedules.filter(schedule => schedule.dayOfWeek === day);
    return acc;
  }, {} as Record<Day, StreamerSchedule[]>);

  return (
    <Card className="w-full bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-orbitron text-[hsl(var(--cwg-orange))]">
          <CalendarDays className="inline mr-2 h-5 w-5" /> Stream Schedule
        </CardTitle>
        {canEdit && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-transparent border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))]">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
              <DialogHeader>
                <DialogTitle className="text-[hsl(var(--cwg-orange))] font-orbitron">Add Streaming Schedule</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dayOfWeek">Day of Week</Label>
                    <Select 
                      value={formData.dayOfWeek} 
                      onValueChange={(value) => handleSelectChange("dayOfWeek", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map(day => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="game">Game</Label>
                    <Select 
                      value={formData.game || ""} 
                      onValueChange={(value) => handleSelectChange("game", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select game (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {GAMES.map(game => (
                          <SelectItem key={game} value={game}>{game}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Stream Title (Optional)</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter stream title"
                    className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any additional notes or details"
                    className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="isSpecialEvent"
                    name="isSpecialEvent"
                    type="checkbox"
                    checked={formData.isSpecialEvent}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <Label htmlFor="isSpecialEvent">Mark as Special Event</Label>
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleCreateSchedule}
                  disabled={createScheduleMutation.isPending}
                  className="bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))]"
                >
                  {createScheduleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--cwg-orange))]" />
          </div>
        ) : (
          <Tabs defaultValue="Monday" value={activeDay} onValueChange={(value) => setActiveDay(value as Day)}>
            <TabsList className="w-full flex overflow-x-auto mb-4 bg-[hsl(var(--cwg-dark))]">
              {DAYS_OF_WEEK.map(day => (
                <TabsTrigger 
                  key={day} 
                  value={day} 
                  className="flex-1 font-orbitron"
                >
                  {day.substring(0, 3)}
                  {schedulesByDay[day]?.length > 0 && (
                    <span className="ml-1 text-xs bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))] px-1.5 rounded-full">
                      {schedulesByDay[day].length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {DAYS_OF_WEEK.map(day => (
              <TabsContent key={day} value={day} className="space-y-4">
                {schedulesByDay[day]?.length > 0 ? (
                  schedulesByDay[day].map(schedule => (
                    <div 
                      key={schedule.id} 
                      className={`p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        schedule.isSpecialEvent 
                          ? 'bg-[hsl(var(--cwg-orange))]/10 border border-[hsl(var(--cwg-orange))]/30' 
                          : 'bg-[hsl(var(--cwg-dark))]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-[hsl(var(--cwg-orange))]" />
                          <span className="font-medium text-[hsl(var(--cwg-text))]">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                          {schedule.isSpecialEvent && (
                            <Badge className="ml-2 bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))]">
                              Special Event
                            </Badge>
                          )}
                        </div>
                        
                        {schedule.title && (
                          <h4 className="text-lg font-semibold text-[hsl(var(--cwg-text))]">{schedule.title}</h4>
                        )}
                        
                        {schedule.game && (
                          <div className="text-sm text-[hsl(var(--cwg-muted))]">
                            Game: <span className="text-[hsl(var(--cwg-orange))]">{schedule.game}</span>
                          </div>
                        )}
                        
                        {schedule.notes && (
                          <p className="text-sm text-[hsl(var(--cwg-muted))]">{schedule.notes}</p>
                        )}
                      </div>
                      
                      {canEdit && (
                        <div className="flex space-x-2 self-end sm:self-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-transparent"
                            onClick={() => openEditDialog(schedule)}
                          >
                            <Edit className="h-4 w-4 text-[hsl(var(--cwg-muted))]" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-transparent"
                            onClick={() => deleteScheduleMutation.mutate(schedule.id)}
                            disabled={deleteScheduleMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[hsl(var(--cwg-muted))]">No streams scheduled for {day}</p>
                    {canEdit && (
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setFormData(prev => ({ ...prev, dayOfWeek: day }));
                          setIsAddDialogOpen(true);
                        }}
                        className="text-[hsl(var(--cwg-orange))]"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Schedule
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
      
      {/* Edit Schedule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--cwg-orange))] font-orbitron">Edit Streaming Schedule</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <Select 
                  value={formData.dayOfWeek} 
                  onValueChange={(value) => handleSelectChange("dayOfWeek", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="game">Game</Label>
                <Select 
                  value={formData.game || ""} 
                  onValueChange={(value) => handleSelectChange("game", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select game (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {GAMES.map(game => (
                      <SelectItem key={game} value={game}>{game}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Stream Title (Optional)</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter stream title"
                className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add any additional notes or details"
                className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]"
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="isSpecialEvent"
                name="isSpecialEvent"
                type="checkbox"
                checked={formData.isSpecialEvent}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              <Label htmlFor="isSpecialEvent">Mark as Special Event</Label>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdateSchedule}
              disabled={updateScheduleMutation.isPending}
              className="bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))]"
            >
              {updateScheduleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}