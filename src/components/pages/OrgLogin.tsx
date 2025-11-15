import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Building2, Loader2, AlertCircle } from 'lucide-react';
import { organizationService } from '../../lib/supabase/services/OrganizationService';
import { supabase } from '../../lib/supabase/config';

export function OrgLogin() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [isCheckingOrg, setIsCheckingOrg] = useState(true);

  // Проверяем существование организации
  useEffect(() => {
    const checkOrganization = async () => {
      if (!slug) {
        setError('Slug организации не указан');
        setIsCheckingOrg(false);
        return;
      }

      try {
        const org = await organizationService.getOrganizationBySlug(slug);
        if (org) {
          setOrgName(org.name);
        } else {
          setError('Организация не найдена');
        }
      } catch (err: any) {
        setError(err.message || 'Ошибка при проверке организации');
      } finally {
        setIsCheckingOrg(false);
      }
    };

    checkOrganization();
  }, [slug]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    setIsLoading(true);

    try {
      // Вход в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Ошибка входа');
      }

      // Проверяем, что пользователь состоит в этой организации
      const { data: members, error: memberError } = await supabase
        .from('organization_members')
        .select('*, organizations!inner(*)')
        .eq('user_id', authData.user.id)
        .eq('organizations.slug', slug)
        .eq('active', true)
        .single();

      if (memberError || !members) {
        throw new Error('У вас нет доступа к этой организации');
      }

      // Устанавливаем текущую организацию в localStorage
      localStorage.setItem('currentOrganizationId', members.organization_id);

      // Редирект в систему
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Проверка организации...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !orgName) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl">Организация не найдена</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/')} className="w-full">
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Вход в компанию</CardTitle>
          <CardDescription>
            {orgName ? (
              <>
                <strong>{orgName}</strong>
                <br />
                <span className="text-xs text-muted-foreground">burodigital.ru/{slug}</span>
              </>
            ) : (
              `burodigital.ru/${slug}`
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ivan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="mt-1"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Вход...
                </>
              ) : (
                'Войти'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Button
              variant="link"
              onClick={() => navigate('/')}
              className="text-muted-foreground"
            >
              Вернуться на главную
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

