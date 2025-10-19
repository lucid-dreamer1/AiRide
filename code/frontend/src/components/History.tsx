import { Trash2, Navigation, Calendar, Clock, ArrowRight, Bluetooth, BluetoothOff } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import type { Route } from "../App";

interface HistoryProps {
  routes: Route[];
  onDeleteRoute: (index: number) => void;
  onReviewRoute: (route: Route) => void;
  isBluetoothConnected: boolean;
}

export function History({ routes, onDeleteRoute, onReviewRoute, isBluetoothConnected }: HistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Oggi";
    if (date.toDateString() === yesterday.toDateString()) return "Ieri";
    return date.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
  };

  return (
    <div className="h-full flex flex-col pb-20 bg-white">
      {/* Header con branding e stato Bluetooth */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <h1 style={{ fontFamily: "Poppins, sans-serif" }}>
          Ai<span className="text-[#E85A2A]">Ride</span>
        </h1>
        <div className="flex items-center gap-2">
          {isBluetoothConnected ? (
            <>
              <Bluetooth size={20} className="text-[#E85A2A]" />
              <span
                className="text-sm text-gray-600"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Connesso
              </span>
            </>
          ) : (
            <>
              <BluetoothOff size={20} className="text-gray-400" />
              <span
                className="text-sm text-gray-400"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Non connesso
              </span>
            </>
          )}
        </div>
      </div>

      {/* Titolo sezione */}
      <div className="px-6 mt-4">
        <h2 className="text-lg font-semibold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
          Cronologia percorsi
        </h2>
        <p className="text-gray-500 mt-1 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
          Visualizza e gestisci i tuoi ultimi itinerari
        </p>
      </div>

      {/* Lista percorsi */}
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
            <p className="text-gray-400" style={{ fontFamily: "Inter, sans-serif" }}>
              Nessun percorso registrato
            </p>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {routes.map((route, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border-2 border-gray-100 rounded-3xl p-5 hover:border-[#E85A2A]/40 transition-all"
                style={{
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.05)",
                }}
              >
                {/* Data */}
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={14} className="text-gray-400" />
                  <span
                    className="text-gray-500 text-sm"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {formatDate(route.date)}
                  </span>
                </div>

                {/* Destinazione */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#E85A2A]/10 rounded-full flex items-center justify-center mt-1">
                    <Navigation size={16} className="text-[#E85A2A]" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
                      Destinazione
                    </p>
                    <p className="text-black text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                      {route.to}
                    </p>
                  </div>
                </div>

                {/* Info percorso */}
                <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span
                      className="text-sm text-gray-700"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {route.duration}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <ArrowRight size={14} className="text-gray-400" />
                    <span
                      className="text-sm text-gray-700"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {route.distance}
                    </span>
                  </div>
                </div>

                {/* Azioni */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => onReviewRoute(route)}
                    className="flex-1 h-11 bg-[#E85A2A] hover:bg-[#d14f23] text-white rounded-2xl"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Rivisualizza percorso
                  </Button>
                  <Button
                    onClick={() => onDeleteRoute(index)}
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 border-2 border-gray-200 rounded-2xl hover:border-red-500 hover:bg-red-50 hover:text-red-500 transition-colors"
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
