import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, isAfter, isBefore, addDays } from "date-fns";
import StatCard from "@/components/molecules/StatCard";
import EventCard from "@/components/molecules/EventCard";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { eventService } from "@/services/api/eventService";

const Dashboard = () => {
  const navigate = useNavigate();
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
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadEvents} />;

  const now = new Date();
  const nextWeek = addDays(now, 7);

  const upcomingEvents = events
    .filter(event => isAfter(new Date(event.date), now))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 6);

  const recentEvents = events
    .filter(event => isBefore(new Date(event.date), now))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  const thisWeekEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return isAfter(eventDate, now) && isBefore(eventDate, nextWeek);
  });

  const totalGuests = events.reduce((sum, event) => sum + (event.guestCount || 0), 0);

  const categoryStats = events.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {});

  const mostPopularCategory = Object.keys(categoryStats).length > 0 
    ? Object.entries(categoryStats).sort(([,a], [,b]) => b - a)[0][0]
    : "Party";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-3xl lg:text-4xl font-bold gradient-text font-display mb-4">
          Welcome to EventFlow
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage your events with style and celebrate every milestone with ease
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Events"
          value={events.length}
          icon="Calendar"
          gradient="purple-pink"
        />
        <StatCard
          title="Upcoming Events"
          value={upcomingEvents.length}
          icon="Clock"
          gradient="accent"
        />
        <StatCard
          title="This Week"
          value={thisWeekEvents.length}
          icon="CalendarDays"
          gradient="success"
        />
        <StatCard
          title="Total Guests"
          value={totalGuests}
          icon="Users"
          gradient="info"
        />
      </div>

      {events.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-gray-200 p-12">
          <Empty
            icon="Calendar"
            title="Start Creating Amazing Events"
            description="Your event journey begins here. Create your first event and start celebrating with style."
            action={
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/events/create")}
              >
                <ApperIcon name="Plus" className="h-5 w-5 mr-2" />
                Create Your First Event
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Events */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center">
                  <ApperIcon name="Clock" className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
              </div>
              
              <Button
                variant="ghost"
                onClick={() => navigate("/events")}
                className="text-primary-600 hover:text-primary-700"
              >
                View All
                <ApperIcon name="ArrowRight" className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <Empty
                  icon="Clock"
                  title="No upcoming events"
                  description="All caught up! Create a new event to get started."
                  action={
                    <Button
                      variant="primary"
                      onClick={() => navigate("/events/create")}
                    >
                      <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.Id}
                    event={event}
                    onClick={() => navigate(`/events/${event.Id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={() => navigate("/events/create")}
                  className="w-full justify-start"
                >
                  <ApperIcon name="Plus" className="h-4 w-4 mr-3" />
                  Create New Event
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/calendar")}
                  className="w-full justify-start"
                >
                  <ApperIcon name="CalendarDays" className="h-4 w-4 mr-3" />
                  View Calendar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/events")}
                  className="w-full justify-start"
                >
                  <ApperIcon name="List" className="h-4 w-4 mr-3" />
                  All Events
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            {recentEvents.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ApperIcon name="History" className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Events</h3>
                </div>
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <div
                      key={event.Id}
                      onClick={() => navigate(`/events/${event.Id}`)}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                        <ApperIcon name="Check" className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(event.date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Categories */}
            {Object.keys(categoryStats).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ApperIcon name="PieChart" className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(categoryStats)
                    .sort(([,a], [,b]) => b - a)
                    .map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{category}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {count} event{count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;