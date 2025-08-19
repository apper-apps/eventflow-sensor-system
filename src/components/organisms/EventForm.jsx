import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { eventService } from "@/services/api/eventService";
import { categoryService } from "@/services/api/categoryService";

const EventForm = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    endDate: "",
    location: "",
    description: "",
    category: "Party"
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
    if (event) {
      setFormData({
        title: event.title || "",
        date: event.date ? format(new Date(event.date), "yyyy-MM-dd'T'HH:mm") : "",
        endDate: event.endDate ? format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm") : "",
        location: event.location || "",
        description: event.description || "",
        category: event.category || "Party"
      });
    }
  }, [event]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        guestCount: event?.guestCount || 0
      };

      let savedEvent;
      if (event?.Id) {
        savedEvent = await eventService.update(event.Id, eventData);
        toast.success("Event updated successfully!");
      } else {
        savedEvent = await eventService.create(eventData);
        toast.success("Event created successfully!");
      }

      onSave?.(savedEvent);
    } catch (error) {
      console.error("Failed to save event:", error);
      toast.error(event?.Id ? "Failed to update event" : "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!event?.Id;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center">
            <ApperIcon name="Calendar" className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? "Edit Event" : "Create New Event"}
            </h2>
            <p className="text-sm text-gray-600">
              {isEditing ? "Update your event details" : "Fill in the details for your new event"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <Input
              name="title"
              label="Event Title"
              placeholder="Enter event title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            name="date"
            label="Start Date & Time"
            type="datetime-local"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <Input
            name="endDate"
            label="End Date & Time (Optional)"
            type="datetime-local"
            value={formData.endDate}
            onChange={handleChange}
          />

          <Input
            name="location"
            label="Location"
            placeholder="Enter event location"
            value={formData.location}
            onChange={handleChange}
            required
          />

          <Select
            name="category"
            label="Category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            {categories.map((category) => (
              <option key={category.Id} value={category.name}>
                {category.name}
              </option>
            ))}
          </Select>

          <div className="lg:col-span-2">
            <Textarea
              name="description"
              label="Description"
              placeholder="Describe your event..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="flex-1 sm:flex-none"
            disabled={loading}
          >
            {loading ? (
              <>
                <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <ApperIcon name={isEditing ? "Save" : "Plus"} className="h-4 w-4 mr-2" />
                {isEditing ? "Update Event" : "Create Event"}
              </>
            )}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default EventForm;