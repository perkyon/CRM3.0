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
import LoginModal from './landing/LoginModal';
import RegisterModal from './landing/RegisterModal';

export function Landing() {
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = () => {
    setIsLoginOpen(true);
  };

  const handleRegister = () => {
    setIsRegisterOpen(true);
  };

  const handleLoginSubmit = () => {
    setIsLoginOpen(false);
    navigate('/login');
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

      {!isLoading && (
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
          
          <LoginModal 
            isOpen={isLoginOpen} 
            onClose={() => setIsLoginOpen(false)}
            onRegister={() => {
              setIsLoginOpen(false);
              setIsRegisterOpen(true);
            }}
            onSubmit={handleLoginSubmit}
          />
          
          <RegisterModal 
            isOpen={isRegisterOpen} 
            onClose={() => setIsRegisterOpen(false)}
            onLogin={() => {
              setIsRegisterOpen(false);
              setIsLoginOpen(true);
            }}
            onSubmit={handleRegisterSubmit}
          />
        </motion.div>
      )}
    </>
  );
}
