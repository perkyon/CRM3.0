// Export all API services
export { clientService, ClientService } from './ClientService';
export { projectService, ProjectService } from './ProjectService';
export { productionService, ProductionService } from './ProductionService';
export { userService, UserService } from './UserService';
export { dashboardService, DashboardService } from './DashboardService';

// Export API client and utilities
export { apiClient, apiService, ApiService, handleApiError, isNetworkError, isServerError } from '../client';
export { API_CONFIG, API_ENDPOINTS, HTTP_STATUS, type ApiResponse, type ApiError, type PaginatedResponse } from '../config';
