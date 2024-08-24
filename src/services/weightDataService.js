import { saveData, loadData } from '../utils/storage';

export const weightDataService = {
  getAllWeights: async () => {
    return loadData();
  },

  addWeight: async (weightEntry) => {
    const currentData = loadData();
    const newData = [...currentData, weightEntry];
    saveData(newData);
    return weightEntry;
  },

  addBulkWeights: async (weightEntries) => {
    const currentData = loadData();
    const combinedData = [...currentData, ...weightEntries];
    
    // Remove duplicates based on date
    const uniqueData = combinedData.reduce((acc, current) => {
      const x = acc.find(item => item.date === current.date);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

    // Sort data by date
    uniqueData.sort((a, b) => new Date(a.date) - new Date(b.date));

    saveData(uniqueData);
    return uniqueData;
  },

  updateWeights: async (updatedData) => {
    saveData(updatedData);
    return updatedData;
  },
};