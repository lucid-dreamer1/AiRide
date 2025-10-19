import { createContext, useContext, useState, ReactNode } from "react";
import type { Route } from "../App";

interface NavigationContextType {
  currentPosition: [number, number] | null;
  setCurrentPosition: (pos: [number, number] | null) => void;
  from: string;
  setFrom: (f: string) => void;
  to: string;
  setTo: (t: string) => void;
  routeCoords: [number, number][];
  setRouteCoords: (coords: [number, number][]) => void;
  completedPath: [number, number][];
  setCompletedPath: (path: [number, number][]) => void;
  currentInstruction: string | null;
  setCurrentInstruction: (i: string | null) => void;
  routeInfo: { duration: string; distance: string };
  setRouteInfo: (info: { duration: string; distance: string }) => void;
  autoFrom: [number, number] | null;
  setAutoFrom: (pos: [number, number] | null) => void;
  selectedRoute: Route | null; // <--- aggiungi
  setSelectedRoute: (route: Route | null) => void; // <--- aggiungi
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [currentPosition, setCurrentPosition] = useState<
    [number, number] | null
  >(null);
  const [from, setFrom] = useState("Rilevamento posizione...");
  const [to, setTo] = useState("");
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [completedPath, setCompletedPath] = useState<[number, number][]>([]);
  const [currentInstruction, setCurrentInstruction] = useState<string | null>(
    null
  );
  const [routeInfo, setRouteInfo] = useState({ duration: "—", distance: "—" });
  const [autoFrom, setAutoFrom] = useState<[number, number] | null>(null);
  const [preloadedRoute, setPreloadedRoute] = useState<Route | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  return (
    <NavigationContext.Provider
  value={{
    currentPosition,
    setCurrentPosition,
    from,
    setFrom,
    to,
    setTo,
    routeCoords,
    setRouteCoords,
    completedPath,
    setCompletedPath,
    currentInstruction,
    setCurrentInstruction,
    routeInfo,
    setRouteInfo,
    autoFrom,
    setAutoFrom,
    selectedRoute,       // <--- aggiungi
    setSelectedRoute,    // <--- aggiungi
  }}
>
  {children}
</NavigationContext.Provider>

  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context)
    throw new Error("useNavigation must be used within NavigationProvider");
  return context;
};
