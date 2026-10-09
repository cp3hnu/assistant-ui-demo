"use client";

import type { ElementType } from "react";
import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import {
  AlertCircleIcon,
  CloudFogIcon,
  CloudIcon,
  CloudLightningIcon,
  CloudRainIcon,
  CloudSnowIcon,
  CloudSunIcon,
  DropletsIcon,
  LoaderIcon,
  MapPinIcon,
  SunIcon,
  ThermometerIcon,
  WindIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeatherResult, WeatherSuccess } from "@/tools/weather";

type WeatherArgs = {
  location: string;
};

const isWeatherError = (result: WeatherResult): result is Extract<WeatherResult, { error: string }> =>
  "error" in result;

const weatherIconForCode = (code: number) => {
  if (code === 0 || code === 1) return SunIcon;
  if (code === 2) return CloudSunIcon;
  if (code === 3) return CloudIcon;
  if (code === 45 || code === 48) return CloudFogIcon;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return CloudRainIcon;
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return CloudSnowIcon;
  }
  if (code >= 95) return CloudLightningIcon;
  return CloudIcon;
};

const formatPlace = (location: WeatherSuccess["location"]) =>
  [location.name, location.region, location.country].filter(Boolean).join(" · ");

const formatObservedAt = (observedAt: string, timeZone?: string) => {
  const date = new Date(observedAt);
  if (Number.isNaN(date.getTime())) return observedAt;

  try {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timeZone || undefined
    }).format(date);
  } catch {
    return observedAt;
  }
};

const WeatherCard = ({ result }: { result: WeatherSuccess }) => {
  const Icon = weatherIconForCode(result.weatherCode);

  return (
    <div data-slot="weather-tool-card" className="bg-muted/40 w-full max-w-sm overflow-hidden rounded-2xl border">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <MapPinIcon className="size-3.5 shrink-0" />
            <span className="truncate">{formatPlace(result.location)}</span>
          </div>
          <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">
            {Math.round(result.temperatureCelsius)}°
            <span className="text-muted-foreground ms-0.5 text-lg font-medium">C</span>
          </p>
          <p className="text-foreground/80 mt-1 text-sm">{result.condition}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            体感 {Math.round(result.apparentTemperatureCelsius)}°C ·{" "}
            {formatObservedAt(result.observedAt, result.location.timezone)}
          </p>
        </div>
        <div className="bg-background/70 text-foreground/80 flex size-12 shrink-0 items-center justify-center rounded-xl border">
          <Icon className="size-6" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px border-t bg-border/60">
        <Metric icon={DropletsIcon} label="湿度" value={`${Math.round(result.relativeHumidityPercent)}%`} />
        <Metric icon={WindIcon} label="风速" value={`${Math.round(result.windSpeedKilometersPerHour)} km/h`} />
        <Metric icon={ThermometerIcon} label="降水" value={`${result.precipitationMillimeters.toFixed(1)} mm`} />
      </div>
    </div>
  );
};

const Metric = ({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) => (
  <div className="bg-background/50 flex flex-col gap-1 px-3 py-2.5">
    <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
      <Icon className="size-3" />
      {label}
    </div>
    <p className="text-sm font-medium tabular-nums">{value}</p>
  </div>
);

export const WeatherToolUI: ToolCallMessagePartComponent<WeatherArgs, WeatherResult> = ({ args, status, result }) => {
  if (status.type === "running") {
    return (
      <div
        data-slot="weather-tool-loading"
        className={cn(
          "text-muted-foreground bg-muted/40 flex w-fit items-center gap-2 rounded-2xl border px-3 py-2 text-sm"
        )}
      >
        <LoaderIcon className="size-4 animate-spin animation-duration-[0.6s]" />
        <span>正在查询{args.location ? `「${args.location}」` : ""}天气…</span>
      </div>
    );
  }

  if (status.type === "incomplete" && status.reason === "cancelled") {
    return <div className="text-muted-foreground flex items-center gap-2 text-sm line-through">已取消天气查询</div>;
  }

  if (status.type === "incomplete" && status.reason === "error") {
    return (
      <div className="text-destructive flex items-center gap-2 text-sm">
        <AlertCircleIcon className="size-4 shrink-0" />
        获取「{args.location}」天气失败
      </div>
    );
  }

  if (!result) return null;

  if (isWeatherError(result)) {
    return (
      <div
        data-slot="weather-tool-error"
        className="bg-muted/40 text-muted-foreground flex w-fit max-w-sm items-start gap-2 rounded-2xl border px-3 py-2 text-sm"
      >
        <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
        <span>{result.error}</span>
      </div>
    );
  }

  return <WeatherCard result={result} />;
};
