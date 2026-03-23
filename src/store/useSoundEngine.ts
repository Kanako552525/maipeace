import { useState, useRef, useCallback } from 'react';

export type SoundType = 'brown' | 'white' | 'rain' | 'binaural' | null;

// ── ブラウンノイズ生成 ──────────────────────────
function createBrownNoise(ctx: AudioContext): AudioBufferSourceNode {
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

// ── ホワイトノイズ生成 ──────────────────────────
function createWhiteNoise(ctx: AudioContext): AudioBufferSourceNode {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

// ── レインノイズ生成（ブラウン+フィルター+変調）──
function createRainNoise(ctx: AudioContext): { source: AudioBufferSourceNode; nodes: AudioNode[] } {
  const source = createBrownNoise(ctx);

  // ローパスフィルター（雨っぽい高音を削る）
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1200;
  filter.Q.value = 0.5;

  // ゆっくり揺らぐ変調
  const gainNode = ctx.createGain();
  gainNode.gain.value = 0.8;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.15;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.15;
  lfo.connect(lfoGain);
  lfoGain.connect(gainNode.gain);
  lfo.start();

  source.connect(filter);
  filter.connect(gainNode);

  return { source, nodes: [filter, gainNode, lfo, lfoGain] };
}

// ── バイノーラルビート生成（40Hz ガンマ波）──────
// 左耳: 200Hz、右耳: 240Hz → 差分40Hz が脳内で生成
function createBinaural(ctx: AudioContext): { left: OscillatorNode; right: OscillatorNode; merger: ChannelMergerNode } {
  const merger = ctx.createChannelMerger(2);

  const leftOsc = ctx.createOscillator();
  leftOsc.type = 'sine';
  leftOsc.frequency.value = 200;
  const leftGain = ctx.createGain();
  leftGain.gain.value = 0.12;
  leftOsc.connect(leftGain);
  leftGain.connect(merger, 0, 0);
  leftOsc.start();

  const rightOsc = ctx.createOscillator();
  rightOsc.type = 'sine';
  rightOsc.frequency.value = 240; // 40Hz差 = ガンマ波（集中・認知機能）
  const rightGain = ctx.createGain();
  rightGain.gain.value = 0.12;
  rightOsc.connect(rightGain);
  rightGain.connect(merger, 0, 1);
  rightOsc.start();

  return { left: leftOsc, right: rightOsc, merger };
}

// ── カスタムフック ──────────────────────────────
export function useSoundEngine() {
  const [currentSound, setCurrentSound] = useState<SoundType>(null);
  const [volume, setVolumeState] = useState(0.5);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  const stopAll = useCallback(() => {
    nodesRef.current.forEach((node) => {
      try {
        if (node instanceof AudioBufferSourceNode || node instanceof OscillatorNode) {
          node.stop();
        }
        node.disconnect();
      } catch {}
    });
    nodesRef.current = [];
  }, []);

  const play = useCallback((type: SoundType) => {
    // 同じ音なら停止
    if (type === currentSound) {
      stopAll();
      setCurrentSound(null);
      return;
    }

    stopAll();

    if (!type) { setCurrentSound(null); return; }

    // AudioContext 初期化（ユーザー操作後に作成が必要）
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    // マスターゲイン
    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    const collected: AudioNode[] = [master];

    if (type === 'brown') {
      const source = createBrownNoise(ctx);
      source.connect(master);
      source.start();
      collected.push(source);
    } else if (type === 'white') {
      const source = createWhiteNoise(ctx);
      source.connect(master);
      source.start();
      collected.push(source);
    } else if (type === 'rain') {
      const { source, nodes } = createRainNoise(ctx);
      const last = nodes[1] as GainNode; // gainNode
      last.connect(master);
      source.start();
      collected.push(source, ...nodes);
    } else if (type === 'binaural') {
      const { left, right, merger } = createBinaural(ctx);
      merger.connect(master);
      collected.push(left, right, merger);
    }

    nodesRef.current = collected;
    setCurrentSound(type);
  }, [currentSound, volume, stopAll]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = v;
    }
  }, []);

  return { currentSound, play, stopAll, volume, setVolume };
}
