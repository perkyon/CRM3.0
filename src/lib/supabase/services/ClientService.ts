import { supabase, TABLES } from '../config';
import { Client, CreateClientRequest, UpdateClientRequest, ClientSearchParams } from '../../../types';
import { PaginatedResponse } from '../../api/config';
import { handleApiError } from '../../error/ErrorHandler';

// Helper function to map Supabase data to our Client interface
function mapSupabaseClientToClient(supabaseClient: any): Client {
  return {
    id: supabaseClient.id,
    type: supabaseClient.type,
    name: supabaseClient.name,
    company: supabaseClient.company,
    preferredChannel: supabaseClient.preferred_channel,
    source: supabaseClient.source,
    status: supabaseClient.status,
    lastActivity: supabaseClient.last_activity,
    ownerId: supabaseClient.owner_id,
    projectsCount: supabaseClient.projects_count,
    arBalance: supabaseClient.ar_balance,
    notes: supabaseClient.notes,
    createdAt: supabaseClient.created_at,
    updatedAt: supabaseClient.updated_at,
    contacts: (supabaseClient.contacts || []).map((contact: any) => ({
      ...contact,
      isPrimary: contact.is_primary
    })),
    addresses: supabaseClient.addresses || [],
    tags: supabaseClient.tags || [],
    documents: supabaseClient.documents || [],
    projects: supabaseClient.projects || [],
  };
}

export class SupabaseClientService {
  // Get all clients with pagination and filters
  async getClients(params?: ClientSearchParams): Promise<PaginatedResponse<Client>> {
    const { page = 1, limit = 20, search, status, type, tags, ownerId } = params || {};
    
    let query = supabase
      .from(TABLES.CLIENTS)
      .select('*')
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
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }

    const { data, error, count } = await query;

    if (error) {
      throw handleApiError(error, 'SupabaseClientService.getClients');
    }

    // Fetch related data separately to avoid JOIN issues
    const clientsWithRelations = await Promise.all(
      (data || []).map(async (client) => {
        // Fetch contacts
        const { data: contacts } = await supabase
          .from(TABLES.CONTACTS)
          .select('id, name, phone, email, is_primary')
          .eq('client_id', client.id);

        // Fetch addresses
        const { data: addresses } = await supabase
          .from(TABLES.ADDRESSES)
          .select('id, type, street, city, zip_code')
          .eq('client_id', client.id);

        return {
          ...client,
          contacts: contacts || [],
          addresses: addresses || [],
        };
      })
    );

    return {
      data: clientsWithRelations.map(mapSupabaseClientToClient),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  // Get single client by ID
  async getClient(id: string): Promise<Client> {
    const { data, error } = await supabase
      .from(TABLES.CLIENTS)
      .select(`
        *,
        contacts:contacts(*),
        addresses:addresses(*),
        tags:client_tags(*),
        documents:client_documents(*),
        projects:projects(id, title, stage, priority, due_date)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch client: ${error.message}`);
    }

    return mapSupabaseClientToClient(data);
  }

  // Create new client
  async createClient(clientData: CreateClientRequest): Promise<Client> {
    const { contacts, addresses, tags, ...clientInfo } = clientData;

    // Start transaction
    const { data: client, error: clientError } = await supabase
      .from(TABLES.CLIENTS)
      .insert({
        type: clientInfo.type,
        name: clientInfo.name,
        company: clientInfo.company,
        preferred_channel: clientInfo.preferredChannel,
        source: clientInfo.source,
        status: clientInfo.status,
        owner_id: clientInfo.ownerId || '9fc4d042-f598-487c-a383-cccfe0e219db',
        notes: clientInfo.notes,
        projects_count: 0,
        ar_balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (clientError) {
      throw new Error(`Failed to create client: ${clientError.message}`);
    }

    // Insert contacts
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
        throw new Error(`Failed to create contacts: ${contactsError.message}`);
      }
    }

    // Insert addresses
    if (addresses) {
      const addressesData = [];
      if (addresses.physical) {
        addressesData.push({
          ...addresses.physical,
          client_id: client.id,
          type: 'physical',
          created_at: new Date().toISOString(),
        });
      }
      if (addresses.billing) {
        addressesData.push({
          ...addresses.billing,
          client_id: client.id,
          type: 'billing',
          created_at: new Date().toISOString(),
        });
      }

      if (addressesData.length > 0) {
        const { error: addressesError } = await supabase
          .from(TABLES.ADDRESSES)
          .insert(addressesData);

        if (addressesError) {
          throw new Error(`Failed to create addresses: ${addressesError.message}`);
        }
      }
    }

    // Insert tags
    if (tags && tags.length > 0) {
      const tagsData = tags.map(tag => ({
        ...tag,
        client_id: client.id,
        created_at: new Date().toISOString(),
      }));

      const { error: tagsError } = await supabase
        .from(TABLES.CLIENT_TAGS)
        .insert(tagsData);

      if (tagsError) {
        throw new Error(`Failed to create tags: ${tagsError.message}`);
      }
    }

    // Return full client data
    return this.getClient(client.id);
  }

