import { useMemo } from 'react';
import { WeatherCondition } from '../types';
import { Sun, Moon, CloudSun, CloudMoon, Cloud, CloudRain, CloudLightning, CloudFog } from 'lucide-react';

export type DayPeriod = 'dawn' | 'day' | 'sunset' | 'night';

export interface DayNightPhaseResult {
  period: DayPeriod;
  isNight: boolean;
  conditionText: string;
  conditionIcon: any; // Lucide Icon Component
  bgGradientClass: string;
  bgOverlayClass: string;
  themeColor: string;
}

interface UseDayNightPhaseProps {
  condition?: WeatherCondition | string;
  sunriseTime?: string; // "06:15" or ISO
  sunsetTime?: string;  // "18:22" or ISO
  currentTime?: string; // Optional HH:mm or ISO for target city
}

export function useDayNightPhase({
  condition = 'Sunny',
  sunriseTime = '06:15',
  sunsetTime = '18:20',
  currentTime
}: UseDayNightPhaseProps = {}): DayNightPhaseResult {
  return useMemo(() => {
    // 1. Parse current time in minutes from midnight
    let currentMinutes = 0;
    if (currentTime) {
      if (currentTime.includes(':')) {
        const parts = currentTime.split(':');
        const h = parseInt(parts[0], 10) || 0;
        const m = parseInt(parts[1], 10) || 0;
        currentMinutes = h * 60 + m;
      } else {
        const d = new Date(currentTime);
        if (!isNaN(d.getTime())) {
          currentMinutes = d.getHours() * 60 + d.getMinutes();
        }
      }
    } else {
      const now = new Date();
      currentMinutes = now.getHours() * 60 + now.getMinutes();
    }

    // 2. Parse sunrise & sunset in minutes
    let sunriseMinutes = 6 * 60 + 15; // default 06:15
    if (sunriseTime) {
      if (sunriseTime.includes(':')) {
        const parts = sunriseTime.split(':');
        sunriseMinutes = (parseInt(parts[0], 10) || 6) * 60 + (parseInt(parts[1], 10) || 15);
      } else {
        const d = new Date(sunriseTime);
        if (!isNaN(d.getTime())) sunriseMinutes = d.getHours() * 60 + d.getMinutes();
      }
    }

    let sunsetMinutes = 18 * 60 + 20; // default 18:20
    if (sunsetTime) {
      if (sunsetTime.includes(':')) {
        const parts = sunsetTime.split(':');
        sunsetMinutes = (parseInt(parts[0], 10) || 18) * 60 + (parseInt(parts[1], 10) || 20);
      } else {
        const d = new Date(sunsetTime);
        if (!isNaN(d.getTime())) sunsetMinutes = d.getHours() * 60 + d.getMinutes();
      }
    }

    // 3. Determine DayPeriod
    // Dawn: 30 minutes before sunrise to 30 minutes after sunrise
    // Sunset / Dusk: 90 minutes before sunset to sunset
    // Night: after sunset or before sunrise
    // Day: after dawn until sunset transition
    let period: DayPeriod = 'day';
    const isNight = currentMinutes < (sunriseMinutes - 30) || currentMinutes >= sunsetMinutes;

    if (currentMinutes >= (sunriseMinutes - 30) && currentMinutes <= (sunriseMinutes + 30)) {
      period = 'dawn';
    } else if (currentMinutes >= (sunsetMinutes - 90) && currentMinutes < sunsetMinutes) {
      period = 'sunset';
    } else if (isNight) {
      period = 'night';
    } else {
      period = 'day';
    }

    // 4. Map Condition Text according to Day/Night table requested
    const rawCond = (condition || '').toLowerCase();
    let conditionText = 'Ensolarado';
    let IconComponent: any = Sun;

    if (rawCond.includes('clear') || rawCond.includes('sunny') || rawCond.includes('ensolarado') || rawCond.includes('limpo')) {
      if (isNight) {
        conditionText = 'Céu Limpo';
        IconComponent = Moon;
      } else {
        conditionText = 'Ensolarado';
        IconComponent = Sun;
      }
    } else if (rawCond.includes('partly') || rawCond.includes('dispersa') || rawCond.includes('parcial')) {
      if (isNight) {
        conditionText = 'Nuvens Dispersas';
        IconComponent = CloudMoon;
      } else {
        conditionText = 'Parcialmente Nublado';
        IconComponent = CloudSun;
      }
    } else if (rawCond.includes('cloud') || rawCond.includes('overcast') || rawCond.includes('nublado')) {
      conditionText = 'Nublado';
      IconComponent = Cloud;
    } else if (rawCond.includes('rain') || rawCond.includes('chuva') || rawCond.includes('garoa') || rawCond.includes('drizzle')) {
      conditionText = 'Chuva';
      IconComponent = CloudRain;
    } else if (rawCond.includes('storm') || rawCond.includes('tempestade') || rawCond.includes('thunder') || rawCond.includes('vendaval')) {
      conditionText = 'Tempestade';
      IconComponent = CloudLightning;
    } else if (rawCond.includes('fog') || rawCond.includes('neblina') || rawCond.includes('nevoeiro')) {
      conditionText = 'Neblina';
      IconComponent = CloudFog;
    } else if (isNight) {
      conditionText = 'Céu Limpo';
      IconComponent = Moon;
    }

    // 5. Determine Background Gradient (Apple Weather Inspired)
    let bgGradientClass = 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600';
    let bgOverlayClass = '';
    let themeColor = '#0284c7';

    if (period === 'dawn') {
      bgGradientClass = 'bg-gradient-to-br from-amber-200 via-rose-300 to-indigo-500';
      themeColor = '#f43f5e';
    } else if (period === 'sunset') {
      bgGradientClass = 'bg-gradient-to-br from-amber-500 via-orange-600 to-purple-800';
      themeColor = '#ea580c';
    } else if (period === 'night') {
      bgGradientClass = 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900';
      bgOverlayClass = 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950/80 to-slate-950';
      themeColor = '#0f172a';
    } else {
      // Day
      if (conditionText === 'Chuva' || conditionText === 'Tempestade') {
        bgGradientClass = 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900';
        themeColor = '#334155';
      } else if (conditionText === 'Nublado') {
        bgGradientClass = 'bg-gradient-to-br from-slate-400 via-blue-400 to-slate-600';
        themeColor = '#64748b';
      }
    }

    return {
      period,
      isNight,
      conditionText,
      conditionIcon: IconComponent,
      bgGradientClass,
      bgOverlayClass,
      themeColor
    };
  }, [condition, sunriseTime, sunsetTime, currentTime]);
}
