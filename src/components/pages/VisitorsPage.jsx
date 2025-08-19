import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SearchBar from '@/components/molecules/SearchBar';
import GuestItem from '@/components/molecules/GuestItem';
import StatCard from '@/components/molecules/StatCard';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { guestService } from '@/services/api/guestService';
import { eventService } from '@/services/api/eventService';

const VisitorsPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    eventId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [visitorsData, eventsData] = await Promise.all([
        guestService.getAll(),
        eventService.getAll()
      ]);
      setVisitors(visitorsData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load visitors data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!newGuest.name.trim() || !newGuest.email.trim() || !newGuest.eventId) {
      toast.error('Name, email and event are required');
      return;
    }

    setSubmitting(true);
    try {
      const guestData = {
        ...newGuest,
        eventId: parseInt(newGuest.eventId),
        rsvpStatus: 'Pending'
      };

      const savedGuest = await guestService.create(guestData);
      setVisitors(prev => [...prev, savedGuest]);
      setNewGuest({ name: '', email: '', phone: '', eventId: '' });
      setShowAddForm(false);
      
      // Update event guest count
      const eventVisitors = visitors.filter(v => v.eventId === parseInt(newGuest.eventId));
      await eventService.updateGuestCount(newGuest.eventId, eventVisitors.length + 1);
      
      toast.success('Visitor added successfully!');
    } catch (error) {
      console.error('Failed to add visitor:', error);
      toast.error('Failed to add visitor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRsvp = async (guestId, status) => {
    try {
      const updatedGuest = await guestService.updateRsvp(guestId, status);
      setVisitors(prev => prev.map(v => v.Id === guestId ? updatedGuest : v));
      toast.success(`RSVP updated to ${status.toLowerCase()}`);
    } catch (error) {
      console.error('Failed to update RSVP:', error);
      toast.error('Failed to update RSVP');
    }
  };

  const handleRemoveGuest = async (guestId) => {
    if (!confirm('Are you sure you want to remove this visitor?')) {
      return;
    }

    try {
      const guest = visitors.find(v => v.Id === guestId);
      await guestService.delete(guestId);
      const updatedVisitors = visitors.filter(v => v.Id !== guestId);
      setVisitors(updatedVisitors);
      
      // Update event guest count
      const eventVisitors = updatedVisitors.filter(v => v.eventId === guest.eventId);
      await eventService.updateGuestCount(guest.eventId, eventVisitors.length);
      
      toast.success('Visitor removed successfully');
    } catch (error) {
      console.error('Failed to remove visitor:', error);
      toast.error('Failed to remove visitor');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGuest(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter visitors based on search and filters
  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         visitor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || visitor.rsvpStatus === statusFilter;
    const matchesEvent = eventFilter === 'all' || visitor.eventId.toString() === eventFilter;
    
    return matchesSearch && matchesStatus && matchesEvent;
  });

  // Calculate statistics
  const stats = {
    total: visitors.length,
    accepted: visitors.filter(v => v.rsvpStatus === 'Accepted').length,
    declined: visitors.filter(v => v.rsvpStatus === 'Declined').length,
    pending: visitors.filter(v => v.rsvpStatus === 'Pending').length
  };

  // Get event name by ID
  const getEventName = (eventId) => {
    const event = events.find(e => e.Id === eventId);
    return event ? event.title : 'Unknown Event';
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Visitors Management</h1>
            <p className="text-gray-600">Manage all visitors and RSVPs across your events</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={submitting}
          >
            <ApperIcon name="UserPlus" className="h-5 w-5 mr-2" />
            Add Visitor
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Visitors"
          value={stats.total}
          icon="Users"
          color="blue"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Accepted"
          value={stats.accepted}
          icon="Check"
          color="green"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Declined"
          value={stats.declined}
          icon="X"
          color="red"
          trend={{ value: 0, isPositive: false }}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon="Clock"
          color="amber"
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      {/* Add Visitor Form */}
      {showAddForm && (
        <Card className="p-6 mb-8 bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <ApperIcon name="UserPlus" className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add New Visitor</h3>
              <p className="text-sm text-gray-600">Add a visitor to one of your events</p>
            </div>
          </div>

          <form onSubmit={handleAddGuest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                name="name"
                placeholder="Visitor name"
                value={newGuest.name}
                onChange={handleInputChange}
                required
              />
              <Input
                name="email"
                type="email"
                placeholder="Visitor email"
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
              <Select
                name="eventId"
                value={newGuest.eventId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Event</option>
                {events.map(event => (
                  <option key={event.Id} value={event.Id}>
                    {event.title}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
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
                    Add Visitor
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setNewGuest({ name: '', email: '', phone: '', eventId: '' });
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search visitors by name or email..."
            />
          </div>
          <div className="flex gap-4">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
              <option value="Pending">Pending</option>
            </Select>
            <Select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="min-w-[160px]"
            >
              <option value="all">All Events</option>
              {events.map(event => (
                <option key={event.Id} value={event.Id}>
                  {event.title}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Visitors List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary-500 to-accent-500 flex items-center justify-center">
              <ApperIcon name="Users" className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                All Visitors ({filteredVisitors.length})
              </h3>
              <p className="text-sm text-gray-600">Manage visitor RSVPs and information</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredVisitors.length === 0 ? (
            <Empty
              icon="Users"
              title="No visitors found"
              description={visitors.length === 0 
                ? "Add visitors to start managing RSVPs for your events"
                : "Try adjusting your search or filter criteria"
              }
              action={visitors.length === 0 && (
                <Button
                  variant="primary"
                  onClick={() => setShowAddForm(true)}
                >
                  <ApperIcon name="UserPlus" className="h-4 w-4 mr-2" />
                  Add First Visitor
                </Button>
              )}
            />
          ) : (
            filteredVisitors.map((visitor) => (
              <div key={visitor.Id} className="relative">
                <GuestItem
                  guest={visitor}
                  onUpdateRsvp={handleUpdateRsvp}
                  onRemove={handleRemoveGuest}
                />
                <div className="absolute top-4 right-20 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {getEventName(visitor.eventId)}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default VisitorsPage;