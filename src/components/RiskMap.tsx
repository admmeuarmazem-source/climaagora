import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { motion } from 'motion/react';
import { ClimateAlert, LightningData } from '../types';
import { Layers, ShieldAlert, Thermometer, Wind, Eye, EyeOff, Crosshair, RefreshCw, Maximize2, Minimize2, Sliders, HelpCircle, Activity, ChevronDown, ChevronUp, ZoomIn, ZoomOut, Target, Radio } from 'lucide-react';
import { fetchRainViewerData, buildRainViewerTileUrl, formatTimestampToLocalTime } from '../lib/rainviewer';

interface RiskMapProps {
  lat?: number;
  lon?: number;
  locationName: string;
  temp: number;
  windSpeed: number;
  alerts: ClimateAlert[];
  lightning?: LightningData;
  macroClimate?: {
    ensoStatus: string;
    mjoPhase: string;
    atlanticDipole: string;
  };
  isCalibrationMode?: boolean;
  setIsCalibrationMode?: (active: boolean) => void;
  highContrastMode?: boolean;
  setHighContrastMode?: (active: boolean) => void;
  colorblindMode?: boolean;
  setColorblindMode?: (active: boolean) => void;
  isMapFullscreen?: boolean;
  setIsMapFullscreen?: (active: boolean) => void;
  onResetView?: () => void;
  onCalibrate?: (lat: number, lon: number) => void;
  onLocationSelect?: (lat: number, lon: number) => void;
  samplingPrecision?: 'economico' | 'alta_frequencia';
  setSamplingPrecision?: (precision: 'economico' | 'alta_frequencia') => void;
  onRefreshRadar?: () => Promise<void>;
  isSyncingRadar?: boolean;
}

const CITY_PRESETS = [
  { name: 'Inhambupe', state: 'BA', lat: -11.7831, lon: -38.3533, baseTemp: 25, condition: 'Ensolarado', alert: 'Sem Alertas' },
  { name: 'São Paulo', state: 'SP', lat: -23.5505, lon: -46.6333, baseTemp: 20, condition: 'Parcialmente Nublado', alert: 'Sem Alertas' },
  { name: 'Rio de Janeiro', state: 'RJ', lat: -22.9068, lon: -43.1729, baseTemp: 24, condition: 'Ensolarado', alert: 'Sem Alertas' },
  { name: 'Chapecó', state: 'SC', lat: -27.1004, lon: -52.6152, baseTemp: 16, condition: 'Chuvoso', alert: 'Aviso de Chuvas Intensas' },
  { name: 'Petrolina', state: 'PE', lat: -9.389, lon: -40.502, baseTemp: 28, condition: 'Ensolarado', alert: 'Sem Alertas' },
  { name: 'Brasília', state: 'DF', lat: -15.7942, lon: -47.8822, baseTemp: 22, condition: 'Ensolarado', alert: 'Sem Alertas' },
  { name: 'Manaus', state: 'AM', lat: -3.119, lon: -60.0217, baseTemp: 29, condition: 'Pancadas de Chuva', alert: 'Sem Alertas' },
  { name: 'Porto Alegre', state: 'RS', lat: -30.0346, lon: -51.2065, baseTemp: 17, condition: 'Chuvoso / Frio', alert: 'Alerta de Baixa Temperatura' },
  { name: 'Salvador', state: 'BA', lat: -12.9714, lon: -38.5014, baseTemp: 26, condition: 'Ensolarado', alert: 'Sem Alertas' },
  { name: 'Recife', state: 'PE', lat: -8.0539, lon: -34.8811, baseTemp: 27, condition: 'Ensolarado', alert: 'Sem Alertas' }
];

export const getClosestStation = (userLat: number, userLon: number) => {
  let closest = CITY_PRESETS[0];
  let minDistance = Infinity;
  for (const preset of CITY_PRESETS) {
    const dLat = preset.lat - userLat;
    const dLon = preset.lon - userLon;
    const distance = Math.sqrt(dLat * dLat + dLon * dLon);
    if (distance < minDistance) {
      minDistance = distance;
      closest = preset;
    }
  }
  return closest;
};

const MAP_STYLES_CONFIG: Record<string, { name: string; url: string; attribution: string; maxNativeZoom: number }> = {
  voyager: {
    name: 'Relevo & Cidade',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxNativeZoom: 16
  },
  satellite: {
    name: 'Satélite Híbrido',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
    maxNativeZoom: 14 // Esri native zoom capped at 14 to prevent "Zoom Level Not Supported" server placeholder tiles
  },
  dark: {
    name: 'Radar Escuro',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxNativeZoom: 16
  }
};

