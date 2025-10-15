import { 
  Bluetooth, 
  BluetoothOff, 
  Map, 
  Cpu, 
  MessageCircle, 
  Info,
  Search,
  Power,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { useState } from 'react';

interface SettingsProps {
  isBluetoothConnected: boolean;
  onToggleBluetooth: (connected: boolean) => void;
  isDarkMap: boolean;
  onToggleDarkMap: (dark: boolean) => void;
}

export function Settings({ isBluetoothConnected, onToggleBluetooth, isDarkMap, onToggleDarkMap }: SettingsProps) {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchDevices = () => {
    setIsSearching(true);
    toast.loading('Ricerca dispositivi...', { id: 'search' });
    
    setTimeout(() => {
      setIsSearching(false);
      toast.success('Dispositivo Arduino trovato', { id: 'search' });
    }, 2000);
  };

  const handleToggleBluetooth = () => {
    const newState = !isBluetoothConnected;
    onToggleBluetooth(newState);
    
    if (newState) {
      toast.success('Bluetooth connesso');
    } else {
      toast.info('Bluetooth disconnesso');
    }
  };

  return (
    <div className="h-full flex flex-col pb-20 bg-white overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-100">
        <h1 className="text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Impostazioni
        </h1>
        <p className="text-gray-500 mt-1" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
          Configura la tua esperienza
        </p>
      </div>

      <div className="px-6 py-4 space-y-6">
        {/* Bluetooth Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-black mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px' }}>
            Connessione Bluetooth
          </h2>
          
          <div className="space-y-3">
            {/* Connection status card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-5 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isBluetoothConnected ? 'bg-[#E85A2A]' : 'bg-gray-300'
                  }`}>
                    {isBluetoothConnected ? (
                      <Bluetooth size={24} className="text-white" />
                    ) : (
                      <BluetoothOff size={24} className="text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Stato
                    </p>
                    <p className={`text-sm ${isBluetoothConnected ? 'text-[#E85A2A]' : 'text-gray-500'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                      {isBluetoothConnected ? 'Connesso' : 'Non connesso'}
                    </p>
                  </div>
                </div>
                
                <Switch 
                  checked={isBluetoothConnected} 
                  onCheckedChange={handleToggleBluetooth}
                  className="data-[state=checked]:bg-[#E85A2A]"
                />
              </div>

              {isBluetoothConnected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-4 border-t border-gray-300"
                >
                  <p className="text-xs text-gray-500 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Dispositivo connesso
                  </p>
                  <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-gray-600" />
                    <p className="text-sm text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Arduino Nano 33 BLE
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleSearchDevices}
                disabled={isSearching}
                variant="outline"
                className="h-12 rounded-2xl border-2 border-gray-200 hover:border-[#E85A2A] hover:bg-[#E85A2A]/5"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Search size={18} className="mr-2" />
                {isSearching ? 'Ricerca...' : 'Cerca'}
              </Button>
              
              <Button
                onClick={handleToggleBluetooth}
                variant="outline"
                className={`h-12 rounded-2xl border-2 ${
                  isBluetoothConnected 
                    ? 'border-red-300 hover:bg-red-50 text-red-600' 
                    : 'border-[#E85A2A] hover:bg-[#E85A2A]/5 text-[#E85A2A]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Power size={18} className="mr-2" />
                {isBluetoothConnected ? 'Disconnetti' : 'Connetti'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Map Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-black mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px' }}>
            Preferenze Mappa
          </h2>
          
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Map size={24} className="text-gray-700" />
                </div>
                <div>
                  <p className="text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Tema Scuro
                  </p>
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Mappa in modalità notturna
                  </p>
                </div>
              </div>
              
              <Switch 
                checked={isDarkMap} 
                onCheckedChange={onToggleDarkMap}
                className="data-[state=checked]:bg-[#E85A2A]"
              />
            </div>
          </div>
        </motion.div>

        {/* Device Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-black mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px' }}>
            Info Dispositivo
          </h2>
          
          <div className="bg-gradient-to-br from-[#E85A2A]/5 to-[#E85A2A]/10 border-2 border-[#E85A2A]/20 rounded-3xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-[#E85A2A] rounded-2xl flex items-center justify-center flex-shrink-0">
                <Cpu size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-black mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Arduino Nano 33 BLE
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Firmware
                    </span>
                    <span className="text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
                      v2.1.4
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Batteria casco
                    </span>
                    <span className="text-[#E85A2A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      87%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Display
                    </span>
                    <span className="text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
                      OLED 128x64
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feedback Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-black mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px' }}>
            Supporto e Info
          </h2>
          
          <div className="space-y-3">
            <button className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center justify-between hover:border-[#E85A2A]/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <MessageCircle size={20} className="text-gray-700" />
                </div>
                <span className="text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Invia Feedback
                </span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center justify-between hover:border-[#E85A2A]/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Info size={20} className="text-gray-700" />
                </div>
                <div className="text-left">
                  <p className="text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Info App
                  </p>
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Versione 1.0.0
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
