import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  expiryDate: string;
  photo: string | null;
  isInShoppingList: boolean;
}

export interface ScheduleItem {
  id: string;
  medicineId: string;
  medicineName: string;
  times: string[]; 
  days: number[];  
  endDate: string; 
}

const MEDS_KEY = '@family_meds';
const SCHEDULE_KEY = '@family_schedule';

export const saveMedicines = async (meds: Medicine[]) => {
  try { await AsyncStorage.setItem(MEDS_KEY, JSON.stringify(meds)); } catch (e) { console.error(e); }
};

export const getMedicines = async (): Promise<Medicine[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(MEDS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) { return []; }
};

export const saveSchedule = async (schedule: ScheduleItem[]) => {
  try { await AsyncStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule)); } catch (e) { console.error(e); }
};

export const getSchedule = async (): Promise<ScheduleItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(SCHEDULE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) { return []; }
};