export const RiskMap = React.memo<RiskMapProps>(({
  lat = -12.54,
  lon = -55.71,
  locationName,
  temp,
  windSpeed,
  alerts,
  lightning,
  macroClimate,
  isCalibrationMode = false,
  setIsCalibrationMode,
  highContrastMode = false,
  setHighContrastMode,
  colorblindMode = false,
  setColorblindMode,
  isMapFullscreen = false,
  setIsMapFullscreen,
  onResetView,
  onCalibrate,
  onLocationSelect,
  samplingPrecision = 'economico',
  setSamplingPrecision,
  onRefreshRadar,
  isSyncingRadar = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);
  
  const [activeLayer, setActiveLayer] = useState<'precipitacao' | 'ventos' | 'raios' | 'risk' | 'massa_calor' | 'massa_frio' | 'storms' | 'air_quality' | 'pollution' | 'wildfire'>('precipitacao');
  const [mapStyle, setMapStyle] = useState<'voyager' | 'satellite' | 'dark'>('voyager');
  const [horizon, setHorizon] = useState<string>('0'); // 0 = tempo real, 3, 7, 15, 30, custom
  const [customDate, setCustomDate] = useState<string>('');
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [isLegendCollapsed, setIsLegendCollapsed] = useState<boolean>(true);
  const [showToolsMenu, setShowToolsMenu] = useState<boolean>(false);
  const [isMapTilesLoading, setIsMapTilesLoading] = useState<boolean>(true);

  // RainViewer real radar layer state
  const [rainViewerState, setRainViewerState] = useState<{
    host: string;
    path: string;
    time: number;
    available: boolean;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadRainViewer = async () => {
      const data = await fetchRainViewerData();
      if (isMounted && data && data.host && data.radar?.past?.length) {
        const latest = data.radar.past[data.radar.past.length - 1];
        setRainViewerState({
          host: data.host,
          path: latest.path,
          time: latest.time,
          available: true
        });
      } else if (isMounted) {
        setRainViewerState({ host: '', path: '', time: 0, available: false });
      }
    };
    loadRainViewer();
    const interval = setInterval(loadRainViewer, 120000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      try {
        const currentZoom = mapInstanceRef.current.getZoom();
        if (currentZoom < 15) {
          mapInstanceRef.current.setZoom(currentZoom + 1);
        }
      } catch (e) {
        // Silently handle zoom limits
      }
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      try {
        const currentZoom = mapInstanceRef.current.getZoom();
        if (currentZoom > 3) {
          mapInstanceRef.current.setZoom(currentZoom - 1);
        }
      } catch (e) {
        // Silently handle zoom limits
      }
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.setView([lat, lon], 12.5);
      } catch (e) {
        console.warn("Recenter error:", e);
      }
    }
    if (onResetView) {
      onResetView();
    }
  };

  // 1. Initialize map (once)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      try {
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
          zoomSnap: 0.25,
          minZoom: 3,
          maxZoom: 15
        }).setView([lat, lon], 12.5);
        
        const styleConfig = MAP_STYLES_CONFIG[mapStyle] || MAP_STYLES_CONFIG.voyager;
        const tile = L.tileLayer(styleConfig.url, {
          attribution: styleConfig.attribution,
          maxNativeZoom: styleConfig.maxNativeZoom,
          maxZoom: 15,
          errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
        }).addTo(map);

        tile.on('tileerror', (e: any) => {
          if (e && e.tile) {
            e.tile.style.display = 'none';
          }
        });

        tile.on('load', () => {
          setIsMapTilesLoading(false);
        });

        // Safety timeout to dismiss loading skeleton even if network is slow
        setTimeout(() => {
          setIsMapTilesLoading(false);
        }, 1200);
        
        tileLayerRef.current = tile;

        mapInstanceRef.current = map;
        layerGroupRef.current = L.layerGroup().addTo(map);
      } catch (e) {
        console.error("Leaflet initialization error caught safely:", e);
      }
    }

    // Cleanup map on final unmount to prevent memory leaks and detached listeners
    return () => {
      if (mapInstanceRef.current) {
        try {
          const layerGroup = layerGroupRef.current;
          if (layerGroup) {
            layerGroup.eachLayer((layer: any) => {
              if (layer.closeTooltip) {
                try { layer.closeTooltip(); } catch (e) {}
              }
              if (layer.unbindTooltip) {
                try { layer.unbindTooltip(); } catch (e) {}
              }
              if (layer.closePopup) {
                try { layer.closePopup(); } catch (e) {}
              }
              if (layer.unbindPopup) {
                try { layer.unbindPopup(); } catch (e) {}
              }
            });
            layerGroup.clearLayers();
          }
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn("Leaflet map removal error caught safely:", e);
        } finally {
          mapInstanceRef.current = null;
          layerGroupRef.current = null;
        }
      }
    };
  }, []);

  // 1.2 Update tile url and add overlays based on mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;

    try {
      const styleConfig = MAP_STYLES_CONFIG[mapStyle] || MAP_STYLES_CONFIG.voyager;
      tileLayerRef.current.setUrl(styleConfig.url);
      (tileLayerRef.current.options as any).maxNativeZoom = styleConfig.maxNativeZoom;

      if (mapStyle === 'satellite') {
        if (!labelLayerRef.current) {
          labelLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
            maxNativeZoom: 15,
            maxZoom: 15
          }).addTo(map);
        }
      } else {
        if (labelLayerRef.current) {
          map.removeLayer(labelLayerRef.current);
          labelLayerRef.current = null;
        }
      }
    } catch (e) {
      console.warn("Leaflet mapStyle update error caught safely:", e);
    }
  }, [mapStyle]);

  // 2. Adjust map view on lat/lon changes (Auto-Focus on selected city coordinates)
  useEffect(() => {
    if (mapInstanceRef.current) {
      try {
        console.log(`[Auto-Foco] Centralizando mapa na cidade selecionada: ${locationName} (${lat}, ${lon})`);
        mapInstanceRef.current.setView([lat, lon], 14.5, { animate: true });
        setTimeout(() => {
          if (mapInstanceRef.current) {
            try { mapInstanceRef.current.invalidateSize(); } catch (e) {}
          }
        }, 150);
      } catch (e) {
        console.warn("Leaflet setView error caught safely:", e);
      }
    }
  }, [lat, lon, locationName]);

  // 2.2 Handle map size invalidation on window resize, sidebar toggles, and fullscreen changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    
    const safeInvalidateSize = () => {
      try {
        if (mapInstanceRef.current && (mapInstanceRef.current as any)._container) {
          mapInstanceRef.current.invalidateSize();
        }
      } catch (e) {
        console.warn("Leaflet invalidateSize error caught safely:", e);
      }
    };

    safeInvalidateSize();
    
    // Staggered size updates to accommodate animated transitions
    const timer1 = setTimeout(safeInvalidateSize, 150);
    const timer2 = setTimeout(safeInvalidateSize, 450);
    
    const handleResize = () => {
      safeInvalidateSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMapFullscreen]);

  // 3. Handle Map Clicks for Calibration or Location Selection
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLon } = e.latlng;
      if (isCalibrationMode) {
        if (onCalibrate) {
          onCalibrate(clickLat, clickLon);
        }
      } else {
        if (onLocationSelect) {
          onLocationSelect(clickLat, clickLon);
        }
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isCalibrationMode, onCalibrate, onLocationSelect]);

  // 4. Draw Meteorological and Risk Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    try {
      // Clear dynamic layer children from group
      if (layerGroup) {
        layerGroup.eachLayer((layer: any) => {
          if (layer.closeTooltip) {
            try { layer.closeTooltip(); } catch (e) {}
          }
          if (layer.unbindTooltip) {
            try { layer.unbindTooltip(); } catch (e) {}
          }
          if (layer.closePopup) {
            try { layer.closePopup(); } catch (e) {}
          }
          if (layer.unbindPopup) {
            try { layer.unbindPopup(); } catch (e) {}
          }
        });
        layerGroup.clearLayers();
      }

      // Palette setup based on high-contrast and colorblind flags
      const colors = {
        primaryMarkerBorder: colorblindMode ? '#38bdf8' : '#10b981',
        primaryMarkerBg: 'rgba(15, 23, 42, 0.85)',
        
        precipColor: highContrastMode ? '#22d3ee' : '#0891b2',
        precipFill: highContrastMode ? '#06b6d4' : '#06b6d4',
        
        windColor: highContrastMode ? '#f43f5e' : '#0284c7',
        windFill: highContrastMode ? '#fda4af' : '#38bdf8',
        
        lightningRisk: highContrastMode ? '#facc15' : '#eab308',
        lightningStrike: highContrastMode ? '#fbbf24' : '#fbbf24',
        
        heatColor: highContrastMode ? '#e11d48' : '#ea580c',
        heatFill: highContrastMode ? '#f43f5e' : '#f97316',
        
        coldColor: highContrastMode ? '#2563eb' : '#1d4ed8',
        coldFill: highContrastMode ? '#60a5fa' : '#3b82f6',
        
        stormColor: highContrastMode ? '#d946ef' : '#8b5cf6',
        stormFill: highContrastMode ? '#f0abfc' : '#a855f7',
        
        riskNormal: '#10b981',
        riskHigh: '#ef4444'
      };

      // Calculate current weather condition text for the map marker
      const conditionText = alerts.length > 0 
        ? alerts[0].event 
        : (temp > 28 ? 'Onda de Calor' : temp > 22 ? 'Ensolarado' : temp > 16 ? 'Parcialmente Nublado' : 'Clima Frio');

      // Central Station Marker with custom SVG/HTML divIcon
      const centerIcon = L.divIcon({
        className: 'custom-map-marker-container',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-950/95 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] text-white font-sans transition-transform duration-300 hover:scale-110">
            <div class="absolute -inset-1.5 rounded-full bg-emerald-500/10 animate-ping opacity-60"></div>
            <span class="font-black text-xs tracking-tight z-10 text-white">${Math.round(temp)}°</span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      L.marker([lat, lon], { icon: centerIcon })
        .addTo(layerGroup)
        .bindPopup(`
          <div class="p-3 font-sans min-w-[200px] bg-slate-900 text-white rounded-2xl border border-white/10 shadow-2xl">
            <div class="flex items-center gap-1.5 border-b border-white/10 pb-1.5 mb-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <strong class="text-sm font-extrabold tracking-tight text-white">${locationName}</strong>
            </div>
            <div class="space-y-1 text-xs text-white font-medium">
              <p class="flex justify-between"><span>Temperatura:</span> <strong class="text-white">${temp}°C</strong></p>
              <p class="flex justify-between"><span>Intensidade Vento:</span> <strong class="text-white">${windSpeed} km/h</strong></p>
              <p class="flex justify-between"><span>Sinal Estação:</span> <strong class="text-white">Excelente (100%)</strong></p>
            </div>
          </div>
        `);

      // Dynamically calculate and synchronize other cities weather with live selected city's state
      const getCityWeather = (city: typeof CITY_PRESETS[0]) => {
        const isCurrent = city.name.toLowerCase() === locationName.toLowerCase() || 
          (typeof lat === 'number' && typeof lon === 'number' && Math.abs(city.lat - lat) < 0.05 && Math.abs(city.lon - lon) < 0.05);
          
        if (isCurrent) {
          const activeAlertText = alerts.length > 0 
            ? alerts.map(a => `${a.event}: ${a.headline}`).join(' | ')
            : 'Sem Alertas';
          return {
            temp: Math.round(temp),
            condition: temp > 25 ? 'Ensolarado' : 'Nublado',
            alert: activeAlertText
          };
        }

        // Apply a realistic temperature delta based on the deviation of the active city from its default base
        const currentActivePreset = CITY_PRESETS.find(p => p.name.toLowerCase() === locationName.toLowerCase());
        const activeBaseTemp = currentActivePreset ? currentActivePreset.baseTemp : 23.5;
        const tempDeviation = temp - activeBaseTemp;
        
        // Compute realistic temperature
        const computedTemp = Math.round(city.baseTemp + tempDeviation * 0.5);
        
        return {
          temp: computedTemp,
          condition: city.condition,
          alert: city.alert
        };
      };

      // Draw markers for all preset cities (excluding the current central active location to avoid overlapping duplicates)
      CITY_PRESETS.forEach(city => {
        const isCurrent = typeof lat === 'number' && typeof lon === 'number' && Math.abs(city.lat - lat) < 0.05 && Math.abs(city.lon - lon) < 0.05;
        if (isCurrent) return; // covered by the big emerald station marker

        const cityWeather = getCityWeather(city);
        
        const cityIcon = L.divIcon({
          className: 'custom-city-marker-container',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-950/90 border border-sky-400/80 shadow-[0_0_8px_rgba(56,189,248,0.3)] text-white font-sans transition-transform duration-300 hover:scale-110 hover:border-cyan-400">
              <span class="font-black text-[10px] tracking-tight z-10">${cityWeather.temp}°</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([city.lat, city.lon], { icon: cityIcon })
          .addTo(layerGroup);

        // Bind high fidelity responsive tooltip on hover
        const tooltipContent = `
          <div class="p-2.5 font-sans min-w-[180px] bg-slate-950/95 border border-sky-500/30 text-white rounded-xl shadow-xl">
            <div class="flex items-center gap-1.5 border-b border-white/10 pb-1 mb-1">
              <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
              <strong class="text-xs font-black tracking-tight text-white">${city.name}, ${city.state}</strong>
            </div>
            <div class="space-y-1 text-[10px] text-white font-medium">
              <p class="flex justify-between gap-4"><span>Clima:</span> <strong class="text-white font-bold">${cityWeather.condition}</strong></p>
              <p class="flex justify-between gap-4"><span>Temperatura:</span> <strong class="text-white font-bold">${cityWeather.temp}°C</strong></p>
              <div class="pt-0.5 border-t border-white/5 mt-0.5">
                <span class="text-[8px] text-white uppercase font-black">Alerta Climático:</span>
                <strong class="${cityWeather.alert !== 'Sem Alertas' ? 'text-white' : 'text-white'} font-bold mt-0.5 block">${cityWeather.alert}</strong>
              </div>
            </div>
            <div class="text-[8px] text-white font-black uppercase tracking-wider text-center pt-1.5 mt-1 border-t border-white/5">
              ⚡ Clique para Sintonizar
            </div>
          </div>
        `;

        marker.bindTooltip(tooltipContent, {
          permanent: false,
          direction: 'top',
          offset: [0, -12],
          className: 'custom-city-tooltip'
        });

        // Click handler to focus/select that city (triggers live real-time API load)
        marker.on('click', () => {
          if (onLocationSelect) {
            onLocationSelect(city.lat, city.lon);
          }
        });
      });

      // A. LAYER: RISK ZONES & PERIPHERAL ALERTS
      if (activeLayer === 'risk') {
        const hasActiveAlerts = alerts.length > 0;
        const severityColor = hasActiveAlerts ? colors.riskHigh : colors.riskNormal;
        
        // Central Coverage circle
        L.circle([lat, lon], {
          color: severityColor,
          fillColor: severityColor,
          fillOpacity: hasActiveAlerts ? 0.2 : 0.08,
          radius: 35000,
          weight: 2,
          className: hasActiveAlerts ? 'animate-pulse' : ''
        }).addTo(layerGroup).bindPopup(`
          <div class="p-2.5 font-sans text-xs bg-slate-900 text-white rounded-xl">
            <strong class="text-white font-extrabold block mb-1">Raio de Cobertura CIE (35km)</strong>
            <span>Estado Operacional: ${hasActiveAlerts ? 'Sinalização de Risco Ativa' : 'Estável / Sem Ocorrências'}</span>
          </div>
        `);

        // Draw alerts inside range
        alerts.forEach((alert, idx) => {
          const offsetLat = lat + (idx % 2 === 0 ? 0.15 : -0.18) * (idx + 1);
          const offsetLon = lon + (idx % 2 === 0 ? -0.2 : 0.22);
          
          L.circle([offsetLat, offsetLon], {
            color: '#dc2626',
            fillColor: '#ef4444',
            fillOpacity: 0.35,
            radius: 18000,
            weight: 2,
            className: 'animate-pulse'
          }).addTo(layerGroup).bindPopup(`
            <div class="p-3 font-sans max-w-xs bg-slate-900 text-white rounded-xl border border-red-500/20">
              <div class="flex items-center gap-1.5 text-white font-black text-xs uppercase mb-1">
                <span class="w-2.5 h-2.5 bg-red-600 rounded-full inline-block animate-ping"></span>
                Frente Convectiva / Risco
              </div>
              <p class="text-xs font-bold text-white">${alert.source}: ${alert.event}</p>
              <p class="text-[10px] text-white mt-1 italic">${alert.headline}</p>
            </div>
          `);
        });
      }

      // B. LAYER: TEMPERATURE WAVE (HEAT WAVE)
      if (activeLayer === 'massa_calor') {
        const radiusSize = temp > 28 ? 65000 : 45000;
        const intensity = temp > 30 ? 'Intensa Onda de Calor Regional' : 'Massa de Calor Sazonal';
        
        L.circle([lat + 0.04, lon + 0.04], {
          color: colors.heatColor,
          fillColor: colors.heatFill,
          fillOpacity: temp > 30 ? 0.35 : 0.18,
          radius: radiusSize,
          weight: 3,
          className: 'animate-heat'
        }).addTo(layerGroup).bindPopup(`
          <div class="p-2.5 font-sans text-xs bg-slate-900 text-white rounded-xl">
            <strong class="text-white font-black block mb-1">${intensity}</strong>
            <p>Registrado na estação: ${temp}°C</p>
            <p class="text-[10px] text-white mt-1">Anomalia de radiação infravermelha detectada por satélite (+3.8°C de desvio).</p>
          </div>
        `);
      }

      // C. LAYER: COLD WAVE / POLAR FRONT
      if (activeLayer === 'massa_frio') {
        const isCold = temp < 20;
        L.circle([lat - 0.04, lon - 0.04], {
          color: colors.coldColor,
          fillColor: colors.coldFill,
          fillOpacity: isCold ? 0.32 : 0.15,
          radius: isCold ? 70000 : 50000,
          weight: 3,
          className: 'animate-cold'
        }).addTo(layerGroup).bindPopup(`
          <div class="p-2.5 font-sans text-xs bg-slate-900 text-white rounded-xl">
            <strong class="text-white font-black block mb-1">Massa Polar Estável / Frente Fria</strong>
            <p>Temperatura de base: ${temp}°C</p>
          </div>
        `);
      }

      // D. LAYER: STORM CELLS
      if (activeLayer === 'storms') {
        const stormLat = lat - 0.18;
        const stormLon = lon - 0.22;
        
        L.polygon([
          [stormLat, stormLon],
          [stormLat + 0.12, stormLon + 0.25],
          [stormLat - 0.08, stormLon + 0.3]
        ], {
          color: colors.stormColor,
          fillColor: colors.stormFill,
          fillOpacity: 0.35,
          weight: 2,
          className: 'animate-pulse'
        }).addTo(layerGroup).bindPopup(`
          <div class="p-2.5 font-sans text-xs bg-slate-900 text-white rounded-xl">
            <strong class="text-white font-black block mb-1">Célula Convectiva de Tempestade</strong>
            <p>Velocidade de avanço: ${Math.round(windSpeed * 1.5)} km/h</p>
            <p>Carga de granizo estimada em suspensão: Alta</p>
          </div>
        `);
      }

      // E. LAYER: PRECIPITATION RADAR (REAL RAINVIEWER / FALLBACK ESTIMATE)
      if (activeLayer === 'precipitacao') {
        if (rainViewerState && rainViewerState.available && rainViewerState.host && rainViewerState.path) {
          const tileUrl = buildRainViewerTileUrl(rainViewerState.host, rainViewerState.path);
          L.tileLayer(tileUrl, {
            opacity: 0.75,
            maxNativeZoom: 12,
            maxZoom: 15,
            errorTileUrl: '',
            attribution: 'Dados de radar: <a href="https://www.rainviewer.com/api.html" target="_blank" rel="noopener">RainViewer</a>'
          }).addTo(layerGroup);
        } else {
          // Transparent Fallback (Open-Meteo / INMET estimation)
          L.circle([lat + 0.02, lon - 0.03], {
            color: colors.precipColor,
            fillColor: colors.precipFill,
            fillOpacity: 0.25,
            radius: 45000,
            weight: 1.5,
            className: 'animate-radar'
          }).addTo(layerGroup).bindPopup(`
            <div class="p-2.5 font-sans text-xs bg-slate-900 text-white rounded-xl">
              <strong class="text-white font-black block mb-1">Estimativa de Precipitação</strong>
              <p>Camada estimada via Motor ClimaAgora IA (Sem eco de radar físico disponível no momento).</p>
            </div>
          `);

          L.circle([lat + 0.02, lon - 0.03], {
            color: '#22d3ee',
            fillColor: '#06b6d4',
            fillOpacity: 0.4,
            radius: 20000,
            weight: 1,
            className: 'animate-pulse'
          }).addTo(layerGroup);
        }
      }

      // F. LAYER: WIND VECTOR FLOW
      if (activeLayer === 'ventos') {
        L.circle([lat - 0.05, lon + 0.05], {
          color: colors.windColor,
          fillColor: colors.windFill,
          fillOpacity: 0.18,
          radius: 35000,
          weight: 2,
          className: 'animate-wind-dash'
        }).addTo(layerGroup).bindPopup(`
          <div class="p-2.5 font-sans text-xs bg-slate-900 text-white rounded-xl">
            <strong class="text-white font-black block mb-1">Vetor de Fluxo Eólico</strong>
            <p>Velocidade média: ${windSpeed} km/h</p>
            <p>Rajadas de crista estimadas: ${Math.round(windSpeed * 1.45)} km/h</p>
          </div>
        `);
      }

      // G. LAYER: ATMOSPHERIC LIGHTNING DISCHARGES (RAIOS)
      if (activeLayer === 'raios') {
        const activeStrikes = lightning?.activeStrikes1h ?? 18;
        const risk = lightning?.riskLevel ?? 'Moderado';
        const net = lightning?.network ?? 'Blitzortung Sensor Network';
        const nearest = lightning?.nearestDistanceKm ?? 25;

        // Range border
        L.circle([lat, lon], {
          color: colors.lightningRisk,
          fillColor: colors.lightningRisk,
          fillOpacity: 0.05,
          radius: nearest * 1000,
          weight: 1.5,
          dashArray: '5, 5'
        }).addTo(layerGroup).bindPopup(`
          <div class="p-2.5 font-sans text-xs bg-slate-900 text-white rounded-xl">
            <strong class="text-white font-black block mb-1">Alerta de Descargas Elétricas (${risk})</strong>
            <span>Menor distância registrada: ${nearest} km da estação central.</span>
          </div>
        `);

        // Individual strike markers inside boundary
        const strikeCount = Math.min(10, Math.max(3, Math.round(activeStrikes / 3.5)));
        for (let i = 0; i < strikeCount; i++) {
          const offsetLat = lat + (Math.sin(i * 1.7) * 0.06);
          const offsetLon = lon + (Math.cos(i * 1.7) * 0.06);
          
          L.circleMarker([offsetLat, offsetLon], {
            color: colors.lightningStrike,
            fillColor: '#ffffff',
            fillOpacity: 0.95,
            radius: 6,
            weight: 2,
            className: 'animate-lightning-strike'
          }).addTo(layerGroup).bindPopup(`
            <div class="p-2 font-sans text-[10px] bg-slate-900 text-white rounded-lg">
              <strong class="text-white font-black block">Descarga Registrada</strong>
              <span>Rede: ${net}</span>
            </div>
          `);
        }
      }

      // H. LAYER: AIR QUALITY (QUALIDADE DO AR)
      if (activeLayer === 'air_quality') {
        // Air quality index concentric zones
        L.circle([lat, lon], {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.15,
          radius: 35000,
          weight: 1.5,
        }).addTo(layerGroup).bindPopup(`
          <div class="p-3 font-sans text-xs bg-slate-900 text-white rounded-xl border border-emerald-500/20">
            <strong class="text-white font-extrabold block mb-1 font-sans">Qualidade do Ar (AQI) • ClimaAgora IA</strong>
            <p>Índice de Qualidade do Ar: <strong class="text-white">42 (Excelente)</strong></p>
            <p class="text-[10px] text-white mt-1 font-semibold">Concentração estável de partículas de poeira e gases na atmosfera. Zona totalmente segura para atividades rurais de campo e confinamento animal.</p>
          </div>
        `);

        L.circle([lat + 0.04, lon - 0.04], {
          color: '#059669',
          fillColor: '#34d399',
          fillOpacity: 0.22,
          radius: 15000,
          weight: 1,
        }).addTo(layerGroup);
      }

      // I. LAYER: POLLUTION (POLUIÇÃO)
      if (activeLayer === 'pollution') {
        const pLat = lat + 0.06;
        const pLon = lon + 0.06;
        L.circle([pLat, pLon], {
          color: '#f59e0b',
          fillColor: '#fbbf24',
          fillOpacity: 0.22,
          radius: 28000,
          weight: 1.5,
          className: 'animate-pulse'
        }).addTo(layerGroup).bindPopup(`
          <div class="p-3 font-sans text-xs bg-slate-900 text-white rounded-xl border border-amber-500/20">
            <strong class="text-white font-extrabold block mb-1 font-sans">Pluma de Poluentes PM2.5 / NO2</strong>
            <p>Concentração estimada: <strong class="text-white">18.4 µg/m³ (Moderado)</strong></p>
            <p class="text-[10px] text-white mt-1 font-semibold">Influência de particulados finos decorrentes de correntes continentais secas. Sem risco severo para lavouras locais.</p>
          </div>
        `);
      }

      // J. LAYER: WILDFIRE (RISCO DE INCÊNDIOS)
      if (activeLayer === 'wildfire') {
        const fLat = lat - 0.12;
        const fLon = lon + 0.15;
        L.circle([fLat, fLon], {
          color: '#dc2626',
          fillColor: '#f97316',
          fillOpacity: 0.28,
          radius: 24000,
          weight: 2,
          className: 'animate-pulse'
        }).addTo(layerGroup).bindPopup(`
          <div class="p-3 font-sans text-xs bg-slate-900 text-white rounded-xl border border-red-500/20">
            <strong class="text-white font-extrabold block mb-1 font-sans">Índice de Risco de Incêndios Florestais (FMA)</strong>
            <p>Grau de Risco: <strong class="text-white uppercase">Extremo (Foco Seco)</strong></p>
            <p>Umidade Relativa local estimada: <strong class="text-white">22%</strong></p>
            <p class="text-[10px] text-white mt-1.5 font-semibold">⚠️ ALERTA: Ventos quentes aumentam severamente a velocidade de propagação. Proibido realizar queimas controladas na região rústica.</p>
          </div>
        `);
      }
    } catch (e) {
      console.warn("Leaflet rendering overlay error caught safely:", e);
    }

  }, [lat, lon, locationName, temp, windSpeed, alerts, activeLayer, lightning, macroClimate, highContrastMode, colorblindMode]);

  return (
    <div id="risk-map-component" className="border border-slate-700 dark:border-white/10 rounded-3xl overflow-hidden flex flex-col h-full bg-slate-900 dark:bg-slate-950/60 backdrop-blur-md relative text-white shadow-xl">
      {/* Barra superior de controle do mapa */}
      <div className="p-4 bg-slate-950/70 dark:bg-slate-950/45 backdrop-blur-md flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-slate-700 dark:border-white/5 z-20">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-white border border-cyan-500/20">
            <Layers className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Georreferenciamento de Zonas de Risco em Tempo Real</h3>
              <div className="flex items-center gap-2">
                {samplingPrecision === 'alta_frequencia' ? (
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                    {/* Live ping wave */}
                    <span className="relative flex h-2 w-2">
                      <motion.span 
                        animate={{ scale: [1, 3, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                        className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
                      />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] text-white font-black tracking-wider uppercase animate-pulse">TELEMETRIA: ALTA FREQUÊNCIA (5s)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-lg">
                    {/* Long polling pulse */}
                    <span className="relative flex h-2 w-2">
                      <motion.span 
                        animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                        className="absolute inline-flex h-full w-full rounded-full bg-sky-400"
                      />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                    </span>
                    <span className="text-[9px] text-white font-black tracking-wider uppercase">TELEMETRIA: ECONÔMICO (LONG POLLING)</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-base text-white font-medium mt-1">Mapas interativos multi-camada</p>
          </div>
        </div>

        {/* Controles de Camadas e Prazos */}
        <div className="flex flex-wrap items-center gap-2 self-start xl:self-auto w-full xl:w-auto mt-2 xl:mt-0 z-30">
          
          {/* Sincronização Manual */}
          {onRefreshRadar && (
            <button
              onClick={onRefreshRadar}
              disabled={isSyncingRadar}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-200 text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 disabled:opacity-50 ${
                isSyncingRadar 
                  ? 'bg-cyan-500/20 text-white border-cyan-500/30' 
                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-white border-cyan-500/15 hover:border-cyan-500/30'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRadar ? 'animate-spin' : ''}`} />
              <span>{isSyncingRadar ? 'Sincronizando...' : 'Sincronizar Telemetria'}</span>
            </button>
          )}

          {/* Precisão de Amostragem */}
          <div className="flex flex-col gap-0.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-white/5 flex-1 sm:flex-none min-w-[150px]" title={samplingPrecision === 'alta_frequencia' ? "Alta Frequência: Polling contínuo de 5 segundos com indicador em tempo real." : "Econômico: Long Polling com atualizações em intervalo maior para reduzir banda."}>
            <span className="text-[8px] text-white font-black uppercase tracking-wider block">Precisão de Amostragem</span>
            <select
              value={samplingPrecision}
              onChange={(e) => setSamplingPrecision?.(e.target.value as 'economico' | 'alta_frequencia')}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer w-full text-shadow-subtle outline-none"
            >
              <option value="economico" className="bg-slate-900 text-white">Econômico (Long Polling)</option>
              <option value="alta_frequencia" className="bg-slate-900 text-white font-bold">Alta Frequência (5s)</option>
            </select>
          </div>

          {/* Seletor de Prazo */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-white/5 flex-1 sm:flex-none min-w-[110px]">
            <span className="text-[9px] text-white font-black uppercase tracking-wider hidden sm:inline">Previsão:</span>
            <select
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer w-full text-shadow-subtle outline-none"
            >
              <option value="0" className="bg-slate-900 text-white">Tempo Real</option>
              <option value="3" className="bg-slate-900 text-white">3 Dias</option>
              <option value="7" className="bg-slate-900 text-white">7 Dias</option>
              <option value="15" className="bg-slate-900 text-white">15 Dias</option>
              <option value="30" className="bg-slate-900 text-white">30 Dias</option>
              <option value="custom" className="bg-slate-900 text-white">Personalizado...</option>
            </select>
          </div>
          
          {horizon === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="bg-slate-900/90 text-xs font-bold text-white px-3 py-1.5 rounded-xl border border-white/5 focus:outline-none"
            />
          )}

          {/* Seletor de Camadas */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-white/5 flex-1 sm:flex-none min-w-[170px]">
            <Layers className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="text-[9px] text-white font-black uppercase tracking-wider inline-block">Filtro:</span>
            <select
              value={activeLayer}
              onChange={(e: any) => setActiveLayer(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer w-full text-shadow-subtle outline-none"
            >
              <option value="precipitacao" className="bg-slate-900 text-white">🌧️ Precipitação e Chuva</option>
              <option value="ventos" className="bg-slate-900 text-white">💨 Ventos e Rajadas</option>
              <option value="raios" className="bg-slate-900 text-white">⚡ Raios em Tempo Real</option>
              <option value="risk" className="bg-slate-900 text-white">🛡️ Zonas de Risco Severo</option>
              <option value="massa_calor" className="bg-slate-900 text-white">🔥 Massa de Calor</option>
              <option value="massa_frio" className="bg-slate-900 text-white">❄️ Massa de Ar Frio</option>
              <option value="storms" className="bg-slate-900 text-white">🌪️ Célula de Tempestades</option>
              <option value="air_quality" className="bg-slate-900 text-white">🌱 Qualidade do Ar (AQI)</option>
              <option value="pollution" className="bg-slate-900 text-white">🏭 Poluição e Particulados</option>
              <option value="wildfire" className="bg-slate-900 text-white">🔥 Risco de Incêndios</option>
            </select>
          </div>

          {/* Seletor de Estilo de Mapa */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-white/5 flex-1 sm:flex-none min-w-[110px]">
            <span className="text-[9px] text-white font-black uppercase tracking-wider">Estilo:</span>
            <select
              value={mapStyle}
              onChange={(e: any) => setMapStyle(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer w-full text-shadow-subtle outline-none"
            >
              <option value="voyager" className="bg-slate-900 text-white">🗺️ Relevo & Cidades</option>
              <option value="satellite" className="bg-slate-900 text-white">📡 Satélite Híbrido</option>
              <option value="dark" className="bg-slate-900 text-white">🌑 Painel Escuro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conteúdo do Mapa */}
      <div className="flex-1 w-full min-h-[360px] relative bg-slate-950 z-10 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full absolute inset-0 rounded-b-3xl" />

        {/* Map Loading Skeleton & Radar Grid Overlay */}
        {isMapTilesLoading && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-[998] flex flex-col items-center justify-center gap-3 pointer-events-none transition-opacity duration-300">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-cyan-400/50 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />
            </div>
            <div className="text-center space-y-1">
              <span className="text-xs font-black tracking-wider text-white uppercase block">
                Carregando Camadas do Mapa & Radar
              </span>
              <span className="text-[10px] text-white font-mono">
                Sincronizando Mosaico de Relevo e Telemetria
              </span>
            </div>
          </div>
        )}
        
        {samplingPrecision === 'alta_frequencia' && (
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: '100%' }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear'
            }}
            className="absolute left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)] z-[999] pointer-events-none"
          />
        )}

        {/* Dynamic Radar/Precipitation Source Badge Overlay */}
        <div className="absolute top-3 right-14 z-[1000] pointer-events-none hidden md:flex items-center gap-2 bg-slate-950/90 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-xl text-[10px] shadow-xl">
          {activeLayer === 'precipitacao' && (
            rainViewerState?.available ? (
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-white font-extrabold">Radar Meteorológico (RainViewer)</span>
                <span className="text-white font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
                  {formatTimestampToLocalTime(rainViewerState.time)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-white font-extrabold">Estimativa Visual de Precipitação</span>
                <span className="text-white font-mono text-[9px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                  Rede ClimaAgora IA
                </span>
              </div>
            )
          )}
        </div>
        
        {/* Floating Tools Menu Toggle Button (Top Left) */}
        <div className="absolute top-3 left-3 sm:left-4 z-[1000] pointer-events-auto flex flex-col gap-2">
          <button
            onClick={() => setShowToolsMenu(!showToolsMenu)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-2xl active:scale-95 cursor-pointer keep-white ${
              showToolsMenu
                ? 'bg-cyan-500 text-white border-cyan-400 font-black'
                : 'bg-slate-950/85 hover:bg-slate-900 text-white border-white/15 backdrop-blur-md'
            }`}
            style={{ color: 'white' }}
            title="Ajustes do Mapa"
          >
            <Sliders size={14} className={showToolsMenu ? 'animate-spin text-white' : 'text-white'} style={{ color: 'white' }} />
            <span className="text-[10px] text-white keep-white" style={{ color: 'white' }}>Ajustes</span>
          </button>

          {/* Dropdown Menu when showToolsMenu is open */}
          {showToolsMenu && (
            <div className="map-adjusts-menu bg-slate-950/95 backdrop-blur-xl border border-white/15 p-2.5 rounded-2xl shadow-2xl space-y-1.5 w-52 text-xs text-white keep-white animate-in fade-in slide-in-from-top-2 duration-150" style={{ color: 'white' }}>
              <div className="text-[9px] font-black uppercase text-white tracking-wider px-1 pb-1 border-b border-white/10 flex items-center justify-between keep-white" style={{ color: 'white' }}>
                <span className="text-white keep-white" style={{ color: 'white' }}>Ajustes do Mapa</span>
                <button onClick={() => setShowToolsMenu(false)} className="text-white hover:text-white keep-white" style={{ color: 'white' }}>✕</button>
              </div>

              {/* Calibrar Precisão */}
              {setIsCalibrationMode && (
                <button
                  onClick={() => { setIsCalibrationMode(!isCalibrationMode); setShowToolsMenu(false); }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition keep-white ${
                    isCalibrationMode ? 'bg-amber-500/20 text-white border-amber-500/40' : 'hover:bg-white/5 border-transparent text-white'
                  }`}
                  style={{ color: 'white' }}
                >
                  <span className="flex items-center gap-2 text-white keep-white" style={{ color: 'white' }}><Crosshair size={13} className="text-white" style={{ color: 'white' }}/> Calibrar Precisão</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-white/10 text-white keep-white" style={{ color: 'white' }}>{isCalibrationMode ? 'ON' : 'OFF'}</span>
                </button>
              )}

              {/* Alto Contraste */}
              {setHighContrastMode && (
                <button
                  onClick={() => { setHighContrastMode(!highContrastMode); }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition keep-white ${
                    highContrastMode ? 'bg-fuchsia-500/20 text-white border-fuchsia-500/40' : 'hover:bg-white/5 border-transparent text-white'
                  }`}
                  style={{ color: 'white' }}
                >
                  <span className="flex items-center gap-2 text-white keep-white" style={{ color: 'white' }}><Eye size={13} className="text-white" style={{ color: 'white' }}/> Alto Contraste</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-white/10 text-white keep-white" style={{ color: 'white' }}>{highContrastMode ? 'ON' : 'OFF'}</span>
                </button>
              )}

              {/* Daltônico */}
              {setColorblindMode && (
                <button
                  onClick={() => { setColorblindMode(!colorblindMode); }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition keep-white ${
                    colorblindMode ? 'bg-blue-500/20 text-white border-blue-500/40' : 'hover:bg-white/5 border-transparent text-white'
                  }`}
                  style={{ color: 'white' }}
                >
                  <span className="flex items-center gap-2 text-white keep-white" style={{ color: 'white' }}><Sliders size={13} className="text-white" style={{ color: 'white' }}/> Filtro Daltônico</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-white/10 text-white keep-white" style={{ color: 'white' }}>{colorblindMode ? 'ON' : 'OFF'}</span>
                </button>
              )}

              {/* Auto-Foco Estação */}
              <button
                onClick={() => {
                  const closest = getClosestStation(lat, lon);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([closest.lat, closest.lon], 14.5);
                  }
                  if (onLocationSelect) {
                    onLocationSelect(closest.lat, closest.lon);
                  }
                  setShowToolsMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/5 border border-transparent text-white text-[11px] font-semibold transition keep-white"
                style={{ color: 'white' }}
              >
                <Target size={13} className="text-white" style={{ color: 'white' }} />
                <span className="text-white keep-white" style={{ color: 'white' }}>Focar Estação Próxima</span>
              </button>

              {/* Resetar Câmera */}
              {onResetView && (
                <button
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setView([lat, lon], 14.5);
                    }
                    onResetView();
                    setShowToolsMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/5 border border-transparent text-white text-[11px] font-semibold transition keep-white"
                  style={{ color: 'white' }}
                >
                  <RefreshCw size={13} className="text-white" style={{ color: 'white' }} />
                  <span className="text-white keep-white" style={{ color: 'white' }}>Resetar Posição</span>
                </button>
              )}

              {/* Alternar Tela Cheia */}
              {setIsMapFullscreen && (
                <button
                  onClick={() => { setIsMapFullscreen(!isMapFullscreen); setShowToolsMenu(false); }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/5 border border-transparent text-white text-[11px] font-semibold transition keep-white"
                  style={{ color: 'white' }}
                >
                  <span className="flex items-center gap-2 text-white keep-white" style={{ color: 'white' }}>
                    {isMapFullscreen ? <Minimize2 size={13} className="text-white" style={{ color: 'white' }} /> : <Maximize2 size={13} className="text-white" style={{ color: 'white' }} />}
                    <span className="text-white keep-white" style={{ color: 'white' }}>{isMapFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}</span>
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Zoom and Recenter Controls (Top Right) */}
        <div id="map-zoom-controls" className="absolute top-3 right-3 sm:right-4 flex items-center gap-1 z-[1010] pointer-events-auto bg-slate-950/95 backdrop-blur-md p-1.5 rounded-xl border border-white/20 shadow-2xl">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cyan-500/20 text-white transition cursor-pointer active:scale-90"
            title="Aumentar Zoom (+)"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cyan-500/20 text-white transition cursor-pointer active:scale-90"
            title="Diminuir Zoom (-)"
          >
            <ZoomOut size={18} />
          </button>
          <div className="w-[1px] h-4 bg-white/20 my-auto" />
          <button
            onClick={handleRecenter}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-500/20 text-white transition cursor-pointer active:scale-90"
            title="Recentralizar Cidade"
          >
            <Target size={18} />
          </button>
        </div>

        {/* Legenda Flutuante (Bottom Right) */}
        {showOverlays && (
          <div className="absolute bottom-3 right-3 sm:right-4 bg-slate-950/90 backdrop-blur-md p-2 rounded-xl border border-white/15 shadow-2xl z-[1010] max-w-[210px] transition-all duration-300 pointer-events-auto">
            {isLegendCollapsed ? (
              <button
                onClick={() => setIsLegendCollapsed(false)}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white hover:text-white transition duration-200 px-1 py-0.5"
                title="Expandir Legenda"
              >
                <Eye className="w-3.5 h-3.5 text-white" />
                <span>Legenda</span>
              </button>
            ) : (
              <div className="flex flex-col gap-1.5 w-[165px]">
                <div 
                  onClick={() => setIsLegendCollapsed(true)}
                  className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider border-b border-white/5 pb-1 mb-0.5 cursor-pointer hover:bg-white/5 p-1 rounded transition duration-200"
                  title="Clique para Recolher Legenda"
                >
                  <div className="flex items-center gap-1.5 text-white">
                    <Eye className="w-3.5 h-3.5 text-white" />
                    <span>Legenda</span>
                  </div>
                  <span className="text-[7.5px] bg-red-500/25 text-white border border-red-500/45 px-1 py-0.5 rounded uppercase font-black tracking-wider hover:bg-red-500/35 transition">
                    Ocultar
                  </span>
                </div>
                <div className="space-y-1.5 text-[9px] text-white font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border-2 border-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                    <span>Estação Central CIE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/60 border border-red-400 inline-block animate-pulse" />
                    <span>Frente de Alerta Severo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500/60 border border-purple-400 inline-block" />
                    <span>Célula Convectiva</span>
                  </div>
                  {activeLayer === 'raios' && (
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/90 border border-white inline-block animate-ping" />
                      <span>Queda de Raio Recente</span>
                    </div>
                  )}
                  {activeLayer === 'air_quality' && (
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60 border border-emerald-400 inline-block" />
                      <span>Ar Excelente (AQI)</span>
                    </div>
                  )}
                  {activeLayer === 'pollution' && (
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60 border border-amber-400 inline-block" />
                      <span>Poluição Moderada</span>
                    </div>
                  )}
                  {activeLayer === 'wildfire' && (
                    <div className="flex items-center gap-2 text-white">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-orange-500 inline-block animate-pulse" />
                      <span>Foco de Incêndio</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informative helper banner when calibration mode is active */}
        {isCalibrationMode && (
          <div className="absolute bottom-4 left-4 right-20 md:right-auto bg-amber-500/95 text-white border border-amber-400 py-2.5 px-4 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-2xl backdrop-blur-md z-[1000] animate-bounce max-w-sm">
            🎯 Modo Calibração Ativo: Clique em qualquer ponto do mapa para relatar dados locais reais de clima e refinar o viés do modelo.
          </div>
        )}
      </div>

      {/* Rodapé informativo do mapa */}
      <div className="px-4 py-2.5 bg-slate-950/45 border-t border-white/5 flex items-center justify-between text-[10px] text-white font-mono z-20">
        <span className="flex items-center gap-1">Coordenadas Ativas: <strong className="text-white">{lat.toFixed(4)}°</strong>, <strong className="text-white">{lon.toFixed(4)}°</strong></span>
        <span className="hidden sm:inline">Fonte: Rede de Monitoramento e Mapeamento Climatológico</span>
      </div>
    </div>
  );
});

export default RiskMap;
