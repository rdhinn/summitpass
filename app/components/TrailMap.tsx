"use client";

import { useState, useEffect, useRef } from "react";

interface Checkpoint {
  name: string;
  elevation: number;
  distance: number; // km from basecamp
  temp: number; // typical temp
  lat: number;
  lng: number;
}

export default function TrailMap() {
  const checkpoints: Checkpoint[] = [
    { name: "Basecamp Patakbanteng", elevation: 1400, distance: 0.0, temp: 18, lat: -7.2100, lng: 109.9190 },
    { name: "Pos 1: Sikut Dewo", elevation: 1650, distance: 1.1, temp: 16, lat: -7.2030, lng: 109.9200 },
    { name: "Pos 2: Canggal Bulung", elevation: 1900, distance: 2.2, temp: 15, lat: -7.1970, lng: 109.9215 },
    { name: "Pos 3: Cacingan", elevation: 2200, distance: 3.2, temp: 13, lat: -7.1910, lng: 109.9228 },
    { name: "Puncak Prau (Camp)", elevation: 2565, distance: 4.2, temp: 11, lat: -7.1867, lng: 109.9231 },
  ];

  // Actual GPS path coordinates along the Patakbanteng route
  const trailCoords: [number, number][] = [
    [-7.2100, 109.9190], // Basecamp
    [-7.2085, 109.9192],
    [-7.2065, 109.9195],
    [-7.2045, 109.9198],
    [-7.2030, 109.9200], // Pos 1
    [-7.2015, 109.9203],
    [-7.1995, 109.9208],
    [-7.1980, 109.9212],
    [-7.1970, 109.9215], // Pos 2
    [-7.1955, 109.9218],
    [-7.1935, 109.9222],
    [-7.1920, 109.9225],
    [-7.1910, 109.9228], // Pos 3
    [-7.1895, 109.9230],
    [-7.1880, 109.9231],
    [-7.1867, 109.9231], // Puncak
  ];

  // Simulation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [speed, setSpeed] = useState(5); // multiplier
  const [currentCheckpoint, setCurrentCheckpoint] = useState<Checkpoint>(checkpoints[0]);
  const [liveStats, setLiveStats] = useState({
    elevation: 1400,
    distance: 0.0,
    temp: 18,
    timeRemaining: 210, // minutes
  });

  const [mapLoaded, setMapLoaded] = useState(false);

  const mapRef = useRef<any>(null);
  const hikerMarkerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load Leaflet libraries dynamically via CDN to bypass Next.js SSR crashes
  useEffect(() => {
    if (typeof window === "undefined" || mapLoaded) return;

    // Check if Leaflet is already on the page
    if ((window as any).L) {
      setMapLoaded(true);
      return;
    }

    // Load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      setMapLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Clean up script tag if unmounted before loading
      try {
        document.body.removeChild(script);
      } catch (e) {}
    };
  }, [mapLoaded]);

  // Initialize Map once Leaflet is loaded
  useEffect(() => {
    if (!mapLoaded || typeof window === "undefined") return;

    const L = (window as any).L;
    if (!L) return;

    // Initialize map
    const map = L.map("real-trail-map", {
      zoomControl: false,
    }).setView([-7.200, 109.921], 14);
    mapRef.current = map;

    L.control.zoom({ position: "topright" }).addTo(map);

    // Add Esri World Imagery (Satellite Actual Terrain)
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri &mdash; Satellite Imagery of Mount Prau Terrain",
      maxZoom: 18,
    }).addTo(map);

    // Add boundaries & labels overlay
    L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", {
      attribution: "",
    }).addTo(map);

    // Draw the trail route polyline
    L.polyline(trailCoords, {
      color: "#aff0ad",
      weight: 6,
      opacity: 0.8,
    }).addTo(map);

    L.polyline(trailCoords, {
      color: "#2d5a27",
      weight: 3,
      dashArray: "5, 8",
      opacity: 1,
    }).addTo(map);

    // Add checkpoint markers
    checkpoints.forEach((cp, idx) => {
      const markerColor = idx === 0 || idx === checkpoints.length - 1 ? "#2d5a27" : "#4d6357";
      const marker = L.circleMarker([cp.lat, cp.lng], {
        radius: idx === 0 || idx === checkpoints.length - 1 ? 8 : 6,
        fillColor: "#ffffff",
        color: markerColor,
        weight: 3,
        fillOpacity: 1,
      }).addTo(map);

      marker.bindTooltip(`<strong>${cp.name}</strong><br/>Elevasi: ${cp.elevation} mdpl`, {
        direction: "right",
        permanent: idx === 0 || idx === checkpoints.length - 1,
        opacity: 0.9,
      });
    });

    // Add Hiker GPS locator dot
    const hikerMarker = L.circleMarker(trailCoords[0], {
      radius: 9,
      fillColor: "#ba1a1a",
      color: "#ffffff",
      weight: 2,
      fillOpacity: 1,
    }).addTo(map);
    hikerMarkerRef.current = hikerMarker;

    hikerMarker.bindPopup("<b>Rombongan Hiker Anda</b><br/>GPS Live Tracking Aktif.").openPopup();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapLoaded]);

  // Handle GPS location update during simulation
  const getCoordinatesAtProgress = (pct: number) => {
    if (pct <= 0) return trailCoords[0];
    if (pct >= 100) return trailCoords[trailCoords.length - 1];

    const totalSegments = trailCoords.length - 1;
    const segmentIndex = Math.min(Math.floor(pct * totalSegments), totalSegments - 1);
    const segmentPct = pct * totalSegments - segmentIndex;

    const start = trailCoords[segmentIndex];
    const end = trailCoords[segmentIndex + 1];

    const lat = start[0] + (end[0] - start[0]) * segmentPct;
    const lng = start[1] + (end[1] - start[1]) * segmentPct;

    return [lat, lng] as [number, number];
  };

  // Start / Pause Simulation
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 0.3 * speed;
        });
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed]);

  // Dynamically update GPS marker on the actual map
  useEffect(() => {
    const pct = progress / 100;
    const coords = getCoordinatesAtProgress(pct);

    // 1. Move hiker marker
    if (hikerMarkerRef.current) {
      hikerMarkerRef.current.setLatLng(coords);
    }

    // 2. Pan map to keep hiker centered
    if (mapRef.current && isPlaying) {
      mapRef.current.panTo(coords);
    }

    // 3. Update stats
    const totalSegments = checkpoints.length - 1;
    const segmentIndex = Math.min(Math.floor(pct * totalSegments), totalSegments - 1);
    const segmentPct = pct * totalSegments - segmentIndex;

    const start = checkpoints[segmentIndex];
    const end = checkpoints[segmentIndex + 1];

    const elevation = Math.round(start.elevation + (end.elevation - start.elevation) * segmentPct);
    const distance = parseFloat((start.distance + (end.distance - start.distance) * segmentPct).toFixed(2));
    const temp = Math.round(start.temp + (end.temp - start.temp) * segmentPct);
    
    const totalDuration = 210; // 3.5 hours
    const timeRemaining = Math.max(Math.round(totalDuration * (1 - pct)), 0);

    setLiveStats({ elevation, distance, temp, timeRemaining });
    setCurrentCheckpoint(pct >= 1 ? checkpoints[checkpoints.length - 1] : checkpoints[segmentIndex]);
  }, [progress]);

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    if (mapRef.current) {
      mapRef.current.setView(trailCoords[0], 14);
    }
  };

  return (
    <section className="bg-white rounded-3xl p-6 md:p-8 border border-outline-variant/30 card-shadow space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-outline-variant/20 pb-4">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-1">
            <span className="material-symbols-outlined text-xs animate-pulse text-error">satellite_alt</span>
            Live GPS Tracking &amp; Peta Medan Asli
          </span>
          <h3 className="font-headline font-black text-2xl text-on-surface mt-1">
            Jalur Patakbanteng (Satelit Esri)
          </h3>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="forest-gradient text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">
              {isPlaying ? "pause" : "play_arrow"}
            </span>
            {isPlaying ? "Jeda" : progress === 0 ? "Mulai Tracking" : "Lanjutkan"}
          </button>
          
          <button
            onClick={handleReset}
            className="bg-white border border-outline-variant/60 text-secondary hover:bg-surface-container-low px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">replay</span>
            Reset
          </button>

          {/* Speed Selector */}
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-surface-container border border-outline-variant/40 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
          >
            <option value={2}>Speed: 1x</option>
            <option value={10}>Speed: 5x</option>
            <option value={20}>Speed: 10x</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Leaflet Map Container */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden relative min-h-[400px] shadow-inner flex flex-col justify-center items-center">
          {!mapLoaded ? (
            <div className="text-center p-8 space-y-4">
              <span className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin block mx-auto"></span>
              <p className="text-xs text-on-surface-variant font-medium">Memuat Citra Satelit &amp; Peta Medan...</p>
            </div>
          ) : (
            <div id="real-trail-map" className="w-full h-[400px] z-10" />
          )}

          {/* Signal Indicator Overlay */}
          {mapLoaded && (
            <div className="absolute top-4 left-4 bg-white/85 backdrop-blur-md px-3 py-1 rounded-full border border-outline-variant/30 flex items-center gap-1.5 shadow-sm text-[10px] font-bold z-20">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-emerald-500 animate-ping" : "bg-primary"}`}></span>
              <span className="text-secondary font-mono">LIVE: {isPlaying ? "TRANSMITTING" : "STANDBY"}</span>
            </div>
          )}
        </div>

        {/* Right Column: Simulated Live Stats */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          {/* Real-time Status Card */}
          <div className="bg-surface-container/50 border border-outline-variant/30 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-xs text-secondary uppercase tracking-widest border-b border-outline-variant/20 pb-2">
              Status Real-Time
            </h4>

            <div className="space-y-3">
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Lokasi Saat Ini</span>
                <span className="text-sm font-headline font-black text-primary truncate block">
                  {progress === 100 ? "Tiba di Puncak Prau!" : currentCheckpoint.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Ketinggian</span>
                  <span className="text-base font-black font-headline text-on-surface font-mono">{liveStats.elevation} <span className="text-[10px] font-normal">mdpl</span></span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Suhu Ketinggian</span>
                  <span className="text-base font-black font-headline text-on-surface font-mono">{liveStats.temp}°C</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Jarak Tempuh</span>
                  <span className="text-base font-black font-headline text-on-surface font-mono">{liveStats.distance} <span className="text-[10px] font-normal">km</span></span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Estimasi Sisa</span>
                  <span className="text-base font-black font-headline text-on-surface font-mono">
                    {Math.floor(liveStats.timeRemaining / 60)}j {liveStats.timeRemaining % 60}m
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-secondary">
                <span>PROGRESS MENDAKI</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full forest-gradient transition-all duration-100 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Safety Checkpoint Checklist */}
          <div className="bg-white border border-outline-variant/20 rounded-2xl p-5 space-y-3 shadow-sm flex-grow">
            <h4 className="font-bold text-xs text-secondary uppercase tracking-widest border-b border-outline-variant/25 pb-2 flex items-center justify-between">
              <span>Protokol Checkpoint</span>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[8px] font-mono">SIMAKSI VALID</span>
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              {checkpoints.map((cp, idx) => {
                const isChecked = liveStats.elevation >= cp.elevation;
                return (
                  <li key={cp.name} className="flex items-center gap-2.5 transition-colors duration-300">
                    <span
                      className={`material-symbols-outlined text-sm ${
                        isChecked ? "text-primary font-bold" : "text-secondary/20"
                      }`}
                    >
                      {isChecked ? "check_box" : "check_box_outline_blank"}
                    </span>
                    <span className={isChecked ? "text-on-surface" : "text-on-surface-variant/50"}>
                      Checkpoint #{idx + 1}: {cp.name.split(":")[0]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
