// Home.tsx
import { useState, useEffect, useRef } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl/maplibre";
import { useNavigation } from "./NavigationContext";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  MapPin,
  Navigation,
  LocateFixed,
  Bluetooth,
  BluetoothOff,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { startRouteStream, updatePosition } from "../services/navigationApi";
import type { Route } from "../App";
import { connectSerial, sendSerialMessage } from "../services/serialService";

interface HomeProps {
  isBluetoothConnected: boolean;
  onSendToHelmet: (route: Route) => void;
  isDarkMap: boolean;
}

// ------------------- CONFIGURAZIONE -------------------
const USE_MOCK_SERIAL = true; // true = simulazione console, false = invio reale USB
// --------------------------------------------------------

export function Home({
  isBluetoothConnected,
  onSendToHelmet,
  isDarkMap,
}: HomeProps) {
  const [isSending, setIsSending] = useState(false);
  const [isSerialConnected, setIsSerialConnected] = useState(false);

  const {
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
  } = useNavigation();

  const [routeFetched, setRouteFetched] = useState(false);
  const mapRef = useRef<any>(null);
  const lastIndexRef = useRef(0);
  const lastPositionRef = useRef<[number, number] | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const initialDurationRef = useRef<string>("—");

  useEffect(() => {
    if (!to) {
      setRouteCoords([]);
      setRouteInfo({ duration: "—", distance: "—" });
      setCompletedPath([]);
      setRouteFetched(false);
      lastIndexRef.current = 0;
      initialDurationRef.current = "—";
    } else if (!routeFetched) {
      setRouteFetched(false);
    }
  }, [to]);

  useEffect(() => {
    if (!autoFrom || !to) return;
    if (routeFetched) return;
    const realFrom = `${autoFrom[0]},${autoFrom[1]}`;
    const controller = new AbortController();

    async function fetchRoute() {
      try {
        const res = await fetch(
          `/route_info?start=${encodeURIComponent(realFrom)}&end=${encodeURIComponent(to)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (res.ok) {
          setRouteInfo({ duration: data.duration, distance: data.distance });
          if (data.duration) initialDurationRef.current = data.duration;
          if (data.coordinates && data.coordinates.length > 0) {
            const coords = data.coordinates.map(
              (p: { lat: number; lon: number }) => [p.lat, p.lon] as [number, number]
            );
            setRouteCoords(coords);
          } else {
            setRouteCoords([]);
          }
          setRouteFetched(true);
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
  }, [autoFrom, to, routeFetched]);

  function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function computeRemainingDistance(currentPos: [number, number], route: [number, number][]) {
    let distance = 0;
    let startAdding = false;
    for (let i = 0; i < route.length - 1; i++) {
      const [lat1, lon1] = route[i];
      const [lat2, lon2] = route[i + 1];
      if (!startAdding) {
        const d = haversine(currentPos[0], currentPos[1], lat1, lon1);
        if (d < 40) startAdding = true;
      }
      if (startAdding) {
        distance += haversine(lat1, lon1, lat2, lon2);
      }
    }
    return distance;
  }

  function computeDistanceToNextStep(currentPos: [number, number], route: [number, number][], nextIndex: number) {
    if (nextIndex >= route.length - 1) return 0;
    const [lat1, lon1] = route[nextIndex];
    return Math.round(haversine(currentPos[0], currentPos[1], lat1, lon1));
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Il tuo dispositivo non supporta il GPS");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCurrentPosition([lat, lon]);
        updatePosition(lat, lon);
        if (!autoFrom) setAutoFrom([lat, lon]);
        if (from === "Rilevamento posizione..." || from === "")
          setFrom("La tua posizione attuale");

        if (mapRef.current?.getMap) {
          mapRef.current.getMap().flyTo({
            center: [lon, lat],
            essential: true,
            zoom: 15,
            speed: 0.8,
          });
        }

        if (routeCoords.length > 0) {
          const remainingDistance = computeRemainingDistance([lat, lon], routeCoords);
          const now = Date.now();
          let speed = 0;
          if (lastPositionRef.current && lastTimeRef.current) {
            const [latPrev, lonPrev] = lastPositionRef.current;
            const deltaT = (now - lastTimeRef.current) / 1000;
            const deltaD = haversine(latPrev, lonPrev, lat, lon);
            speed = deltaD / deltaT;
          }
          lastPositionRef.current = [lat, lon];
          lastTimeRef.current = now;
          const MIN_SPEED = 0.5;
          let remainingDuration = initialDurationRef.current;
          if (speed >= MIN_SPEED) {
            const minutes = Math.round(remainingDistance / speed / 60);
            remainingDuration = `${minutes} min`;
          }
          setRouteInfo({
            distance: `${(remainingDistance / 1000).toFixed(2)} km`,
            duration: remainingDuration,
          });
        }
      },
      (err) => {
        console.error(err);
        toast.error("Impossibile ottenere la posizione GPS");
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [routeCoords, from, autoFrom]);

  const handleConnectSerial = async () => {
    const ok = await connectSerial();
    if (ok) {
      setIsSerialConnected(true);
      toast.success("Arduino connesso via USB!");
    } else {
      toast.error("Connessione seriale fallita");
    }
  };

  const handleSend = () => {
    if (!to) return toast.error("Inserisci destinazione");
    if (!isBluetoothConnected) return toast.error("Bluetooth non connesso");
    if (!autoFrom) return toast.error("Posizione GPS non disponibile");

    setIsSending(true);
    const realFrom = `${autoFrom[0]},${autoFrom[1]}`;
    const route: Route = {
      from: realFrom,
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
      realFrom,
      to,
      async (data) => {
        if (data.testo) setCurrentInstruction(data.testo);
        const metri = data.metri ?? computeDistanceToNextStep(currentPosition!, routeCoords, lastIndexRef.current);
        const message = `Indicazione: ${data.testo} | Metri: ${metri} m`;

        if (USE_MOCK_SERIAL) {
          console.log("Simulato invio seriale:", message);
        } else if (isSerialConnected) {
          await sendSerialMessage(message);
        }
      },
      () => {
        toast.success("Percorso completato 🎉");
        setIsSending(false);
        setCurrentInstruction(null);
      }
    );

    return () => eventSource.close();
  };

  const MAP_STYLE_LIGHT = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
  const MAP_STYLE_DARK = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

  return (
    <div className="h-full flex flex-col pb-20">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 style={{ fontFamily: "Poppins, sans-serif" }}>
          Ai<span className="text-[#E85A2A]">Ride</span>
        </h1>
        <div className="flex items-center gap-2">
          {isBluetoothConnected ? (
            <>
              <Bluetooth size={20} className="text-[#E85A2A]" />
              <span className="text-sm text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>
                Connesso
              </span>
            </>
          ) : (
            <>
              <BluetoothOff size={20} className="text-gray-400" />
              <span className="text-sm text-gray-400" style={{ fontFamily: "Inter, sans-serif" }}>
                Non connesso
              </span>
            </>
          )}
        </div>
      </div>

      {/* Mappa */}
      <div className="mx-6 rounded-3xl overflow-hidden" style={{ height: "280px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
        <Map
          ref={mapRef}
          initialViewState={{ longitude: 12.4964, latitude: 41.9028, zoom: 13 }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={isDarkMap ? MAP_STYLE_DARK : MAP_STYLE_LIGHT}
          mapLib={import("maplibre-gl")}
        >
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
                paint={{ "line-color": "#E85A2A", "line-width": 4 }}
              />
            </Source>
          )}

          {completedPath.length > 0 && (
            <Source
              id="completed-path"
              type="geojson"
              data={{
                type: "Feature",
                geometry: { type: "LineString", coordinates: completedPath },
                properties: {},
              }}
            >
              <Layer
                id="completed-line"
                type="line"
                paint={{ "line-color": "#999999", "line-width": 4 }}
              />
            </Source>
          )}

          {currentPosition && (
            <Marker longitude={currentPosition[1]} latitude={currentPosition[0]} anchor="center" key="gps-marker">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-4 h-4 bg-[#E85A2A]/25 rounded-full blur-md animate-pulse" />
                <div className="w-8 h-8 bg-[#E85A2A] border-[3px] border-white rounded-full shadow-lg" />
              </div>
            </Marker>
          )}
        </Map>
      </div>

      {/* Input partenza e destinazione */}
      <div className="px-6 mt-6 space-y-3">
        <div className="relative">
          <MapPin size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Partenza"
            value={from}
            disabled
            className="pl-12 h-14 rounded-2xl border-2 border-gray-200 bg-gray-100 text-gray-700"
            style={{ fontFamily: "Inter, sans-serif" }}
          />
        </div>
        <div className="relative">
          <Navigation size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
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

      {/* Pulsante connessione seriale */}
      <div className="px-6 mt-4">
        <Button
          onClick={handleConnectSerial}
          disabled={isSerialConnected}
          className="w-full h-14 rounded-2xl bg-gray-200 hover:bg-gray-300 text-black mb-3"
        >
          {isSerialConnected ? "Arduino connesso ✅" : "Connetti Arduino via USB"}
        </Button>
      </div>

      {/* Bottone invio */}
      <div className="px-6 mt-auto mb-4">
        <Button
          onClick={handleSend}
          disabled={isSending || !to || !autoFrom || currentInstruction !== null}
          className="w-full h-14 rounded-2xl bg-[#E85A2A] hover:bg-[#d14f23] text-white flex items-center justify-center gap-2"
        >
          <LocateFixed size={18} /> Invia a casco
        </Button>
      </div>
    </div>
  );
}
