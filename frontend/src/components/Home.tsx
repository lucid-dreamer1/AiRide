import { useState, useEffect, useRef } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  MapPin,
  Navigation,
  Bluetooth,
  BluetoothOff,
  LocateFixed,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { startRouteStream, updatePosition } from "../services/navigationApi";
import type { Route } from "../App";

interface HomeProps {
  isBluetoothConnected: boolean;
  onSendToHelmet: (route: Route) => void;
  preloadedRoute: Route | null;
  isDarkMap: boolean;
}

export function Home({
  isBluetoothConnected,
  onSendToHelmet,
  preloadedRoute,
  isDarkMap,
}: HomeProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [routeInfo, setRouteInfo] = useState({ duration: "—", distance: "—" });
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [currentInstruction, setCurrentInstruction] = useState<string | null>(
    null
  );
  const [isSending, setIsSending] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<
    [number, number] | null
  >(null);
  const [completedPath, setCompletedPath] = useState<[number, number][]>([]);
  const mapRef = useRef<any>(null);

  // Carica route pre-caricata
  useEffect(() => {
    if (preloadedRoute) {
      setFrom(preloadedRoute.from);
      setTo(preloadedRoute.to);
      setRouteInfo({
        duration: preloadedRoute.duration,
        distance: preloadedRoute.distance,
      });
    }
  }, [preloadedRoute]);

  // Ottieni info percorso dal backend
 // Ottieni info percorso dal backend
useEffect(() => {
  if (!from || !to) return;
  const controller = new AbortController();

  async function fetchRoute() {
    try {
      const res = await fetch(
        `http://localhost:5000/route_info?start=${encodeURIComponent(from)}&end=${encodeURIComponent(to)}`,
        { signal: controller.signal }
      );

      const data = await res.json();

      if (res.ok) {
        setRouteInfo({ duration: data.duration, distance: data.distance });

        if (data.coordinates && data.coordinates.length > 0) {
          const coords = data.coordinates.map(
            (p: { lat: number; lon: number }) =>
              [p.lat, p.lon] as [number, number]
          );
          setRouteCoords(coords);
        } else {
          setRouteCoords([]);
        }
      } else {
        toast.error(data.error || "Errore ottenendo percorso");
        setRouteCoords([]);
      }
    } catch (err) {
      console.error(err);
      setRouteInfo({ duration: "—", distance: "—" });
      setRouteCoords([]);
    }
  }

  fetchRoute();
  return () => controller.abort();
}, [from, to]);

  // 🔹 Gestione GPS Reale
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Il tuo dispositivo non supporta il GPS");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        setCurrentPosition([lat, lon]);
        updatePosition(lat, lon);

        // Centra la mappa sulla posizione reale
        if (mapRef.current?.getMap) {
          mapRef.current.getMap().flyTo({
            center: [lon, lat],
            essential: true,
            zoom: 15,
            speed: 0.8,
          });
        }

        // Aggiorna percorso completato se sei vicino a un punto del tragitto
        if (routeCoords.length > 0) {
          const nearest = routeCoords.find(
            ([rLat, rLon]) =>
              Math.abs(rLat - lat) < 0.0005 && Math.abs(rLon - lon) < 0.0005
          );
          if (nearest) {
            const index = routeCoords.indexOf(nearest);
            setCompletedPath(
              routeCoords.slice(0, index + 1).map(([lat, lon]) => [lon, lat])
            );
          }
        }
      },
      (err) => {
        console.error(err);
        toast.error("Impossibile ottenere la posizione GPS");
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [routeCoords]);

  // 🔹 Avvia navigazione e ricevi istruzioni
  const handleSend = () => {
    if (!from || !to) return toast.error("Inserisci partenza e destinazione");
    if (!isBluetoothConnected) return toast.error("Bluetooth non connesso");

    setIsSending(true);
    const route: Route = {
      from,
      to,
      duration: routeInfo.duration,
      distance: routeInfo.distance,
      date: new Date().toISOString().split("T")[0],
    };
    onSendToHelmet(route);

    toast.success("Percorso inviato al casco!", {
      description: "Le indicazioni appariranno sul display del casco",
    });

    const eventSource = startRouteStream(
      from,
      to,
      (data) => {
        if (data.testo) setCurrentInstruction(data.testo);
      },
      () => {
        toast.success("Percorso completato 🎉");
        setIsSending(false);
        setCurrentInstruction(null);
      }
    );

    return () => eventSource.close();
  };

  const MAP_STYLE_LIGHT =
    "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
  const MAP_STYLE_DARK =
    "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

  return (
    <div className="h-full flex flex-col pb-20">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 style={{ fontFamily: "Poppins, sans-serif" }}>
          ai<span className="text-[#E85A2A]">Ride</span>
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

      {/* Mappa */}
      <div
        className="mx-6 rounded-3xl overflow-hidden"
        style={{ height: "280px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
      >
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: 12.4964,
            latitude: 41.9028,
            zoom: 13,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={isDarkMap ? MAP_STYLE_DARK : MAP_STYLE_LIGHT}
          mapLib={import("maplibre-gl")}
        >
          {/* Linea del percorso */}
          {routeCoords.length > 0 && (
            <Source
              id="route"
              type="geojson"
              data={{
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: routeCoords.map(([lat, lon]) => [lon, lat]),
                },
                properties: {},
              }}
            >
              <Layer
                id="route-line"
                type="line"
                paint={{
                  "line-color": "#E85A2A",
                  "line-width": 4,
                }}
              />
            </Source>
          )}

          {/* Linea percorso completato */}
          {completedPath.length > 0 && (
            <Source
              id="completed-path"
              type="geojson"
              data={{
                type: "Feature",
                geometry: { type: "LineString", coordinates: completedPath },
              }}
            >
              <Layer
                id="completed-line"
                type="line"
                paint={{
                  "line-color": "#999999",
                  "line-width": 4,
                }}
              />
            </Source>
          )}

          {/* Marker dinamico posizione reale */}
          {currentPosition && (
            <Marker
              longitude={currentPosition[1]}
              latitude={currentPosition[0]}
              anchor="center"
              key="gps-marker"
            >
              <div className="w-5 h-5 bg-[#E85A2A] border-2 border-white rounded-full shadow-lg animate-pulse" />
            </Marker>
          )}
        </Map>
      </div>

      {/* Input partenza/destinazione */}
      <div className="px-6 mt-6 space-y-3">
        <div className="relative">
          <MapPin
            size={20}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Partenza"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="pl-12 h-14 rounded-2xl border-2 border-gray-200 focus:border-[#E85A2A]"
            style={{ fontFamily: "Inter, sans-serif" }}
          />
        </div>
        <div className="relative">
          <Navigation
            size={20}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Destinazione"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="pl-12 h-14 rounded-2xl border-2 border-gray-200 focus:border-[#E85A2A]"
            style={{ fontFamily: "Inter, sans-serif" }}
          />
        </div>
      </div>

      {/* Info percorso */}
      {from && to && (
        <div className="mx-6 mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 flex justify-around">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Durata</p>
            <p className="text-black mt-1">{routeInfo.duration}</p>
          </div>
          <div className="w-px h-8 bg-gray-300" />
          <div className="text-center">
            <p className="text-gray-500 text-sm">Distanza</p>
            <p className="text-black mt-1">{routeInfo.distance}</p>
          </div>
        </div>
      )}

      {/* Istruzione corrente */}
      {currentInstruction && (
        <div className="mx-6 mt-3 p-3 bg-[#E85A2A]/10 rounded-xl text-center text-[#E85A2A]">
          <p className="text-sm font-medium">{currentInstruction}</p>
        </div>
      )}

      {/* Bottone */}
      <div className="px-6 mt-auto mb-4">
        <Button
          onClick={handleSend}
          disabled={isSending || !from || !to}
          className="w-full h-14 rounded-2xl bg-[#E85A2A] hover:bg-[#d14f23] text-white flex items-center justify-center gap-2"
        >
          <LocateFixed size={18} />
          Invia a casco
        </Button>
      </div>
    </div>
  );
}
