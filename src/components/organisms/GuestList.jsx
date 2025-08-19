import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";
import GuestItem from "@/components/molecules/GuestItem";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { guestService } from "@/services/api/guestService";
import { eventService } from "@/services/api/eventService";

const GuestList = ({ eventId, onGuestCountUpdate }) => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadGuests();
  }, [eventId]);

  const loadGuests = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await guestService.getByEventId(eventId);
      setGuests(data);
      onGuestCountUpdate?.(data.length);
    } catch (error) {
      console.error("Failed to load guests:", error);
      setError("Failed to load guests");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!newGuest.name.trim() || !newGuest.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setSubmitting(true);
    try {
      const guestData = {
        ...newGuest,
        eventId: parseInt(eventId),
        rsvpStatus: "Pending"
      };

      const savedGuest = await guestService.create(guestData);
      setGuests(prev => [...prev, savedGuest]);
      setNewGuest({ name: "", email: "", phone: "" });
      setShowAddForm(false);
      onGuestCountUpdate?.(guests.length + 1);
      
      // Update event guest count
      await eventService.updateGuestCount(eventId, guests.length + 1);
      
      toast.success("Guest added successfully!");
    } catch (error) {
      console.error("Failed to add guest:", error);
      toast.error("Failed to add guest");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRsvp = async (guestId, status) => {
    try {
      const updatedGuest = await guestService.updateRsvp(guestId, status);
      setGuests(prev => prev.map(g => g.Id === guestId ? updatedGuest : g));
      toast.success(`RSVP updated to ${status.toLowerCase()}`);
    } catch (error) {
      console.error("Failed to update RSVP:", error);
      toast.error("Failed to update RSVP");
    }
  };

  const handleRemoveGuest = async (guestId) => {
    if (!confirm("Are you sure you want to remove this guest?")) {
      return;
    }

    try {
      await guestService.delete(guestId);
      const updatedGuests = guests.filter(g => g.Id !== guestId);
      setGuests(updatedGuests);
      onGuestCountUpdate?.(updatedGuests.length);
      
      // Update event guest count
      await eventService.updateGuestCount(eventId, updatedGuests.length);
      
      toast.success("Guest removed successfully");
    } catch (error) {
      console.error("Failed to remove guest:", error);
      toast.error("Failed to remove guest");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGuest(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const rsvpStats = {
    total: guests.length,
    accepted: guests.filter(g => g.rsvpStatus === "Accepted").length,
    declined: guests.filter(g => g.rsvpStatus === "Declined").length,
    pending: guests.filter(g => g.rsvpStatus === "Pending").length
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadGuests} />;

  return (
    <div className="space-y-6">
      {/* RSVP Stats */}
      {guests.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{rsvpStats.total}</div>
            <div className="text-sm text-gray-600">Total Guests</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{rsvpStats.accepted}</div>
            <div className="text-sm text-gray-600">Accepted</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{rsvpStats.declined}</div>
            <div className="text-sm text-gray-600">Declined</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{rsvpStats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </Card>
        </div>
      )}

      {/* Guest List Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary-500 to-accent-500 flex items-center justify-center">
              <ApperIcon name="Users" className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Guest List</h3>
              <p className="text-sm text-gray-600">Manage your event guests and RSVPs</p>
            </div>
          </div>
          
          <Button
            variant="primary"
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={submitting}
          >
            <ApperIcon name="UserPlus" className="h-4 w-4 mr-2" />
            Add Guest
          </Button>
        </div>

        {/* Add Guest Form */}
        {showAddForm && (
          <Card className="p-4 mb-6 bg-gray-50">
            <form onSubmit={handleAddGuest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  name="name"
                  placeholder="Guest name"
                  value={newGuest.name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="Guest email"
                  value={newGuest.email}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  name="phone"
                  placeholder="Phone number (optional)"
                  value={newGuest.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                      Add Guest
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewGuest({ name: "", email: "", phone: "" });
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Guest List */}
        <div className="space-y-3">
          {guests.length === 0 ? (
            <Empty
              icon="Users"
              title="No guests yet"
              description="Add guests to start managing RSVPs for your event"
              action={
                <Button
                  variant="primary"
                  onClick={() => setShowAddForm(true)}
                >
                  <ApperIcon name="UserPlus" className="h-4 w-4 mr-2" />
                  Add First Guest
                </Button>
              }
            />
          ) : (
            guests.map((guest) => (
              <GuestItem
                key={guest.Id}
                guest={guest}
                onUpdateRsvp={handleUpdateRsvp}
                onRemove={handleRemoveGuest}
              />
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default GuestList;