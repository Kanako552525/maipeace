import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../App';
import { Plus, Trash2, Play, Pause, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import type { Priority } from '../store/useStore';
import { useSoundEngine, type SoundType } from '../store/useSoundEngine';

const PRIORITY_LABELS: Record<Priority, string> = { high: '高', mid: '中', low: '低' };
const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'bg-red-50 text-red-400 border-red-100',
  mid: 'bg-yellow-50 text-yellow-500 border-yellow-100',
  low: 'bg-gray-50 text-gray-400 border-gray-100',
};

const MINI_TASKS = [
  'まず机の上を片付ける',
  'ファイルを開くだけでOK',
  '最初の1行だけ書く',
  'タイマーをセットするだけ',
  '必要なものを手元に揃える',
];

const SOUNDS: { type: SoundType; emoji: string; label: string; desc: string; color: string }[] = [
  { type: 'brown', emoji: '🌊', label: 'ブラウン', desc: '深い低音。最も集中しやすいとされる', color: 'bg-amber-50 border-amber-200 text-amber-600' },
  { type: 'white', emoji: '📻', label: 'ホワイト', desc: '均一なノイズ。周囲の音を遮断', color: 'bg-gray-50 border-gray-200 text-gray-500' },
  { type: 'rain', emoji: '🌧️', label: 'レイン', desc: '雨音。リラックスしながら集中', color: 'bg-blue-50 border-blue-200 text-blue-500' },
  { type: 'binaural', emoji: '🎧', label: 'バイノーラル', desc: '40Hzガンマ波。イヤホン推奨', color: 'bg-purple-50 border-purple-200 text-purple-500' },
];

export default function TaskPage() {
  const { todayTasks, addTask, toggleTask, deleteTask } = useAppStore();
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('mid');
  const [showForm, setShowForm] = useState(false);
  const { currentSound, play, volume, setVolume } = useSoundEngine();

  // 15分タイマー
  const [timerSec, setTimerSec] = useState(15 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimerSec((s) => {
          if (s <= 1) {
            setRunning(false);
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('まいぺーす', { body: '15分経ったよ！よく頑張った💙' });
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const resetTimer = () => { setRunning(false); setTimerSec(15 * 60); };
  const mm = String(Math.floor(timerSec / 60)).padStart(2, '0');
  const ss = String(timerSec % 60).padStart(2, '0');
  const timerProgress = 1 - timerSec / (15 * 60);
  const circumference = 2 * Math.PI * 52;

  const handleAdd = () => {
    if (!text.trim()) return;
    if (todayTasks.filter((t) => !t.done).length >= 3) {
      alert('今日のタスクは3つまでにしよう。まず目の前の1つに集中✨');
      return;
    }
    addTask(text.trim(), priority);
    setText('');
    setShowForm(false);
  };

  return (
    <div className="px-4 pt-8 pb-4">
      <h1 className="text-xl font-bold text-gray-700 mb-1">タスク</h1>
      <p className="text-gray-400 text-xs mb-6">今日やることは3つまで。それだけでOK</p>

      {/* 15分タイマー */}
      <div className="bg-white rounded-2xl p-5 mb-5 shadow-sm flex flex-col items-center">
        <p className="text-sm text-gray-500 mb-4 font-medium">15分だけ集中タイマー</p>
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#f0f0f0" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke={running ? '#60a5fa' : '#cbd5e1'}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - timerProgress)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-600 tabular-nums">{mm}:{ss}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setRunning((r) => !r)}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-400 text-white text-sm font-medium shadow-sm active:scale-95 transition-transform"
          >
            {running ? <Pause size={16} /> : <Play size={16} />}
            {running ? '一時停止' : 'スタート'}
          </button>
          <button
            onClick={resetTimer}
            className="p-2 rounded-full bg-gray-100 text-gray-400 active:scale-95 transition-transform"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* 集中サウンド */}
      <div className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {currentSound ? (
              <Volume2 size={17} className="text-blue-400" />
            ) : (
              <VolumeX size={17} className="text-gray-300" />
            )}
            <h2 className="font-semibold text-gray-600 text-sm">集中サウンド</h2>
          </div>
          {currentSound && (
            <span className="text-xs text-blue-400 font-medium animate-pulse">再生中♪</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {SOUNDS.map(({ type, emoji, label, desc, color }) => (
            <button
              key={type}
              onClick={() => play(type)}
              className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all active:scale-95 ${
                currentSound === type
                  ? color + ' shadow-sm scale-[1.02]'
                  : 'bg-gray-50 border-gray-100 text-gray-400'
              }`}
            >
              <span className="text-xl mb-1">{emoji}</span>
              <span className="text-xs font-semibold">{label}</span>
              <span className="text-[10px] leading-tight opacity-70 mt-0.5">{desc}</span>
            </button>
          ))}
        </div>

        {/* ボリューム */}
        {currentSound && (
          <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
            <VolumeX size={14} className="text-gray-300 shrink-0" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-1.5 accent-blue-400"
            />
            <Volume2 size={14} className="text-gray-400 shrink-0" />
          </div>
        )}

        <p className="text-[10px] text-gray-300 mt-2">
          ※ バイノーラルビートはイヤホン・ヘッドホンでお使いください
        </p>
      </div>

      {/* タスクリスト */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-600 text-sm">今日のタスク</h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1 text-blue-400 text-xs font-medium"
          >
            <Plus size={16} /> 追加
          </button>
        </div>

        {showForm && (
          <div className="mb-4 bg-blue-50 rounded-xl p-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="やること（短く書いてOK）"
              className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-600 outline-none border border-gray-100 mb-2"
              autoFocus
            />
            <div className="flex gap-2 mb-2">
              {(['high', 'mid', 'low'] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-1 rounded-lg text-xs font-medium border ${
                    priority === p ? PRIORITY_COLORS[p] : 'bg-white text-gray-300 border-gray-100'
                  }`}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
            <button
              onClick={handleAdd}
              className="w-full py-2 bg-blue-400 text-white rounded-lg text-sm font-medium"
            >
              追加する
            </button>
          </div>
        )}

        {todayTasks.length === 0 ? (
          <p className="text-gray-300 text-sm py-2">まだタスクがないよ。+から追加してね</p>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <button onClick={() => toggleTask(t.id)} className="flex-1 flex items-center gap-2 py-1 text-left">
                  <span className={`text-sm ${t.done ? 'line-through text-gray-300' : 'text-gray-600'}`}>
                    {t.text}
                  </span>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border shrink-0 ${PRIORITY_COLORS[t.priority]}`}>
                    {PRIORITY_LABELS[t.priority]}
                  </span>
                </button>
                <button onClick={() => deleteTask(t.id)} className="p-1 text-gray-200 active:text-red-300">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 手がつかないときヒント */}
      <div className="bg-blue-50 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-blue-400" />
          <h2 className="font-semibold text-blue-400 text-sm">手がつかないときは…</h2>
        </div>
        <p className="text-blue-300 text-xs mb-3">まず「2分でできること」だけやってみよう</p>
        <div className="space-y-1">
          {MINI_TASKS.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
              <span className="text-gray-500 text-xs">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
