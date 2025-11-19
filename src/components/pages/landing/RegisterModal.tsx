import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../ui/dialog';
import { X } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSubmit?: () => void;
}

export default function RegisterModal({ isOpen, onClose, onLogin, onSubmit }: RegisterModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    } else {
      console.log('Register:', formData);
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

          <h2 className="text-4xl md:text-5xl mb-4" aria-hidden="true">Регистрация</h2>
          <p className="text-gray-600 mb-12" aria-hidden="true">
            Создайте аккаунт и получите 3 месяца бесплатно
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm text-gray-500 mb-2 tracking-widest">ИМЯ</label>
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
              <label className="block text-sm text-gray-500 mb-2 tracking-widest">КОМПАНИЯ</label>
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
              <label className="block text-sm text-gray-500 mb-2 tracking-widest">EMAIL</label>
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
              <label className="block text-sm text-gray-500 mb-2 tracking-widest">ПАРОЛЬ</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border-b border-gray-300 py-3 text-xl focus:border-black outline-none transition-colors"
                placeholder="••••••••"
                required
              />
              <p className="text-sm text-gray-500 mt-2">Минимум 8 символов</p>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="mt-1 w-4 h-4" required />
              <label htmlFor="terms" className="text-sm text-gray-600">
                Я согласен с условиями использования и политикой конфиденциальности
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-4 border-2 border-black text-lg hover:bg-black hover:text-white transition-colors duration-300"
            >
              Создать аккаунт
            </button>

            <div className="text-center text-gray-600">
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

