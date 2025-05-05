import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StreamerSchedule } from '@shared/schema';
import { Calendar, Clock } from 'lucide-react';

interface StreamerScheduleViewProps {
  schedules: StreamerSchedule[];
}

export function StreamerScheduleView({ schedules }: StreamerScheduleViewProps) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  if (schedules.length === 0) {
    return (
      <div className="text-center py-8 space-y-3">
        <Calendar className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="text-lg font-medium">No Schedule Available</h3>
        <p className="text-sm text-gray-400">
          This streamer hasn't published their streaming schedule yet.
        </p>
      </div>
    );
  }
  
  // Format day names in a user-friendly way
  const formatDay = (day: string): string => {
    // First try to match "Monday", "Tuesday", etc.
    const dayIndex = days.findIndex(d => 
      d.toLowerCase() === day.toLowerCase()
    );
    
    if (dayIndex !== -1) {
      return days[dayIndex];
    }
    
    // Then try numeric formats (0-6, 1-7)
    const dayNum = parseInt(day);
    if (!isNaN(dayNum)) {
      if (dayNum >= 0 && dayNum <= 6) {
        return days[dayNum];
      } else if (dayNum >= 1 && dayNum <= 7) {
        return days[dayNum - 1];
      }
    }
    
    // Return as-is if we can't parse it
    return day;
  };
  
  // Format the time in a user-friendly way
  const formatTime = (time: string): string => {
    if (!time) return '';
    
    try {
      // Handle 24 hour format (HH:MM)
      if (time.includes(':')) {
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      }
      
      // For other formats, return as-is
      return time;
    } catch (error) {
      return time;
    }
  };
  
  // Group schedules by day
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    const day = formatDay(schedule.dayOfWeek);
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {} as Record<string, StreamerSchedule[]>);
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Game</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {days.map(day => {
            const daySchedules = schedulesByDay[day] || [];
            
            if (daySchedules.length === 0) {
              return (
                <TableRow key={day}>
                  <TableCell className="font-medium">{day}</TableCell>
                  <TableCell colSpan={3} className="text-gray-400">
                    No streams scheduled
                  </TableCell>
                </TableRow>
              );
            }
            
            return daySchedules.map((schedule, i) => (
              <TableRow key={`${day}-${i}`}>
                {i === 0 && <TableCell className="font-medium" rowSpan={daySchedules.length}>{day}</TableCell>}
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-400" />
                    <span>
                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs">
                    {schedule.game}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {schedule.notes || '-'}
                </TableCell>
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </div>
  );
}