import eventsData from "@/services/mockData/events.json";

let events = [...eventsData];

const delay = () => new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

export const eventService = {
  async getAll() {
    await delay();
    return [...events];
  },

  async getById(id) {
    await delay();
    const event = events.find(e => e.Id === id);
    if (!event) {
      throw new Error("Event not found");
    }
    return { ...event };
  },

  async create(eventData) {
    await delay();
    const maxId = Math.max(...events.map(e => e.Id));
    const newEvent = {
      ...eventData,
      Id: maxId + 1,
      createdAt: new Date().toISOString(),
      guestCount: eventData.guestCount || 0
    };
    events.push(newEvent);
    return { ...newEvent };
  },

  async update(id, eventData) {
    await delay();
    const index = events.findIndex(e => e.Id === id);
    if (index === -1) {
      throw new Error("Event not found");
    }
    
    const updatedEvent = {
      ...events[index],
      ...eventData,
      Id: id // Ensure ID doesn't change
    };
    
    events[index] = updatedEvent;
    return { ...updatedEvent };
  },

  async delete(id) {
    await delay();
    const index = events.findIndex(e => e.Id === id);
    if (index === -1) {
      throw new Error("Event not found");
    }
    events.splice(index, 1);
    return true;
  },

  async updateGuestCount(id, count) {
    await delay();
    const index = events.findIndex(e => e.Id === id);
    if (index === -1) {
      throw new Error("Event not found");
    }
    
    events[index] = {
      ...events[index],
      guestCount: count
    };
    
    return { ...events[index] };
  }
};