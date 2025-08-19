import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, isToday } from "date-fns";
import EventCalendar from "@/components/organisms/EventCalendar";
import EventCard from "@/components/molecules/EventCard";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { eventService } from "@/services/api/eventService";

const CalendarView = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

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

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadEvents} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Calendar</h1>
          <p className="text-gray-600">
            View and manage your events in calendar format
          </p>
        </div>
        
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate("/events/create")}
        >
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <EventCalendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onEventClick={(event) => navigate(`/events/${event.Id}`)}
          />
        </div>

        {/* Selected Date Events */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isToday(selectedDate) 
                  ? "bg-gradient-to-br from-accent-500 to-accent-600" 
                  : "bg-gradient-to-br from-primary-600 to-secondary-500"
              }`}>
                <ApperIcon name="CalendarDays" className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {format(selectedDate, "EEEE")}
                </h3>
                <p className="text-sm text-gray-600">
                  {format(selectedDate, "MMMM d, yyyy")}
                  {isToday(selectedDate) && (
                    <span className="ml-2 text-accent-600 font-medium">Today</span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {selectedDateEvents.length === 0 ? (
                <Empty
                  icon="Calendar"
                  title="No events scheduled"
                  description={`No events are scheduled for ${format(selectedDate, "MMMM d")}`}
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate("/events/create")}
                    >
                      <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  }
                />
              ) : (
                <>
                  <div className="text-sm text-gray-600 mb-4">
                    {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? "s" : ""} scheduled
                  </div>
                  {selectedDateEvents
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((event) => (
                      <div
                        key={event.Id}
                        onClick={() => navigate(`/events/${event.Id}`)}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {event.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {format(new Date(event.date), "h:mm a")}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-600">
                            <ApperIcon name="MapPin" className="h-3 w-3 mr-2" />
                            {event.location}
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <ApperIcon name="Users" className="h-3 w-3 mr-2" />
                            {event.guestCount || 0} guests
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ApperIcon name="BarChart3" className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Events</span>
                <span className="font-semibold text-gray-900">{events.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-semibold text-gray-900">
                  {events.filter(event => {
                    const eventDate = new Date(event.date);
                    const now = new Date();
                    return eventDate.getMonth() === now.getMonth() && 
                           eventDate.getFullYear() === now.getFullYear();
                  }).length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Guests</span>
                <span className="font-semibold text-gray-900">
                  {events.reduce((sum, event) => sum + (event.guestCount || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;