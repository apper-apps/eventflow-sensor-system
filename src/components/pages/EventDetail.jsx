import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import GuestList from "@/components/organisms/GuestList";
import EventForm from "@/components/organisms/EventForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { eventService } from "@/services/api/eventService";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await eventService.getById(parseInt(id));
      setEvent(data);
    } catch (error) {
      console.error("Failed to load event:", error);
      setError("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const handleEventUpdate = (updatedEvent) => {
    setEvent(updatedEvent);
    setIsEditing(false);
  };

  const handleGuestCountUpdate = async (newCount) => {
    setEvent(prev => ({
      ...prev,
      guestCount: newCount
    }));
  };

  const handleDeleteEvent = async () => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      await eventService.delete(event.Id);
      toast.success("Event deleted successfully");
      navigate("/events");
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadEvent} />;
  if (!event) return <Error message="Event not found" />;

  const categoryConfig = {
    "Party": { icon: "PartyPopper", color: "secondary" },
    "Conference": { icon: "Users", color: "primary" },
    "Wedding": { icon: "Heart", color: "accent" },
    "Meeting": { icon: "Calendar", color: "success" },
    "Other": { icon: "Star", color: "default" }
  };

  const config = categoryConfig[event.category] || categoryConfig["Other"];
  const eventDate = new Date(event.date);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EventForm
          event={event}
          onSave={handleEventUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/events")}
        >
          <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>

      {/* Event Details */}
      <Card className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center">
                <ApperIcon name={config.icon} className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {event.title}
                </h1>
                <Badge variant={config.color} size="lg">
                  <ApperIcon name={config.icon} className="h-4 w-4 mr-2" />
                  {event.category}
                </Badge>
              </div>
            </div>

            {event.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">DESCRIPTION</h3>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            <Button
              variant="primary"
              onClick={() => setIsEditing(true)}
            >
              <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
              Edit Event
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteEvent}
            >
              <ApperIcon name="Trash2" className="h-4 w-4 mr-2" />
              Delete Event
            </Button>
          </div>
        </div>

        {/* Event Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <ApperIcon name="Calendar" className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">START DATE</p>
                <p className="text-base font-medium text-gray-900">
                  {format(eventDate, "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-sm text-gray-600">
                  {format(eventDate, "h:mm a")}
                </p>
              </div>
            </div>
          </div>

          {endDate && (
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <ApperIcon name="Clock" className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">END DATE</p>
                  <p className="text-base font-medium text-gray-900">
                    {format(endDate, "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(endDate, "h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <ApperIcon name="MapPin" className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">LOCATION</p>
                <p className="text-base font-medium text-gray-900">
                  {event.location}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <ApperIcon name="Users" className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">GUESTS</p>
                <p className="text-base font-medium text-gray-900">
                  {event.guestCount || 0} invited
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <ApperIcon name="Calendar" className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">CREATED</p>
                <p className="text-base font-medium text-gray-900">
                  {format(new Date(event.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Guest Management */}
      <GuestList 
        eventId={event.Id} 
        onGuestCountUpdate={handleGuestCountUpdate}
      />
    </div>
  );
};

export default EventDetail;