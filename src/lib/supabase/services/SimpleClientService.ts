import { supabase, TABLES } from '../config';
import { Client, CreateClientRequest, UpdateClientRequest, ClientSearchParams } from '../../../types';
import { PaginatedResponse } from '../../api/config';

// Simplified ClientService without complex JOINs
export class SimpleClientService {
  // Get all clients with simple query (no JOINs)
  async getClients(params?: ClientSearchParams): Promise<PaginatedResponse<Client>> {
    const { page = 1, limit = 20, search, status, type, ownerId } = params || {};
    
    let query = supabase
      .from(TABLES.CLIENTS)
      .select('*', { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('SimpleClientService.getClients error:', error);
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }

    // Map data to Client interface
    const clients = (data || []).map((client: any) => ({
      id: client.id,
      type: client.type,
      name: client.name,
      company: client.company,
      preferredChannel: client.preferred_channel,
      source: client.source,
      status: client.status,
      lastActivity: client.last_activity,
      ownerId: client.owner_id,
      projectsCount: client.projects_count || 0,
      arBalance: client.ar_balance || 0,
      notes: client.notes,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
      contacts: [], // Will be loaded separately
      addresses: [], // Will be loaded separately
      tags: [], // Will be loaded separately
      documents: [], // Will be loaded separately
      projects: [], // Will be loaded separately
    }));

    return {
      data: clients,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  // Get single client by ID (simple query)
  async getClient(id: string): Promise<Client> {
    const { data, error } = await supabase
      .from(TABLES.CLIENTS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('SimpleClientService.getClient error:', error);
      throw new Error(`Failed to fetch client: ${error.message}`);
    }

    // Load related data separately
    const [contacts, addresses, projects] = await Promise.all([
      this.getClientContacts(id),
      this.getClientAddresses(id),
      this.getClientProjects(id),
    ]);

    return {
      id: data.id,
      type: data.type,
      name: data.name,
      company: data.company,
      preferredChannel: data.preferred_channel,
      source: data.source,
      status: data.status,
      lastActivity: data.last_activity,
      ownerId: data.owner_id,
      projectsCount: data.projects_count || 0,
      arBalance: data.ar_balance || 0,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      contacts,
      addresses,
      tags: [], // TODO: Implement if needed
      documents: [], // TODO: Implement if needed
      projects,
    };
  }

  // Get client contacts separately
  async getClientContacts(clientId: string) {
    const { data, error } = await supabase
      .from(TABLES.CONTACTS)
      .select('*')
      .eq('client_id', clientId);

    if (error) {
      console.error('SimpleClientService.getClientContacts error:', error);
      return [];
    }

    return (data || []).map((contact: any) => ({
      ...contact,
      isPrimary: contact.is_primary,
    }));
  }

  // Get client addresses separately
  async getClientAddresses(clientId: string) {
    const { data, error } = await supabase
      .from(TABLES.ADDRESSES)
      .select('*')
      .eq('client_id', clientId);

    if (error) {
      console.error('SimpleClientService.getClientAddresses error:', error);
      return [];
    }

    return data || [];
  }

  // Get client projects separately
  async getClientProjects(clientId: string) {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .select('id, title, stage, priority, due_date, created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('SimpleClientService.getClientProjects error:', error);
      return [];
    }

    return data || [];
  }

  // Create new client (simplified)
  async createClient(clientData: CreateClientRequest): Promise<Client> {
    const { contacts, addresses, ...clientInfo } = clientData;

    // Create client first
    const { data: client, error: clientError } = await supabase
      .from(TABLES.CLIENTS)
      .insert({
        type: clientInfo.type,
        name: clientInfo.name,
        company: clientInfo.company,
        preferred_channel: clientInfo.preferredChannel,
        source: clientInfo.source,
        status: clientInfo.status,
        owner_id: clientInfo.ownerId,
        notes: clientInfo.notes,
        projects_count: 0,
        ar_balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (clientError) {
      console.error('SimpleClientService.createClient error:', clientError);
      throw new Error(`Failed to create client: ${clientError.message}`);
    }

    // Create contacts if provided
    if (contacts && contacts.length > 0) {
      const contactsData = contacts.map(contact => {
        const { isPrimary, ...contactData } = contact;
        return {
          ...contactData,
          client_id: client.id,
          is_primary: isPrimary,
          created_at: new Date().toISOString(),
        };
      });

      const { error: contactsError } = await supabase
        .from(TABLES.CONTACTS)
        .insert(contactsData);

      if (contactsError) {
        console.error('SimpleClientService.createClient contacts error:', contactsError);
        // Don't throw error, client was created successfully
      }
    }

    // Return the created client
    return this.getClient(client.id);
  }

  // Update client (simplified)
  async updateClient(id: string, clientData: UpdateClientRequest): Promise<Client> {
    const { contacts, addresses, ...clientInfo } = clientData;

    // Update client basic info
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only update fields that are provided
    if (clientInfo.type !== undefined) updateData.type = clientInfo.type;
    if (clientInfo.name !== undefined) updateData.name = clientInfo.name;
    if (clientInfo.company !== undefined) updateData.company = clientInfo.company;
    if (clientInfo.preferredChannel !== undefined) updateData.preferred_channel = clientInfo.preferredChannel;
    if (clientInfo.source !== undefined) updateData.source = clientInfo.source;
    if (clientInfo.status !== undefined) updateData.status = clientInfo.status;
    if (clientInfo.ownerId !== undefined) updateData.owner_id = clientInfo.ownerId;
    if (clientInfo.notes !== undefined) updateData.notes = clientInfo.notes;

    const { error: clientError } = await supabase
      .from(TABLES.CLIENTS)
      .update(updateData)
      .eq('id', id);

    if (clientError) {
      console.error('SimpleClientService.updateClient error:', clientError);
      throw new Error(`Failed to update client: ${clientError.message}`);
    }

    // Update contacts if provided
    if (contacts) {
      // Delete existing contacts
      await supabase
        .from(TABLES.CONTACTS)
        .delete()
        .eq('client_id', id);

      // Insert new contacts
      if (contacts.length > 0) {
        const contactsData = contacts.map(contact => {
          const { isPrimary, ...contactData } = contact;
          return {
            ...contactData,
            client_id: id,
            is_primary: isPrimary,
            created_at: new Date().toISOString(),
          };
        });

        const { error: contactsError } = await supabase
          .from(TABLES.CONTACTS)
          .insert(contactsData);

        if (contactsError) {
          console.error('SimpleClientService.updateClient contacts error:', contactsError);
          // Don't throw error, client was updated successfully
        }
      }
    }

    // Return updated client
    return this.getClient(id);
  }
}

// Export singleton instance
export const simpleClientService = new SimpleClientService();
