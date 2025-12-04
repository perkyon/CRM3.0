import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Preloader from './landing/Preloader';
import Hero from './landing/Hero';
import Services from './landing/Services';
import Technologies from './landing/Technologies';
import CRMDemo from './landing/CRMDemo';
import Pricing from './landing/Pricing';
import Contact from './landing/Contact';
import RegisterModal from './landing/RegisterModal';

export function Landing() {
  const navigate = useNavigate();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Отключен preloader для отладки

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    setIsRegisterOpen(true);
  };

  const handleRegisterSubmit = () => {
    setIsRegisterOpen(false);
    navigate('/pricing');
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-white"
      >
        <Hero 
          onLogin={handleLogin}
          onRegister={handleRegister}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
        <Services />
        <Technologies />
        <CRMDemo />
        <Pricing onSelectPlan={handleRegister} />
        <Contact />
        
        <RegisterModal 
          isOpen={isRegisterOpen} 
          onClose={() => setIsRegisterOpen(false)}
          onLogin={() => {
            setIsRegisterOpen(false);
            navigate('/login');
          }}
          onSubmit={handleRegisterSubmit}
        />
      </motion.div>
    </>
  );
}
