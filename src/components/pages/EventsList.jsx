import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "@/components/molecules/SearchBar";
import EventCard from "@/components/molecules/EventCard";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { eventService } from "@/services/api/eventService";
import { categoryService } from "@/services/api/categoryService";

const EventsList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [eventsData, categoriesData] = await Promise.all([
        eventService.getAll(),
        categoryService.getAll()
      ]);
      setEvents(eventsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load data:", error);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedEvents = React.useMemo(() => {
    let filtered = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.date) - new Date(b.date);
        case "date-desc":
          return new Date(b.date) - new Date(a.date);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "guests-desc":
          return (b.guestCount || 0) - (a.guestCount || 0);
        case "guests-asc":
          return (a.guestCount || 0) - (b.guestCount || 0);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    return filtered;
  }, [events, searchTerm, selectedCategory, sortBy]);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
          <p className="text-gray-600">
            Manage and organize all your events in one place
          </p>
        </div>
        
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate("/events/create")}
          className="self-start lg:self-center"
        >
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12">
          <Empty
            icon="Calendar"
            title="No events created yet"
            description="Start your event planning journey by creating your first event"
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
        <>
          {/* Filters and Search */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search events by title, location, or description..."
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-4">
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="min-w-[140px]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.Id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </Select>

                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="min-w-[140px]"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                  <option value="guests-desc">Most Guests</option>
                  <option value="guests-asc">Fewest Guests</option>
                </Select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredAndSortedEvents.length} of {events.length} events
              </span>
              
              {(searchTerm || selectedCategory !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Events Grid */}
          {filteredAndSortedEvents.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12">
              <Empty
                icon="Search"
                title="No events match your filters"
                description="Try adjusting your search terms or category filter to find more events"
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedEvents.map((event) => (
                <EventCard
                  key={event.Id}
                  event={event}
                  onClick={() => navigate(`/events/${event.Id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventsList;