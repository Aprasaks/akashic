"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MapPin, Thermometer } from "lucide-react";

interface WeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  main: string;
}

const CACHE_KEY = "akashic_weather";
const CACHE_TTL = 30 * 60 * 1000;

function getWeatherComment(main: string): string {
  switch (main) {
    case "Rain":
    case "Drizzle":
      return "오늘 우산은 챙기셨나요? ☂️";
    case "Thunderstorm":
      return "천둥번개가 있어요. 외출 시 주의하세요 ⚡";
    case "Snow":
      return "눈이 내려요. 따뜻하게 입고 나가세요 ❄️";
    case "Clear":
      return "날씨가 맑아요. 산책 어떠세요? ☀️";
    case "Clouds":
      return "구름이 끼어 있어요. 포근한 하루 되세요 ☁️";
    case "Mist":
    case "Fog":
    case "Haze":
      return "안개가 있어요. 운전 시 조심하세요 🌫️";
    default:
      return "오늘 하루도 좋은 하루 되세요 😊";
  }
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "done">("loading");

  useEffect(() => {
    async function load() {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached) as { data: WeatherData; timestamp: number };
        if (Date.now() - timestamp < CACHE_TTL) {
          setWeather(data);
          setStatus("done");
          return;
        }
      }

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const res = await fetch(
              `/api/weather?lat=${coords.latitude}&lon=${coords.longitude}`,
            );
            if (!res.ok) throw new Error();
            const data = (await res.json()) as WeatherData;
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
            setWeather(data);
            setStatus("done");
          } catch {
            setStatus("error");
          }
        },
        () => setStatus("error"),
      );
    }

    load();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-xs text-zinc-300">날씨 불러오는 중...</p>
      </div>
    );
  }

  if (status === "error" || !weather) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-center text-xs text-zinc-300">위치 권한을 허용하면 날씨를 볼 수 있어요</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1 text-zinc-400">
            <MapPin size={11} strokeWidth={1.5} />
            <span className="text-xs">{weather.city}</span>
          </div>
          <p className="mt-2 text-4xl font-light text-zinc-900">{weather.temp}°</p>
          <p className="mt-0.5 text-sm text-zinc-500">{weather.description}</p>
        </div>
        <Image
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.description}
          width={64}
          height={64}
          className="-mt-1 -mr-1"
          unoptimized
        />
      </div>

      <div>
        <div className="flex items-center gap-1 text-zinc-400">
          <Thermometer size={11} strokeWidth={1.5} />
          <span className="text-xs">체감 {weather.feelsLike}°</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          {getWeatherComment(weather.main)}
        </p>
      </div>
    </div>
  );
}
