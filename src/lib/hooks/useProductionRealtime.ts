import { useEffect } from 'react';
import { supabase } from '../supabase/config';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseProductionRealtimeProps {
  projectId: string | undefined;
  onUpdate: () => void;
}

/**
 * Hook for subscribing to real-time updates for production data
 * Listens to changes in zones, items, components, and stages
 */
export function useProductionRealtime({ projectId, onUpdate }: UseProductionRealtimeProps) {
  useEffect(() => {
    if (!projectId) return;

    const channels: RealtimeChannel[] = [];

    // Subscribe to production zones changes
    const zonesChannel = supabase
      .channel(`production_zones:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'production_zones',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('🔄 Real-time: production_zones changed', payload);
          onUpdate();
        }
      )
      .subscribe();

    channels.push(zonesChannel);

    // Subscribe to production items changes
    const itemsChannel = supabase
      .channel(`production_items:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'production_items',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('🔄 Real-time: production_items changed', payload);
          onUpdate();
        }
      )
      .subscribe();

    channels.push(itemsChannel);

    // Subscribe to production components changes
    const componentsChannel = supabase
      .channel(`production_components:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'production_components',
        },
        (payload) => {
          console.log('🔄 Real-time: production_components changed', payload);
          onUpdate();
        }
      )
      .subscribe();

    channels.push(componentsChannel);

    // Subscribe to production stages changes
    const stagesChannel = supabase
      .channel(`production_stages:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'production_stages',
        },
        (payload) => {
          console.log('🔄 Real-time: production_stages changed', payload);
          onUpdate();
        }
      )
      .subscribe();

    channels.push(stagesChannel);

    // Subscribe to production materials changes
    const materialsChannel = supabase
      .channel(`production_materials:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'production_component_materials',
        },
        (payload) => {
          console.log('🔄 Real-time: production_materials changed', payload);
          onUpdate();
        }
      )
      .subscribe();

    channels.push(materialsChannel);

    console.log('✅ Real-time subscriptions active for project:', projectId);

    // Cleanup: unsubscribe from all channels
    return () => {
      console.log('🔌 Unsubscribing from real-time channels');
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [projectId, onUpdate]);
}

