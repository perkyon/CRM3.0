import { supabase, TABLES } from './config';
import { RealtimeChannel } from '@supabase/supabase-js';

export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  // Subscribe to clients changes
  subscribeToClients(
    onInsert: (payload: any) => void,
    onUpdate: (payload: any) => void,
    onDelete: (payload: any) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.CLIENTS,
        },
        onInsert
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: TABLES.CLIENTS,
        },
        onUpdate
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: TABLES.CLIENTS,
        },
        onDelete
      )
      .subscribe();

    this.channels.set('clients', channel);
    return channel;
  }

  // Subscribe to projects changes
  subscribeToProjects(
    onInsert: (payload: any) => void,
    onUpdate: (payload: any) => void,
    onDelete: (payload: any) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.PROJECTS,
        },
        onInsert
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: TABLES.PROJECTS,
        },
        onUpdate
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: TABLES.PROJECTS,
        },
        onDelete
      )
      .subscribe();

    this.channels.set('projects', channel);
    return channel;
  }

  // Subscribe to kanban tasks changes
  subscribeToKanbanTasks(
    boardId: string,
    onInsert: (payload: any) => void,
    onUpdate: (payload: any) => void,
    onDelete: (payload: any) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`kanban-tasks-${boardId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.KANBAN_TASKS,
          filter: `board_id=eq.${boardId}`,
        },
        onInsert
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: TABLES.KANBAN_TASKS,
          filter: `board_id=eq.${boardId}`,
        },
        onUpdate
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: TABLES.KANBAN_TASKS,
          filter: `board_id=eq.${boardId}`,
        },
        onDelete
      )
      .subscribe();

    this.channels.set(`kanban-tasks-${boardId}`, channel);
    return channel;
  }

  // Subscribe to task comments
  subscribeToTaskComments(
    taskId: string,
    onInsert: (payload: any) => void,
    onUpdate: (payload: any) => void,
    onDelete: (payload: any) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`task-comments-${taskId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.TASK_COMMENTS,
          filter: `task_id=eq.${taskId}`,
        },
        onInsert
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: TABLES.TASK_COMMENTS,
          filter: `task_id=eq.${taskId}`,
        },
        onUpdate
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: TABLES.TASK_COMMENTS,
          filter: `task_id=eq.${taskId}`,
        },
        onDelete
      )
      .subscribe();

    this.channels.set(`task-comments-${taskId}`, channel);
    return channel;
  }

  // Subscribe to activities (for dashboard)
  subscribeToActivities(
    onInsert: (payload: any) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.ACTIVITIES,
        },
        onInsert
      )
      .subscribe();

    this.channels.set('activities', channel);
    return channel;
  }

  // Subscribe to specific client changes
  subscribeToClient(
    clientId: string,
    onUpdate: (payload: any) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`client-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: TABLES.CLIENTS,
          filter: `id=eq.${clientId}`,
        },
        onUpdate
      )
      .subscribe();

    this.channels.set(`client-${clientId}`, channel);
    return channel;
  }

  // Subscribe to specific project changes
  subscribeToProject(
    projectId: string,
    onUpdate: (payload: any) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: TABLES.PROJECTS,
          filter: `id=eq.${projectId}`,
        },
        onUpdate
      )
      .subscribe();

    this.channels.set(`project-${projectId}`, channel);
    return channel;
  }

  // Unsubscribe from a specific channel
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  // Get channel status
  getChannelStatus(channelName: string): string | null {
    const channel = this.channels.get(channelName);
    return channel ? channel.state : null;
  }

  // Get all active channels
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
