import { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';
import { Organization } from '../../types';
import { organizationService } from '../supabase/services/OrganizationService';

interface CurrentOrganizationState {
  currentOrganization: Organization | null;
  isLoading: boolean;
  error: string | null;
  isTrial: boolean;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  trialDaysLeft: number;
  trialEndsAt: string | null;
}

export function useCurrentOrganization(): CurrentOrganizationState {
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
        
        // Устанавливаем organizationId в localStorage для использования в сервисах
        if (selectedOrg?.id) {
          localStorage.setItem('currentOrganizationId', selectedOrg.id);
        }
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

  const isTrial = currentOrganization?.plan === 'trial';
  const trialEndsAtDate = currentOrganization?.trialEndsAt ? new Date(currentOrganization.trialEndsAt) : null;
  const now = new Date();
  const trialDaysLeft = isTrial && trialEndsAtDate
    ? Math.max(0, Math.ceil((trialEndsAtDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const isTrialExpired = Boolean(isTrial && trialEndsAtDate && now > trialEndsAtDate);
  const isTrialActive = Boolean(isTrial && !isTrialExpired && currentOrganization?.trialActive);

  return {
    currentOrganization,
    isLoading,
    error,
    isTrial: Boolean(isTrial),
    isTrialActive,
    isTrialExpired,
    trialDaysLeft,
    trialEndsAt: trialEndsAtDate ? trialEndsAtDate.toISOString() : null,
  };
}

