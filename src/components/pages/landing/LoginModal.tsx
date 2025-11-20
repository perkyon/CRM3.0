import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../ui/dialog';
import { X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
  onSubmit?: () => void;
}

export default function LoginModal({ isOpen, onClose, onRegister, onSubmit }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    } else {
      console.log('Login:', { email, password });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 border-0">
        <DialogTitle className="sr-only">Вход в систему</DialogTitle>
        <DialogDescription className="sr-only">
          Введите ваш email и пароль для входа в систему Buro CRM
        </DialogDescription>
        <div className="relative bg-white p-12 md:p-16">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 hover:opacity-60 transition-opacity"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-4xl md:text-5xl mb-12" aria-hidden="true" style={{ color: '#151515' }}>Вход</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm mb-2 tracking-widest" style={{ color: '#151515' }}>EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-gray-300 py-3 text-xl focus:border-black outline-none transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 tracking-widest" style={{ color: '#151515' }}>ПАРОЛЬ</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-gray-300 py-3 text-xl focus:border-black outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>Запомнить меня</span>
              </label>
              <a href="#" className="hover:opacity-60 transition-opacity">
                Забыли пароль?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-4 border-2 border-black text-lg hover:bg-black hover:text-white transition-colors duration-300"
            >
              Войти
            </button>

            <div className="text-center" style={{ color: '#151515' }}>
              Нет аккаунта?{' '}
              <button
                type="button"
                onClick={onRegister}
                className="hover:opacity-60 transition-opacity underline"
              >
                Зарегистрироваться
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

