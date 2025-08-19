import React from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const EventCard = ({ event, onClick }) => {
  const navigate = useNavigate();
  
  const categoryConfig = {
    "Party": { icon: "PartyPopper", color: "secondary", bg: "from-pink-500 to-rose-500" },
    "Conference": { icon: "Users", color: "primary", bg: "from-blue-500 to-indigo-500" },
    "Wedding": { icon: "Heart", color: "accent", bg: "from-rose-500 to-pink-500" },
    "Meeting": { icon: "Calendar", color: "success", bg: "from-green-500 to-emerald-500" },
    "Other": { icon: "Star", color: "default", bg: "from-gray-500 to-slate-500" }
  };

  const config = categoryConfig[event.category] || categoryConfig["Other"];

  const handleClick = () => {
    if (onClick) {
      onClick(event);
    } else {
      navigate(`/events/${event.Id}`);
    }
  };

  return (
    <Card className="p-0 overflow-hidden" onClick={handleClick}>
      <div className={`h-2 bg-gradient-to-r ${config.bg}`} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
              {event.title}
            </h3>
            <Badge variant={config.color} size="sm" className="mb-3">
              <ApperIcon name={config.icon} className="h-3 w-3 mr-1" />
              {event.category}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <ApperIcon name="Calendar" className="h-4 w-4 mr-3 text-gray-400" />
            <span className="text-sm">
              {format(new Date(event.date), "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <ApperIcon name="MapPin" className="h-4 w-4 mr-3 text-gray-400" />
            <span className="text-sm line-clamp-1">{event.location}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <ApperIcon name="Users" className="h-4 w-4 mr-3 text-gray-400" />
            <span className="text-sm">{event.guestCount} guests</span>
          </div>
        </div>

        {event.description && (
          <p className="mt-4 text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Created {format(new Date(event.createdAt), "MMM d")}
          </span>
          <ApperIcon name="ChevronRight" className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </Card>
  );
};

export default EventCard;