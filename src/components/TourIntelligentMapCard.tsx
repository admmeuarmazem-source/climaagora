import React from 'react';
import { Activity, Crosshair } from 'lucide-react';
import RiskMap from './RiskMap';

interface ClimateAlert {
  source: string;
  event: string;
  headline: string;
}

interface TourIntelligentMapCardProps {
  isMapFullscreen: boolean;
  setIsMapFullscreen: (val: boolean) => void;
  manualLat: string;
  manualLon: string;
  selectedMapPoint: { x: number; y: number; label: string } | null;
  activeNotifications: Array<{ type: string; title: string; body: string }>;
  isMounted: boolean;
  loadingWeather: boolean;
  weather: any;
  currentCity: string;
  isCalibrationMode: boolean;
  setIsCalibrationMode: (val: boolean) => void;
  highContrastMode: boolean;
  setHighContrastMode: (val: boolean) => void;
  colorblindMode: boolean;
  setColorblindMode: (val: boolean) => void;
  setCurrentCity: (city: string) => void;
  setSelectedMapPoint: (pt: any) => void;
  handleLeafletCalibrate: (coords: any) => void;
  handleLeafletLocationSelect: (loc: any) => void;
  samplingPrecision: string;
  updateSamplingPrecision: (val: string) => void;
  handleRefreshRadar: () => void;
  isSyncingRadar: boolean;
  showCalibrationForm: boolean;
  setShowCalibrationForm: (val: boolean) => void;
  selectedCalibrateCoords: { lat: number; lon: number } | null;
  setSelectedCalibrateCoords: (coords: any) => void;
  handleCalibrationSubmit: (eventType: string, detailText: string) => void;
  getCoordsFromMapXY: (x: number, y: number) => { lat: number; lon: number };
}

