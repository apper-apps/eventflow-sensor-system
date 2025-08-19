import categoriesData from "@/services/mockData/categories.json";

let categories = [...categoriesData];

const delay = () => new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

export const categoryService = {
  async getAll() {
    await delay();
    return [...categories];
  },

  async getById(id) {
    await delay();
    const category = categories.find(c => c.Id === id);
    if (!category) {
      throw new Error("Category not found");
    }
    return { ...category };
  },

  async create(categoryData) {
    await delay();
    const maxId = Math.max(...categories.map(c => c.Id));
    const newCategory = {
      ...categoryData,
      Id: maxId + 1
    };
    categories.push(newCategory);
    return { ...newCategory };
  },

  async update(id, categoryData) {
    await delay();
    const index = categories.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error("Category not found");
    }
    
    const updatedCategory = {
      ...categories[index],
      ...categoryData,
      Id: id // Ensure ID doesn't change
    };
    
    categories[index] = updatedCategory;
    return { ...updatedCategory };
  },

  async delete(id) {
    await delay();
    const index = categories.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error("Category not found");
    }
    categories.splice(index, 1);
    return true;
  }
};