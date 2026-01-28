import api from './api';

const contentService = {
  getPageContent: async (page: string) => {
    const response = await api.get(`/content/${page}`);
    return response.data;
  }
};

export default contentService;
