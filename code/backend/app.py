###############################################################
# APP DI NAVIGAZIONE BASATA SU FLASK + TOMTOM API
###############################################################

from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import requests, json, math, time, traceback

app = Flask(__name__)
CORS(app)

API_KEY = "XeNHiK6pLDHE2MYxOyW5bOmv01ZN73oy"
current_positions = {}  # {session_id: {"lat": float, "lon": float}}

###############################################################
# UTILITY
###############################################################

def distanza_m(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

def manovra_to_freccia(text):
    t = text.lower()
    if any(k in t for k in ("destra", "right")): return 0
    if any(k in t for k in ("sinistra", "left")): return 1
    if any(k in t for k in ("dritto", "straight", "continua", "continue")): return 2
    if any(k in t for k in ("u-turn", "inversione", "indietro")): return 3
    return 2

def geocode_address(address):
    try:
        url = f"https://api.tomtom.com/search/2/geocode/{requests.utils.quote(address)}.json"
        params = {"key": API_KEY, "limit": 1}
        r = requests.get(url, params=params, timeout=10)
        data = r.json()
        if data.get("results"):
            pos = data["results"][0]["position"]
            return f"{pos['lat']},{pos['lon']}"
    except Exception as e:
        print("Errore geocoding:", e, address)
    return None

def get_route_from_tomtom(start, end):
    try:
        start_lat, start_lon = map(float, start.split(","))
        end_lat, end_lon = map(float, end.split(","))
        url = f"https://api.tomtom.com/routing/1/calculateRoute/{start_lat},{start_lon}:{end_lat},{end_lon}/json"
        params = {
            "key": API_KEY,
            "instructionsType": "text",
            "routeType": "fastest",
            "traffic": "false"
        }
        r = requests.get(url, params=params, timeout=10)
        if r.status_code != 200:
            print("Errore TomTom:", r.text)
            return None
        return r.json()
    except Exception as e:
        print("Errore get_route_from_tomtom:", e)
        return None

def extract_instructions(resp_json):
    try:
        route = resp_json.get("routes", [{}])[0]
        legs = route.get("legs", [])
        instructions = []
        for leg in legs:
            guidance = leg.get("guidance", {}) or route.get("guidance", {})
            for instr in guidance.get("instructions", []):
                msg = instr.get("message", "")
                lat = instr.get("point", {}).get("latitude")
                lon = instr.get("point", {}).get("longitude")
                dist = instr.get("routeOffsetInMeters", 0)
                instructions.append({"text": msg, "lat": lat, "lon": lon, "dist": dist})
        return instructions
    except Exception as e:
        print("Errore extract_instructions:", e)
        return []

###############################################################
# UPDATE POSIZIONE GPS
###############################################################

@app.route("/update_position", methods=["POST"])
def update_position():
    try:
        data = request.get_json(force=True)
        if not data or "lat" not in data or "lon" not in data:
            return jsonify({"error": "Lat e Lon mancanti"}), 400

        session_id = request.remote_addr
        current_positions[session_id] = {"lat": float(data["lat"]), "lon": float(data["lon"])}
        return jsonify({"ok": True})
    except Exception as e:
        print("Errore /update_position:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

###############################################################
# ROUTE INFO
###############################################################

@app.route("/route_info")
def route_info():
    try:
        start = request.args.get("start")
        end = request.args.get("end")
        if not start or not end:
            return jsonify({"error": "Start o end mancanti"}), 400

        try:
            lat, lon = map(float, start.split(","))
            start_coords = start
        except:
            start_coords = geocode_address(start)
        if not start_coords:
            return jsonify({"error": "Partenza non valida"}), 400

        end_coords = geocode_address(end)
        if not end_coords:
            return jsonify({"error": "Destinazione non valida"}), 400

        route_data = get_route_from_tomtom(start_coords, end_coords)
        if not route_data or not route_data.get("routes"):
            return jsonify({"error": "Nessuna rotta trovata"}), 400

        route = route_data["routes"][0]
        summary = route.get("summary", {})
        duration_sec = summary.get("travelTimeInSeconds", 0)
        distance_m = summary.get("lengthInMeters", 0)

        points = []
        for leg in route.get("legs", []):
            for point in leg.get("points", []):
                lat = point.get("latitude")
                lon = point.get("longitude")
                if lat is not None and lon is not None:
                    points.append({"lat": lat, "lon": lon})

        return jsonify({
            "duration": f"{round(duration_sec/60)} min",
            "distance": f"{round(distance_m/1000,1)} km",
            "coordinates": points
        })

    except Exception as e:
        print("Errore /route_info:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

###############################################################
# STREAMING ISTRUZIONI SSE
###############################################################

@app.route("/stream")
def stream():
    try:
        start = request.args.get("start")
        end = request.args.get("end")
        session_id = request.remote_addr

        if not start or not end:
            return jsonify({"error": "Start o end mancanti"}), 400

        try:
            lat, lon = map(float, start.split(","))
            start_coords = start
        except:
            start_coords = geocode_address(start)
        if not start_coords:
            return jsonify({"error": "Partenza non valida"}), 400

        end_coords = geocode_address(end)
        if not end_coords:
            return jsonify({"error": "Destinazione non valida"}), 400

        route_data = get_route_from_tomtom(start_coords, end_coords)
        instructions = extract_instructions(route_data)

        def generate():
            instr_index = 0
            yield f"data: {json.dumps({'testo':'Navigazione avviata 🚗'})}\n\n"
            while instr_index < len(instructions):
                instr = instructions[instr_index]
                step = {"freccia": manovra_to_freccia(instr["text"]),
                        "metri": instr["dist"],
                        "testo": instr["text"]}
                pos = current_positions.get(session_id)
                if not pos:
                    yield f": waiting for GPS update\n\n"
                    time.sleep(1)
                    continue
                if instr["lat"] is not None and instr["lon"] is not None:
                    d = distanza_m(pos["lat"], pos["lon"], instr["lat"], instr["lon"])
                    if d < 70:
                        yield f"data: {json.dumps(step)}\n\n"
                        instr_index += 1
                    else:
                        yield f": GPS tracking...\n\n"
                else:
                    yield f"data: {json.dumps(step)}\n\n"
                    instr_index += 1
                time.sleep(1)
            yield f"data: {json.dumps({'testo':'Percorso completato 🎉'})}\n\n"

        return Response(generate(), mimetype="text/event-stream",
                        headers={"Cache-Control": "no-cache",
                                 "Access-Control-Allow-Origin": "*",
                                 "Connection": "keep-alive"})

    except Exception as e:
        print("Errore /stream:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

###############################################################
# AVVIO SERVER
###############################################################

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
