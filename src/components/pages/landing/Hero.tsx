import { X } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onLogin: () => void;
  onRegister: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export default function Hero({ onLogin, onRegister, isMenuOpen, setIsMenuOpen }: HeroProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-100"
      >
        <div className="container mx-auto px-6 md:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm tracking-widest" style={{ color: '#151515' }}>BURO CRM</div>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-sm tracking-wide hover:opacity-60 transition-opacity"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : 'Меню'}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Full Screen Menu */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white z-40 flex items-center justify-center"
        >
          <div className="text-center space-y-8">
            {['Возможности', 'Преимущества', 'Тарифы', 'Контакты'].map((item, index) => (
              <motion.button
                key={item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => scrollToSection(item === 'Возможности' ? 'services' : item === 'Преимущества' ? 'technologies' : item === 'Тарифы' ? 'pricing' : 'contact')}
                className="block text-4xl md:text-5xl hover:opacity-60 transition-opacity"
                style={{ color: '#151515' }}
              >
                {item}
              </motion.button>
            ))}
            <div className="pt-12 space-y-4">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogin();
                }}
                className="block text-2xl hover:opacity-60 transition-opacity"
                style={{ color: '#151515' }}
              >
                Войти
              </motion.button>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => {
                  setIsMenuOpen(false);
                  onRegister();
                }}
                className="block text-2xl hover:opacity-60 transition-opacity"
                style={{ color: '#151515' }}
              >
                Регистрация
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hero Content */}
      <div className="container mx-auto px-6 md:px-12 pt-32 md:pt-48 pb-24 md:pb-32">
        <div className="max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-9xl leading-none mb-12"
            style={{ color: '#151515' }}
          >
            CRM система для мебельного производства
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl mb-16 max-w-2xl leading-relaxed"
            style={{ color: '#151515' }}
          >
            Управляйте клиентами, заказами и производством в одной системе. Увеличьте продажи на 40% и сократите время на рутину в 3 раза.
          </motion.p>

          <motion.button 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            onClick={onRegister}
            className="px-8 py-4 border-2 border-black text-lg hover:bg-black hover:text-white transition-colors duration-300"
          >
            Попробовать бесплатно
          </motion.button>
        </div>
      </div>
    </div>
  );
}
