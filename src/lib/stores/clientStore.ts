import { create } from 'zustand';
import { Client, CreateClientRequest, UpdateClientRequest, ClientSearchParams } from '../../types';
import { supabaseClientService } from '../supabase/services/ClientService';
import { PaginatedResponse } from '../api/config';

interface ClientState {
  // State
  clients: Client[];
  selectedClient: Client | null;
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: ClientSearchParams;

  // Actions
  fetchClients: (params?: ClientSearchParams) => Promise<void>;
  fetchClient: (id: string) => Promise<void>;
  createClient: (clientData: CreateClientRequest) => Promise<Client>;
  updateClient: (id: string, clientData: UpdateClientRequest) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  setSelectedClient: (client: Client | null) => void;
  setFilters: (filters: Partial<ClientSearchParams>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useClientStore = create<ClientState>((set, get) => ({
  // Initial state
  clients: [],
  selectedClient: null,
  isLoading: false,
  error: null,
  lastFetchTime: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    page: 1,
    limit: 20,
  },

  // Actions
  fetchClients: async (params?: ClientSearchParams) => {
    const state = get();
    const now = Date.now();
    
    // Кэширование: не загружаем повторно в течение 30 секунд
    if (state.lastFetchTime && (now - state.lastFetchTime) < 30000 && state.clients.length > 0) {
      console.log('Using cached clients data');
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const searchParams = { ...get().filters, ...params };
      const response: PaginatedResponse<Client> = await supabaseClientService.getClients(searchParams);
      
      set({
        clients: response.data,
        pagination: response.pagination,
        filters: searchParams,
        isLoading: false,
        lastFetchTime: now,
      });
      
    } catch (error: any) {
      console.error('Failed to fetch clients from Supabase, using mock data:', error);
      
      // Fallback to mock data
      const { mockClients } = await import('../../mockData');
      set({
        clients: mockClients,
        pagination: {
          page: 1,
          limit: 20,
          total: mockClients.length,
          totalPages: 1,
        },
        filters: searchParams,
        isLoading: false,
        lastFetchTime: now,
        error: null,
      });
    }
  },

  fetchClient: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const client = await supabaseClientService.getClient(id);
      
      set({
        selectedClient: client,
        isLoading: false,
      });
      
      // Update client in clients list if it exists
      const { clients } = get();
      const clientIndex = clients.findIndex(c => c.id === id);
      if (clientIndex !== -1) {
        const updatedClients = [...clients];
        updatedClients[clientIndex] = client;
        set({ clients: updatedClients });
      }
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка загрузки клиента',
      });
      throw error;
    }
  },

  createClient: async (clientData: CreateClientRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      const newClient = await supabaseClientService.createClient(clientData);
      
      set((state) => ({
        clients: [newClient, ...state.clients],
        isLoading: false,
      }));
      
      return newClient;
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка создания клиента',
      });
      throw error;
    }
  },

  updateClient: async (id: string, clientData: UpdateClientRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedClient = await supabaseClientService.updateClient(id, clientData);
      
      set((state) => ({
        clients: state.clients.map(client =>
          client.id === id ? updatedClient : client
        ),
        selectedClient: state.selectedClient?.id === id ? updatedClient : state.selectedClient,
        isLoading: false,
      }));
      
      return updatedClient;
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка обновления клиента',
      });
      throw error;
    }
  },

  deleteClient: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await supabaseClientService.deleteClient(id);
      
      set((state) => ({
        clients: state.clients.filter(client => client.id !== id),
        selectedClient: state.selectedClient?.id === id ? null : state.selectedClient,
        isLoading: false,
      }));
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка удаления клиента',
      });
      throw error;
    }
  },

  setSelectedClient: (client: Client | null) => {
    set({ selectedClient: client });
  },

  setFilters: (filters: Partial<ClientSearchParams>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
