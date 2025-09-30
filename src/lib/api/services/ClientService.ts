import { apiService } from '../client';
import { API_ENDPOINTS, PaginatedResponse } from '../config';
import { Client, CreateClientRequest, UpdateClientRequest } from '../../types';

export class ClientService {
  // Get all clients with pagination and filters
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    tags?: string[];
  }): Promise<PaginatedResponse<Client>> {
    const response = await apiService.get<PaginatedResponse<Client>>(
      API_ENDPOINTS.clients.list,
      { params }
    );
    return response.data;
  }

  // Get single client by ID
  async getClient(id: string): Promise<Client> {
    const response = await apiService.get<Client>(API_ENDPOINTS.clients.get(id));
    return response.data;
  }

  // Create new client
  async createClient(clientData: CreateClientRequest): Promise<Client> {
    const response = await apiService.post<Client>(
      API_ENDPOINTS.clients.create,
      clientData
    );
    return response.data;
  }

  // Update existing client
  async updateClient(id: string, clientData: UpdateClientRequest): Promise<Client> {
    const response = await apiService.put<Client>(
      API_ENDPOINTS.clients.update(id),
      clientData
    );
    return response.data;
  }

  // Delete client
  async deleteClient(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.clients.delete(id));
  }

  // Get client projects
  async getClientProjects(clientId: string): Promise<Client['projects']> {
    const response = await apiService.get<Client['projects']>(
      `${API_ENDPOINTS.clients.get(clientId)}/projects`
    );
    return response.data;
  }

  // Get client documents
  async getClientDocuments(clientId: string): Promise<Client['documents']> {
    const response = await apiService.get<Client['documents']>(
      `${API_ENDPOINTS.clients.get(clientId)}/documents`
    );
    return response.data;
  }

  // Upload client document
  async uploadClientDocument(
    clientId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Client['documents'][0]> {
    const response = await apiService.upload<Client['documents'][0]>(
      `${API_ENDPOINTS.clients.get(clientId)}/documents/upload`,
      file,
      onProgress
    );
    return response.data;
  }

  // Delete client document
  async deleteClientDocument(clientId: string, documentId: string): Promise<void> {
    await apiService.delete(
      `${API_ENDPOINTS.clients.get(clientId)}/documents/${documentId}`
    );
  }
}

// Export singleton instance
export const clientService = new ClientService();
