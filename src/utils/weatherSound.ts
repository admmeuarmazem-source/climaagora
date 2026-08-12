// Ambient Weather Sound Generator using Web Audio API
// Synthesizes realistic weather audio (birds & street traffic for sunny, rain, snow, thunder/lightning, howling wind)

class WeatherSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private volume: number = 0.35;
  private currentCondition: string = 'Sunny';
  
  // Audio Nodes & Timers
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private windOsc: OscillatorNode | null = null;
  private windGain: GainNode | null = null;
  private thunderTimeout: any = null;
  private birdsInterval: any = null;
  private trafficTimeout: any = null;

  constructor() {
    // Read saved preference from localStorage
    const savedMute = localStorage.getItem('weather_sound_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    } else {
      this.isMuted = true; // Default off until user turns on
    }

    const savedVol = localStorage.getItem('weather_sound_volume');
    if (savedVol) {
      this.volume = parseFloat(savedVol);
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('weather_sound_muted', String(muted));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.1);
    }
    if (!muted) {
      this.initCtx();
      this.playConditionSound(this.currentCondition);
    } else {
      this.stopAll();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('weather_sound_volume', String(this.volume));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public playConditionSound(condition: string) {
    this.currentCondition = condition;
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    this.stopAll();

    const condLower = condition.toLowerCase();

    if (condLower.includes('storm') || condLower.includes('tempestade') || condLower.includes('raio') || condLower.includes('trov')) {
      // Tempestade: Chuva forte + raio/trovão
      this.startRainSound('heavy');
      this.scheduleThunder();
    } else if (condLower.includes('rain') || condLower.includes('chuva') || condLower.includes('chuvisco')) {
      // Chuva: Barulho de chuva caindo
      this.startRainSound(condLower.includes('chuvisco') ? 'light' : 'heavy');
    } else if (condLower.includes('snow') || condLower.includes('neve') || condLower.includes('geada')) {
      // Neve: Zuada de neve caindo / brisa de neve
      this.startSnowSound();
    } else if (condLower.includes('wind') || condLower.includes('vento') || condLower.includes('furacao') || condLower.includes('ciclone')) {
      // Vento forte: Zuada de vento
      this.startStrongWindSound();
    } else {
      // Ensolarado / Dia: Canto dos pássaros + barulho de carros passando na rua
      this.startSunnyBirdsAndTrafficSound();
    }
  }

  private createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 3; // 3 sec loop
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // 1. Ensolarado: Canto dos Pássaros + Carros na Rua
  private startSunnyBirdsAndTrafficSound() {
    if (!this.ctx || !this.masterGain) return;

    // Fundo constante suave de rua / tráfego distante
    const noiseBuffer = this.createPinkNoiseBuffer(this.ctx);
    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(280, this.ctx.currentTime); // Ruído de motor/rua abafado

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);

    this.noiseNode.start();

    // Agendar carros passando na rua
    this.scheduleCarPassing();

    // Agendar canto dos pássaros
    this.scheduleBirdChirps();
  }

  private scheduleCarPassing() {
    if (this.isMuted) return;
    const delay = Math.floor(Math.random() * 5000) + 4000; // 4-9s entre carros
    this.trafficTimeout = setTimeout(() => {
      this.playCarDriveBy();
      this.scheduleCarPassing();
    }, delay);
  }

  private playCarDriveBy() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const duration = 3.5;

    // Motor do carro com efeito Doppler (frequência sobe e desce)
    const carOsc = this.ctx.createOscillator();
    const carGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    carOsc.type = 'triangle';
    filter.type = 'lowpass';

    // Doppler: Frequência começa mais alta (aproximando), atinge pico e cai (afastando)
    carOsc.frequency.setValueAtTime(140, now);
    carOsc.frequency.linearRampToValueAtTime(160, now + 1.5);
    carOsc.frequency.exponentialRampToValueAtTime(100, now + duration);

    filter.frequency.setValueAtTime(250, now);
    filter.frequency.linearRampToValueAtTime(450, now + 1.5);
    filter.frequency.linearRampToValueAtTime(200, now + duration);

    // Volume aumenta e diminui conforme passa
    carGain.gain.setValueAtTime(0.01, now);
    carGain.gain.linearRampToValueAtTime(0.18, now + 1.5);
    carGain.gain.linearRampToValueAtTime(0.01, now + duration);

    carOsc.connect(filter);
    filter.connect(carGain);
    carGain.connect(this.masterGain);

    carOsc.start(now);
    carOsc.stop(now + duration);
  }

  private scheduleBirdChirps() {
    if (this.isMuted) return;
    const interval = Math.floor(Math.random() * 3000) + 2000; // 2-5s entre trinos
    this.birdsInterval = setTimeout(() => {
      this.playBirdChirp();
      this.scheduleBirdChirps();
    }, interval);
  }

  private playBirdChirp() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Padrão de canto de pássaro realista com trinos
    const chirpCount = Math.floor(Math.random() * 3) + 2; // 2 a 4 notas
    let noteTime = now;

    for (let i = 0; i < chirpCount; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startFreq = 2600 + Math.random() * 800;
      const endFreq = startFreq + (Math.random() > 0.5 ? 900 : -600);
      const duration = 0.08 + Math.random() * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, noteTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, noteTime + duration);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.12, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + duration);

      noteTime += duration + 0.04 + Math.random() * 0.05;
    }
  }

  // 2. Barulho de chuva caindo
  private startRainSound(type: 'light' | 'heavy') {
    if (!this.ctx || !this.masterGain) return;

    const noiseBuffer = this.createPinkNoiseBuffer(this.ctx);
    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(type === 'light' ? 900 : 1800, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(type === 'light' ? 0.18 : 0.38, this.ctx.currentTime);

    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);

    this.noiseNode.start();
  }

  // 3. Neve: Zuada de neve caindo
  private startSnowSound() {
    if (!this.ctx || !this.masterGain) return;

    const noiseBuffer = this.createPinkNoiseBuffer(this.ctx);
    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'highpass';
    this.filterNode.frequency.setValueAtTime(1100, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);

    this.noiseNode.start();
  }

  // 4. Ventando muito: Zuada de vento forte
  private startStrongWindSound() {
    if (!this.ctx || !this.masterGain) return;

    const noiseBuffer = this.createPinkNoiseBuffer(this.ctx);
    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'bandpass';
    this.filterNode.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(3.2, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    // LFO para rajadas de vento uivante
    this.windOsc = this.ctx.createOscillator();
    this.windOsc.frequency.setValueAtTime(0.25, this.ctx.currentTime);
    
    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(300, this.ctx.currentTime);

    this.windOsc.connect(this.windGain);
    this.windGain.connect(this.filterNode.frequency);

    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);

    this.noiseNode.start();
    this.windOsc.start();
  }

  // 5. Trovejando e Chovendo: Trovões e Raios
  private scheduleThunder() {
    if (this.isMuted) return;
    const nextThunder = Math.floor(Math.random() * 6000) + 4000; // 4-10s
    this.thunderTimeout = setTimeout(() => {
      this.playThunderClap();
      this.scheduleThunder();
    }, nextThunder);
  }

  private playThunderClap() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Estalo inicial do raio (lightning crackle)
    const crackleOsc = this.ctx.createOscillator();
    const crackleGain = this.ctx.createGain();
    crackleOsc.type = 'sawtooth';
    crackleOsc.frequency.setValueAtTime(1200, now);
    crackleOsc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    crackleGain.gain.setValueAtTime(0.3, now);
    crackleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    crackleOsc.connect(crackleGain);
    crackleGain.connect(this.masterGain);
    crackleOsc.start(now);
    crackleOsc.stop(now + 0.18);

    // Trovão grave prolongado
    const thunderOsc = this.ctx.createOscillator();
    const thunderGain = this.ctx.createGain();

    thunderOsc.type = 'sawtooth';
    thunderOsc.frequency.setValueAtTime(85, now + 0.05);
    thunderOsc.frequency.exponentialRampToValueAtTime(28, now + 2.8);

    thunderGain.gain.setValueAtTime(0.0, now + 0.05);
    thunderGain.gain.linearRampToValueAtTime(0.45, now + 0.2);
    thunderGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);

    thunderOsc.connect(filter);
    filter.connect(thunderGain);
    thunderGain.connect(this.masterGain);

    thunderOsc.start(now + 0.05);
    thunderOsc.stop(now + 3.2);
  }

  private stopAll() {
    if (this.thunderTimeout) {
      clearTimeout(this.thunderTimeout);
      this.thunderTimeout = null;
    }
    if (this.birdsInterval) {
      clearTimeout(this.birdsInterval);
      this.birdsInterval = null;
    }
    if (this.trafficTimeout) {
      clearTimeout(this.trafficTimeout);
      this.trafficTimeout = null;
    }
    if (this.noiseNode) {
      try { this.noiseNode.stop(); } catch (e) {}
      this.noiseNode.disconnect();
      this.noiseNode = null;
    }
    if (this.windOsc) {
      try { this.windOsc.stop(); } catch (e) {}
      this.windOsc.disconnect();
      this.windOsc = null;
    }
  }
}

export const weatherSound = new WeatherSoundEngine();

