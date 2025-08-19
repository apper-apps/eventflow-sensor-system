import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { eventService } from "@/services/api/eventService";

const EventCalendar = ({ onEventClick, selectedDate, onDateChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvents();
  }, [currentMonth]);

  const loadEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await eventService.getAll();
      setEvents(data);
    } catch (error) {
      console.error("Failed to load events:", error);
      setError("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const getDayEvents = (date) => {
    return events.filter(event => 
      isSameDay(new Date(event.date), date)
    );
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const categoryColors = {
    "Party": "bg-pink-500",
    "Conference": "bg-blue-500",
    "Wedding": "bg-rose-500",
    "Meeting": "bg-green-500",
    "Other": "bg-gray-500"
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadEvents} />;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center">
              <ApperIcon name="CalendarDays" className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <p className="text-sm text-gray-600">Click on a date to view events</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth(-1)}
          >
            <ApperIcon name="ChevronLeft" className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth(1)}
          >
            <ApperIcon name="ChevronRight" className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date) => {
          const dayEvents = getDayEvents(date);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isCurrentDay = isToday(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateChange?.(date)}
              className={`
                relative p-2 min-h-[80px] rounded-lg border transition-all duration-200
                ${isCurrentMonth ? "text-gray-900" : "text-gray-400"}
                ${isSelected ? "bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-300" : "border-gray-200 hover:bg-gray-50"}
                ${isCurrentDay ? "bg-gradient-to-br from-accent-50 to-accent-100 border-accent-300" : ""}
              `}
            >
              <div className="text-sm font-medium mb-1">
                {format(date, "d")}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event, index) => (
                  <div
                    key={event.Id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    className={`
                      w-full h-1.5 rounded-full ${categoryColors[event.category] || "bg-gray-400"}
                      hover:opacity-80 cursor-pointer
                    `}
                    title={event.title}
                  />
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500 font-medium">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>

              {isCurrentDay && (
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-gray-600">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default EventCalendar;