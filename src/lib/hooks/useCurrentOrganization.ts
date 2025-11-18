import { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';
import { Organization } from '../../types';
import { organizationService } from '../supabase/services/OrganizationService';

export function useCurrentOrganization() {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentOrganization = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Получаем текущего пользователя
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCurrentOrganization(null);
          setIsLoading(false);
          return;
        }

        // Получаем организации пользователя
        const organizations = await organizationService.getUserOrganizations(user.id);
        
        if (organizations.length === 0) {
          setCurrentOrganization(null);
          setIsLoading(false);
          return;
        }

        // Используем default_organization_id или первую организацию
        const { data: userProfile } = await supabase
          .from('users')
          .select('default_organization_id')
          .eq('id', user.id)
          .single();

        let selectedOrg: Organization | null = null;

        if (userProfile?.default_organization_id) {
          selectedOrg = organizations.find(org => org.id === userProfile.default_organization_id) || null;
        }

        if (!selectedOrg) {
          selectedOrg = organizations[0];
        }

        setCurrentOrganization(selectedOrg);
      } catch (err: any) {
        console.error('Error fetching current organization:', err);
        setError(err.message || 'Ошибка загрузки организации');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentOrganization();

    // Подписываемся на изменения сессии
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCurrentOrganization();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { currentOrganization, isLoading, error };
}

