import { apiService } from './api';

const getSettings = async () => {
  const response = await apiService.get('/settings');
  return response.data;
};

const updateSettings = async (settingsData: any) => {
  const response = await apiService.put('/settings', settingsData);
  return response.data;
};

const getPublicSettings = async () => {
  const response = await apiService.get('/settings/public');
  return response.data;
};

const settingService = {
  getSettings,
  updateSettings,
  getPublicSettings
};

export default settingService;
