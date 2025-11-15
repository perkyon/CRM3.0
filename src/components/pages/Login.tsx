import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginPage } from '../auth/LoginPage';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../lib/toast';

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Если уже авторизован, перенаправляем в приложение
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      toast.success('Вход выполнен успешно');
      navigate('/app/dashboard', { replace: true });
    } catch (error: any) {
      throw error; // Пробрасываем ошибку, чтобы LoginPage мог её обработать
    }
  };

  return <LoginPage onLogin={handleLogin} />;
}

