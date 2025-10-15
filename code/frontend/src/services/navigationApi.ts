// Usa il link ngrok del tuo backend qui
const BASE_URL = "https://unmouldering-eliana-unreclaimed.ngrok-free.dev";

// Invio della posizione corrente
export async function updatePosition(lat: number, lon: number) {
  try {
    await fetch(`${BASE_URL}/update_position`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon }),
    });
  } catch (err) {
    console.error("Errore aggiornando la posizione:", err);
  }
}

// Stream delle istruzioni di navigazione
export function startRouteStream(
  from: string,
  to: string,
  onMessage: (data: any) => void,
  onComplete?: () => void
) {
  const url = new URL(`${BASE_URL}/stream`);
  url.searchParams.append("start", from);
  url.searchParams.append("end", to);

  const eventSource = new EventSource(url.toString());

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);

      if (data.testo?.includes("Percorso completato")) {
        onComplete?.();
        eventSource.close();
      }
    } catch (e) {
      console.error("Errore parsing SSE:", e);
    }
  };

  eventSource.onerror = (err) => {
    console.error("Errore stream:", err);
    eventSource.close();
    onComplete?.();
  };

  return eventSource;
}

// Ottieni info percorso
export async function getRouteInfo(from: string, to: string) {
  try {
    const res = await fetch(
      `${BASE_URL}/route_info?start=${encodeURIComponent(from)}&end=${encodeURIComponent(to)}`
    );
    return await res.json();
  } catch (err) {
    console.error("Errore fetching route info:", err);
    return null;
  }
}
