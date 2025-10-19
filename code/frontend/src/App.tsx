import { useState, useEffect } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { Home } from "./components/Home";
import { History } from "./components/History";
import { Settings } from "./components/Settings";
import { Navbar } from "./components/Navbar";
import { Toaster } from "./components/ui/sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  NavigationProvider,
  useNavigation,
} from "./components/NavigationContext";

export type Screen = "splash" | "home" | "history" | "settings";

export interface Route {
  from: string;
  to: string;
  duration: string;
  distance: string;
  date: string;
}

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(true);
  const [routes, setRoutes] = useState<Route[]>([
    {
      from: "Via Roma 123, Milano",
      to: "Piazza Duomo, Milano",
      duration: "32 min",
      distance: "18.5 km",
      date: "2025-10-09",
    },
    {
      from: "Corso Buenos Aires, Milano",
      to: "Navigli District, Milano",
      duration: "25 min",
      distance: "12.3 km",
      date: "2025-10-08",
    },
    {
      from: "Milano Centrale",
      to: "Aeroporto Malpensa",
      duration: "48 min",
      distance: "45.2 km",
      date: "2025-10-07",
    },
  ]);
  const [isDarkMap, setIsDarkMap] = useState(false);

  // Per impostare la route selezionata quando si torna da History
  const { setSelectedRoute } = useNavigation();

  useEffect(() => {
    if (currentScreen === "splash") {
      const timer = setTimeout(() => {
        setCurrentScreen("home");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const handleSendToHelmet = (route: Route) => {
    if (
      !routes.find(
        (r) =>
          r.from === route.from && r.to === route.to && r.date === route.date
      )
    ) {
      setRoutes([route, ...routes]);
    }
  };

  const handleDeleteRoute = (index: number) => {
    setRoutes(routes.filter((_, i) => i !== index));
  };

  const handleReviewRoute = (route: Route) => {
    setSelectedRoute(route); // aggiorna il context
    setCurrentScreen("home");
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden">
      <Toaster />

      <AnimatePresence mode="wait">
        {currentScreen === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SplashScreen />
          </motion.div>
        )}

        {currentScreen === "home" && (
          <motion.div
            key="home"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Home
              isBluetoothConnected={isBluetoothConnected}
              onSendToHelmet={handleSendToHelmet}
              isDarkMap={isDarkMap}
            />
          </motion.div>
        )}

        {currentScreen === "history" && (
          <motion.div
            key="history"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <History
              routes={routes}
              onDeleteRoute={handleDeleteRoute}
              onReviewRoute={handleReviewRoute}
              isBluetoothConnected={isBluetoothConnected} // <--- aggiungi questa
            />
          </motion.div>
        )}

        {currentScreen === "settings" && (
          <motion.div
            key="settings"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Settings
              isBluetoothConnected={isBluetoothConnected}
              onToggleBluetooth={setIsBluetoothConnected}
              isDarkMap={isDarkMap}
              onToggleDarkMap={setIsDarkMap}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {currentScreen !== "splash" && (
        <Navbar currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      )}
    </div>
  );
}

function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}

export default App;