export const TourIntelligentMapCard: React.FC<TourIntelligentMapCardProps> = ({
  isMapFullscreen,
  setIsMapFullscreen,
  manualLat,
  manualLon,
  selectedMapPoint,
  activeNotifications,
  isMounted,
  loadingWeather,
  weather,
  currentCity,
  isCalibrationMode,
  setIsCalibrationMode,
  highContrastMode,
  setHighContrastMode,
  colorblindMode,
  setColorblindMode,
  setCurrentCity,
  setSelectedMapPoint,
  handleLeafletCalibrate,
  handleLeafletLocationSelect,
  samplingPrecision,
  updateSamplingPrecision,
  handleRefreshRadar,
  isSyncingRadar,
  showCalibrationForm,
  setShowCalibrationForm,
  selectedCalibrateCoords,
  setSelectedCalibrateCoords,
  handleCalibrationSubmit,
  getCoordsFromMapXY
}) => {
  const parsedLat = parseFloat(manualLat);
  const parsedLon = parseFloat(manualLon);
  const currentCoords = (!isNaN(parsedLat) && !isNaN(parsedLon))
    ? { lat: parsedLat, lon: parsedLon }
    : (selectedMapPoint 
        ? getCoordsFromMapXY(selectedMapPoint.x, selectedMapPoint.y) 
        : { lat: -11.7831, lon: -38.3533 });

  const leafletAlerts: ClimateAlert[] = activeNotifications.map(notif => ({
    source: notif.type === 'storm' ? 'Radar Doppler / ClimaAgora' : 'CIE Agrotech',
    event: notif.title,
    headline: notif.body
  }));

  return (
    <div 
      id="tour-intelligent-map" 
      className={`relative transition-all duration-500 overflow-hidden w-full ${
        isMapFullscreen 
          ? 'fixed inset-4 z-[9999] bg-slate-950 rounded-3xl shadow-2xl border border-white/20' 
          : 'h-[500px] lg:h-[580px] rounded-3xl border border-slate-200 dark:border-white/15 shadow-2xl bg-slate-950/90'
      }`}
    >
      {!isMounted || (loadingWeather && !weather) ? (
        <div className="w-full h-full bg-slate-950/60 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-6 backdrop-blur-md">
          <Activity className="text-cyan-400 w-10 h-10 animate-spin mb-3" />
          <p className="text-xs font-black text-white uppercase tracking-wider">Carregando Radar Dinâmico...</p>
          <p className="text-[10px] text-slate-200 mt-1">Sintonizando telemetria de microrregião...</p>
        </div>
      ) : (
        <>
          <RiskMap
            lat={currentCoords.lat}
            lon={currentCoords.lon}
            locationName={weather?.city || currentCity}
            temp={weather?.temp ?? 20}
            windSpeed={weather?.windSpeed ?? 15}
            alerts={leafletAlerts}
            lightning={{
              activeStrikes1h: weather?.decisionCenter?.alerts?.status === 'critical' ? 32 : 12,
              riskLevel: weather?.decisionCenter?.alerts?.status === 'critical' ? 'Alto' : 'Moderado',
              network: 'Blitzortung Brasil Network',
              nearestDistanceKm: weather?.decisionCenter?.alerts?.status === 'critical' ? 12 : 38
            }}
            macroClimate={{
              ensoStatus: 'Neutro (Transição La Niña)',
              mjoPhase: 'Fase 4 (Oceano Índico)',
              atlanticDipole: 'Dipolo Positivo (+0.45°)'
            }}
            isCalibrationMode={isCalibrationMode}
            setIsCalibrationMode={setIsCalibrationMode}
            highContrastMode={highContrastMode}
            setHighContrastMode={setHighContrastMode}
            colorblindMode={colorblindMode}
            setColorblindMode={setColorblindMode}
            isMapFullscreen={isMapFullscreen}
            setIsMapFullscreen={setIsMapFullscreen}
            onResetView={() => {
              setCurrentCity('Inhambupe');
              setSelectedMapPoint({ x: 710, y: 280, label: 'Inhambupe' });
            }}
            onCalibrate={handleLeafletCalibrate}
            onLocationSelect={handleLeafletLocationSelect}
            samplingPrecision={samplingPrecision}
            setSamplingPrecision={updateSamplingPrecision}
            onRefreshRadar={handleRefreshRadar}
            isSyncingRadar={isSyncingRadar}
          />

          {/* Floating glassmorphism calibration input form overlay */}
          {showCalibrationForm && selectedCalibrateCoords && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[2000] pointer-events-auto">
              <div className="bg-slate-900 border-2 border-amber-500 p-6 rounded-3xl max-w-sm w-full shadow-2xl flex flex-col gap-4 animate-scaleUp">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Crosshair size={14} className="animate-pulse" />
                    Calibração de Precisão
                  </span>
                  <button 
                    onClick={() => { setShowCalibrationForm(false); setSelectedCalibrateCoords(null); }}
                    className="text-slate-200 hover:text-white text-sm font-bold bg-white/5 hover:bg-white/10 w-6 h-6 rounded-full flex items-center justify-center transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <p className="text-[11px] text-slate-300 font-bold">Relatar evento climático real nas coordenadas:</p>
                  <p className="text-[10px] text-sky-400 font-mono mt-1 bg-slate-950 py-1.5 px-2.5 rounded-lg border border-white/5">
                    Latitude: {selectedCalibrateCoords.lat.toFixed(4)}° | Longitude: {selectedCalibrateCoords.lon.toFixed(4)}°
                  </p>
                </div>

                <div className="flex flex-col gap-3 mt-1">
                  <div>
                    <label className="text-[9px] font-extrabold text-slate-200 uppercase tracking-wider block mb-1">Fenômeno Observado</label>
                    <select 
                      id="cal-event-type"
                      className="w-full bg-slate-950 border border-white/15 text-xs text-white rounded-xl p-2.5 outline-none focus:border-amber-400 font-bold cursor-pointer"
                    >
                      <option value="Rainy">Chuva Moderada / Precipitação ativa</option>
                      <option value="Storm">Tempestade / Rajadas / Granizo</option>
                      <option value="Wind">Vento Extremo / Ventania severa</option>
                      <option value="Sunny">Céu Limpo / Tempo Aberto</option>
                      <option value="Cloudy">Muito Nublado / Neblina / Nevoeiro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-extrabold text-slate-200 uppercase tracking-wider block mb-1">Descrição Local (Opcional)</label>
                    <textarea 
                      id="cal-detail-input"
                      placeholder="Ex: Está chovendo muito forte com granizo miúdo neste momento..."
                      rows={3}
                      className="w-full bg-slate-950 border border-white/15 text-xs text-white rounded-xl p-2.5 outline-none focus:border-amber-400 resize-none font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 mt-2">
                  <button 
                    onClick={() => {
                      const eventType = (document.getElementById('cal-event-type') as HTMLSelectElement)?.value || 'Rainy';
                      const detailText = (document.getElementById('cal-detail-input') as HTMLTextAreaElement)?.value || '';
                      handleCalibrationSubmit(eventType, detailText);
                    }}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2.5 rounded-xl uppercase tracking-wider transition active:scale-95 cursor-pointer"
                  >
                    Registrar Feedback (Tuning)
                  </button>
                  <button 
                    onClick={() => { setShowCalibrationForm(false); setSelectedCalibrateCoords(null); }}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TourIntelligentMapCard;
