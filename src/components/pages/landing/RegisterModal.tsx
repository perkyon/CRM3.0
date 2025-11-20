import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../ui/dialog';
import { X, Loader2 } from 'lucide-react';
import { organizationService } from '../../../lib/supabase/services/OrganizationService';
import { toast } from '../../../lib/toast';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSubmit?: () => void;
}

export default function RegisterModal({ isOpen, onClose, onLogin, onSubmit }: RegisterModalProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
  });

  // Генерация slug из названия компании
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      // Если есть кастомный обработчик, используем его
      onSubmit();
      return;
    }

    // Валидация
    if (!formData.name.trim()) {
      toast.error('Укажите ваше имя');
      return;
    }
    if (!formData.company.trim()) {
      toast.error('Укажите название компании');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Укажите корректный email');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Пароль должен содержать минимум 8 символов');
      return;
    }

    setIsLoading(true);
    try {
      const orgSlug = generateSlug(formData.company);
      
      // Создаем организацию с пользователем (free план по умолчанию)
      await organizationService.createOrganizationWithUser({
        organization: {
          name: formData.company,
          slug: orgSlug,
        },
        user: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        subscriptionPlan: 'free',
      });

      toast.success('Организация создана! Выполняется вход...');
      
      // Перенаправляем на onboarding для завершения настройки
      navigate('/onboarding', {
        state: {
          orgName: formData.company,
          orgSlug: orgSlug,
          userName: formData.name,
          userEmail: formData.email,
        }
      });
      
      onClose();
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error?.message || 'Ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 border-0 max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Регистрация в системе</DialogTitle>
        <DialogDescription className="sr-only">
          Создайте аккаунт в Buro CRM и получите 3 месяца бесплатно
        </DialogDescription>
        <div className="relative bg-white p-12 md:p-16">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 hover:opacity-60 transition-opacity"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-4xl md:text-5xl mb-4" aria-hidden="true" style={{ color: '#151515' }}>Регистрация</h2>
          <p className="mb-12" aria-hidden="true" style={{ color: '#151515' }}>
            Создайте аккаунт и получите 3 месяца бесплатно
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm mb-2 tracking-widest" style={{ color: '#151515' }}>ИМЯ</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-b border-gray-300 py-3 text-xl focus:border-black outline-none transition-colors"
                placeholder="Иван Иванов"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 tracking-widest" style={{ color: '#151515' }}>КОМПАНИЯ</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full border-b border-gray-300 py-3 text-xl focus:border-black outline-none transition-colors"
                placeholder="ООО Мебель"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 tracking-widest" style={{ color: '#151515' }}>EMAIL</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border-b border-gray-300 py-3 text-xl focus:border-black outline-none transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 tracking-widest" style={{ color: '#151515' }}>ПАРОЛЬ</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border-b border-gray-300 py-3 text-xl focus:border-black outline-none transition-colors"
                placeholder="••••••••"
                required
              />
              <p className="text-sm mt-2" style={{ color: '#151515' }}>Минимум 8 символов</p>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="mt-1 w-4 h-4" required />
              <label htmlFor="terms" className="text-sm" style={{ color: '#151515' }}>
                Я согласен с условиями использования и политикой конфиденциальности
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 border-2 border-black text-lg hover:bg-black hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Создание...
                </>
              ) : (
                'Создать аккаунт'
              )}
            </button>

            <div className="text-center" style={{ color: '#151515' }}>
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={onLogin}
                className="hover:opacity-60 transition-opacity underline"
              >
                Войти
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

