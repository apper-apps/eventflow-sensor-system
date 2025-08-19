import guestsData from "@/services/mockData/guests.json";

let guests = [...guestsData];

const delay = () => new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

export const guestService = {
  async getAll() {
    await delay();
    return [...guests];
  },

  async getById(id) {
    await delay();
    const guest = guests.find(g => g.Id === id);
    if (!guest) {
      throw new Error("Guest not found");
    }
    return { ...guest };
  },

  async getByEventId(eventId) {
    await delay();
    return guests.filter(g => g.eventId === parseInt(eventId)).map(g => ({ ...g }));
  },

  async create(guestData) {
    await delay();
    const maxId = Math.max(...guests.map(g => g.Id), 0);
    const newGuest = {
      ...guestData,
      Id: maxId + 1,
      addedAt: new Date().toISOString()
    };
    guests.push(newGuest);
    return { ...newGuest };
  },

  async update(id, guestData) {
    await delay();
    const index = guests.findIndex(g => g.Id === id);
    if (index === -1) {
      throw new Error("Guest not found");
    }
    
    const updatedGuest = {
      ...guests[index],
      ...guestData,
      Id: id // Ensure ID doesn't change
    };
    
    guests[index] = updatedGuest;
    return { ...updatedGuest };
  },

  async delete(id) {
    await delay();
    const index = guests.findIndex(g => g.Id === id);
    if (index === -1) {
      throw new Error("Guest not found");
    }
    guests.splice(index, 1);
    return true;
  },

  async updateRsvp(id, status) {
    await delay();
    const index = guests.findIndex(g => g.Id === id);
    if (index === -1) {
      throw new Error("Guest not found");
    }
    
    guests[index] = {
      ...guests[index],
      rsvpStatus: status
    };
    
    return { ...guests[index] };
  }
};