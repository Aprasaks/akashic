"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Play, Square, AlertCircle } from "lucide-react";
import type { GpsPoint } from "@/types/health";

interface GpsTrackerProps {
  onRouteComplete: (route: GpsPoint[], distanceM: number) => void;
}

function haversineDistance(a: GpsPoint, b: GpsPoint): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function totalDistance(points: GpsPoint[]): number {
  return points.slice(1).reduce((sum, p, i) => {
    const prev = points[i];
    return prev ? sum + haversineDistance(prev, p) : sum;
  }, 0);
}

export default function GpsTracker({ onRouteComplete }: GpsTrackerProps) {
  const [tracking, setTracking] = useState(false);
  const [route, setRoute] = useState<GpsPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<{
    map: import("leaflet").Map;
    polyline: import("leaflet").Polyline;
    marker: import("leaflet").CircleMarker;
  } | null>(null);

  const initMap = useCallback(async (lat: number, lng: number) => {
    if (!mapRef.current || leafletRef.current) return;
    const L = (await import("leaflet")).default;

    const map = L.map(mapRef.current).setView([lat, lng], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    const polyline = L.polyline([], { color: "#18181b", weight: 3 }).addTo(map);
    const marker = L.circleMarker([lat, lng], {
      radius: 7,
      fillColor: "#18181b",
      fillOpacity: 1,
      color: "#fff",
      weight: 2,
    }).addTo(map);

    leafletRef.current = { map, polyline, marker };
  }, []);

  const updateMap = useCallback((points: GpsPoint[]) => {
    const lf = leafletRef.current;
    if (!lf || points.length === 0) return;
    const last = points[points.length - 1];
    if (!last) return;
    const latLngs = points.map((p) => [p.lat, p.lng] as [number, number]);
    lf.polyline.setLatLngs(latLngs);
    lf.marker.setLatLng([last.lat, last.lng]);
    lf.map.panTo([last.lat, last.lng]);
  }, []);

  function startTracking() {
    if (!navigator.geolocation) {
      setError("이 브라우저는 GPS를 지원하지 않습니다");
      return;
    }
    setError(null);
    setRoute([]);
    setDistance(0);
    setTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const point: GpsPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: pos.timestamp,
        };
        setRoute((prev) => {
          const next = [...prev, point];
          const d = totalDistance(next);
          setDistance(d);
          updateMap(next);
          return next;
        });
        if (!leafletRef.current) {
          await initMap(point.lat, point.lng);
        }
      },
      () => setError("위치 권한을 허용해주세요"),
      { enableHighAccuracy: true, maximumAge: 3000 }
    );
  }

  function stopTracking() {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
    if (route.length > 1) {
      onRouteComplete(route, Math.round(distance));
    }
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-zinc-500" />
          <span className="text-xs font-medium text-zinc-700">GPS 경로 추적</span>
          {tracking && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              추적 중
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {tracking && distance > 0 && (
            <span className="text-xs text-zinc-500">
              {distance >= 1000
                ? `${(distance / 1000).toFixed(2)} km`
                : `${Math.round(distance)} m`}
            </span>
          )}
          {!tracking ? (
            <button
              onClick={startTracking}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
            >
              <Play size={11} />
              시작
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600"
            >
              <Square size={11} />
              종료
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2">
          <AlertCircle size={13} className="text-rose-500" />
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      )}

      {(tracking || route.length > 1) && (
        <div ref={mapRef} className="h-48 w-full overflow-hidden rounded-xl border border-zinc-100" />
      )}
    </div>
  );
}
