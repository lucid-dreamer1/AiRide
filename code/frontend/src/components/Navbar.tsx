import { Home, Clock, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import type { Screen } from '../App';

interface NavbarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function Navbar({ currentScreen, onNavigate }: NavbarProps) {
  const navItems = [
    { id: 'home' as Screen, icon: Home, label: 'Home' },
    { id: 'history' as Screen, icon: Clock, label: 'Cronologia' },
    { id: 'settings' as Screen, icon: Settings, label: 'Impostazioni' },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 safe-area-bottom"
      style={{ 
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
        zIndex: 1000
      }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center gap-1 py-2 px-4 relative transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#E85A2A]/10 rounded-2xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <Icon 
                size={24} 
                className={`relative z-10 transition-colors ${
                  isActive ? 'text-[#E85A2A]' : 'text-black'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              
              <span 
                className={`relative z-10 transition-colors ${
                  isActive ? 'text-[#E85A2A]' : 'text-black'
                }`}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
