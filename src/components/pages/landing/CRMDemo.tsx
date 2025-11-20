import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../lib/stores/authStore';
import { toast } from '../../../lib/toast';

export default function CRMDemo() {
  const navigate = useNavigate();
  const authStore = useAuthStore();

  const handleDemoLogin = async () => {
    try {
      // Вход в демо-аккаунт через authStore
      await authStore.login({
        email: 'demo@burocrm.ru',
        password: 'demo123456',
      });

      // Редирект в систему
      navigate('/app/dashboard', { replace: true });
      toast.success('Добро пожаловать в демо-версию!');
    } catch (error: any) {
      console.error('Demo login error:', error);
      toast.error(error?.message || 'Ошибка входа в демо-версию');
    }
  };

  return (
    <section className="py-24 md:py-32 bg-black text-white border-t border-gray-800">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl mb-8">Демо-версия</h2>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl">
            Попробуйте систему бесплатно с предзаполненными данными. Все функции доступны для ознакомления.
          </p>
          <p className="text-sm text-gray-500 mb-16 max-w-3xl">
            Демо-аккаунт: demo@burocrm.ru / demo123456
          </p>

          <button
            onClick={handleDemoLogin}
            className="inline-block px-8 py-4 border-2 border-white text-lg hover:bg-white hover:text-black transition-colors duration-300"
          >
            Открыть демо
          </button>
        </motion.div>
      </div>
    </section>
  );
}
