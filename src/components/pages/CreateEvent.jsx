import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import EventForm from "@/components/organisms/EventForm";

const CreateEvent = () => {
  const navigate = useNavigate();

  const handleEventSave = (savedEvent) => {
    navigate(`/events/${savedEvent.Id}`);
  };

  const handleCancel = () => {
    navigate("/events");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleCancel}
          >
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>

      {/* Form */}
      <EventForm
        onSave={handleEventSave}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateEvent;