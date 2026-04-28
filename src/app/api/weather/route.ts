import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat, lon 파라미터가 필요합니다" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API 키가 설정되지 않았습니다" }, { status: 500 });
  }

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`,
    { next: { revalidate: 0 } },
  );

  if (!res.ok) {
    return NextResponse.json({ error: "날씨 데이터를 가져오지 못했습니다" }, { status: 502 });
  }

  const data = await res.json();

  return NextResponse.json({
    city: data.name as string,
    temp: Math.round(data.main.temp as number),
    feelsLike: Math.round(data.main.feels_like as number),
    description: data.weather[0].description as string,
    icon: data.weather[0].icon as string,
    main: data.weather[0].main as string,
  });
}
