import { Trash2, MapPin, Navigation, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import type { Route } from '../App';

interface HistoryProps {
  routes: Route[];
  onDeleteRoute: (index: number) => void;
  onReviewRoute: (route: Route) => void;
}

export function History({ routes, onDeleteRoute, onReviewRoute }: HistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Oggi';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ieri';
    } else {
      return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
    }
  };

  return (
    <div className="h-full flex flex-col pb-20 bg-white">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-100">
        <h1 className="text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Cronologia
        </h1>
        <p className="text-gray-500 mt-1" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
          I tuoi ultimi percorsi
        </p>
      </div>

      {/* Routes list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {routes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center px-8"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Clock size={40} className="text-gray-400" />
            </div>
            <p className="text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              Nessun percorso nella cronologia
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {routes.map((route, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border-2 border-gray-100 rounded-3xl p-5 hover:border-[#E85A2A]/30 transition-all"
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
                }}
              >
                {/* Date */}
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-gray-500 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {formatDate(route.date)}
                  </span>
                </div>

                {/* Route details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#E85A2A]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <MapPin size={16} className="text-[#E85A2A]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-500 text-xs mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Partenza
                      </p>
                      <p className="text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {route.from}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Navigation size={16} className="text-black" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-500 text-xs mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Destinazione
                      </p>
                      <p className="text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {route.to}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {route.duration}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <ArrowRight size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {route.distance}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => onReviewRoute(route)}
                    className="flex-1 h-11 bg-[#E85A2A] hover:bg-[#d14f23] text-white rounded-xl"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Rivisualizza percorso
                  </Button>
                  <Button
                    onClick={() => onDeleteRoute(index)}
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