  // Update existing client
  async updateClient(id: string, clientData: UpdateClientRequest): Promise<Client> {
    const { contacts, addresses, tags, ...clientInfo } = clientData;

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
          throw new Error(`Failed to update contacts: ${contactsError.message}`);
        }
      }
    }

    // Update addresses if provided
    if (addresses) {
      // Delete existing addresses
      await supabase
        .from(TABLES.ADDRESSES)
        .delete()
        .eq('client_id', id);

      // Insert new addresses
      const addressesData = [];
      if (addresses.physical) {
        addressesData.push({
          ...addresses.physical,
          client_id: id,
          type: 'physical',
          created_at: new Date().toISOString(),
        });
      }
      if (addresses.billing) {
        addressesData.push({
          ...addresses.billing,
          client_id: id,
          type: 'billing',
          created_at: new Date().toISOString(),
        });
      }

      if (addressesData.length > 0) {
        const { error: addressesError } = await supabase
          .from(TABLES.ADDRESSES)
          .insert(addressesData);

        if (addressesError) {
          throw new Error(`Failed to update addresses: ${addressesError.message}`);
        }
      }
    }

    // Update tags if provided
    if (tags) {
      // Delete existing tags
      await supabase
        .from(TABLES.CLIENT_TAGS)
        .delete()
        .eq('client_id', id);

      // Insert new tags
      if (tags.length > 0) {
        const tagsData = tags.map(tag => ({
          ...tag,
          client_id: id,
          created_at: new Date().toISOString(),
        }));

        const { error: tagsError } = await supabase
          .from(TABLES.CLIENT_TAGS)
          .insert(tagsData);

        if (tagsError) {
          throw new Error(`Failed to update tags: ${tagsError.message}`);
        }
      }
    }

    // Return updated client
    return this.getClient(id);
  }

  // Delete client
  async deleteClient(id: string): Promise<void> {
    // Delete related data first
    await supabase.from(TABLES.CONTACTS).delete().eq('client_id', id);
    await supabase.from(TABLES.ADDRESSES).delete().eq('client_id', id);
    await supabase.from(TABLES.CLIENT_TAGS).delete().eq('client_id', id);
    await supabase.from(TABLES.CLIENT_DOCUMENTS).delete().eq('client_id', id);

    // Delete client
    const { error } = await supabase
      .from(TABLES.CLIENTS)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete client: ${error.message}`);
    }
  }

  // Get client projects
  async getClientProjects(clientId: string): Promise<Client['projects']> {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .select('id, title, stage, priority, due_date, created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch client projects: ${error.message}`);
    }

    return data || [];
  }

  // Get client documents
  async getClientDocuments(clientId: string): Promise<Client['documents']> {
    const { data, error } = await supabase
      .from(TABLES.CLIENT_DOCUMENTS)
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch client documents: ${error.message}`);
    }

    return data || [];
  }

  // Upload client document
  async uploadClientDocument(
    clientId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Client['documents'][0]> {
    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${clientId}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('client-documents')
      .upload(fileName, file, {
        onUploadProgress: (progress) => {
          if (onProgress) {
            onProgress(progress.loaded / progress.total * 100);
          }
        },
      });

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('client-documents')
      .getPublicUrl(fileName);

    // Save document record
    const documentData = {
      client_id: clientId,
      name: file.name,
      original_name: file.name,
      type: fileExt || 'unknown',
      category: 'other',
      size: file.size,
      url: urlData.publicUrl,
      uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      created_at: new Date().toISOString(),
    };

    const { data: document, error: documentError } = await supabase
      .from(TABLES.CLIENT_DOCUMENTS)
      .insert(documentData)
      .select()
      .single();

    if (documentError) {
      throw new Error(`Failed to save document record: ${documentError.message}`);
    }

    return document;
  }

  // Delete client document
  async deleteClientDocument(clientId: string, documentId: string): Promise<void> {
    // Get document info first
    const { data: document, error: fetchError } = await supabase
      .from(TABLES.CLIENT_DOCUMENTS)
      .select('url')
      .eq('id', documentId)
      .eq('client_id', clientId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch document: ${fetchError.message}`);
    }

    // Delete from storage
    const fileName = document.url.split('/').pop();
    if (fileName) {
      await supabase.storage
        .from('client-documents')
        .remove([`${clientId}/${fileName}`]);
    }

    // Delete document record
    const { error } = await supabase
      .from(TABLES.CLIENT_DOCUMENTS)
      .delete()
      .eq('id', documentId)
      .eq('client_id', clientId);

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }
}

// Export singleton instance
export const supabaseClientService = new SupabaseClientService();
