import React from "react";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const GuestItem = ({ guest, onUpdateRsvp, onRemove, showActions = true }) => {
  const rsvpConfig = {
    "Pending": { variant: "warning", icon: "Clock" },
    "Accepted": { variant: "success", icon: "Check" },
    "Declined": { variant: "danger", icon: "X" }
  };

  const config = rsvpConfig[guest.rsvpStatus] || rsvpConfig["Pending"];

  const handleRsvpUpdate = (status) => {
    onUpdateRsvp?.(guest.Id, status);
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-medium text-sm">
            {guest.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {guest.name}
            </h4>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-500 truncate">{guest.email}</span>
              {guest.phone && (
                <span className="text-sm text-gray-500">{guest.phone}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Badge variant={config.variant} size="sm">
          <ApperIcon name={config.icon} className="h-3 w-3 mr-1" />
          {guest.rsvpStatus}
        </Badge>

        {showActions && (
          <div className="flex items-center space-x-2">
            {guest.rsvpStatus !== "Accepted" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRsvpUpdate("Accepted")}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <ApperIcon name="Check" className="h-4 w-4" />
              </Button>
            )}
            {guest.rsvpStatus !== "Declined" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRsvpUpdate("Declined")}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <ApperIcon name="X" className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove?.(guest.Id)}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50"
            >
              <ApperIcon name="Trash2" className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestItem;