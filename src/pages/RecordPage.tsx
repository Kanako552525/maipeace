import { useState } from 'react';
import { useAppStore } from '../App';
import { today } from '../store/useStore';
import { Star } from 'lucide-react';

const MOOD_EMOJI = ['', '😞', '😕', '😐', '🙂', '😄'];
const MOOD_LABEL = ['', 'つらい', 'しんどい', 'ふつう', 'よかった', 'とてもよかった'];

export default function RecordPage() {
  const { data, saveMoodRecord, todayTasks } = useAppStore();
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const todayRecord = data.moodRecords.find((r) => r.date === today());

  const handleSave = () => {
    saveMoodRecord(mood, note);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const recentRecords = [...data.moodRecords]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  const doneTasks = todayTasks.filter((t) => t.done).length;
  const totalBadges = data.impulseCount + data.moodRecords.filter((r) => r.medicationTaken).length;

  return (
    <div className="px-4 pt-8 pb-4">
      <h1 className="text-xl font-bold text-gray-700 mb-1">きろく</h1>
      <p className="text-gray-400 text-xs mb-6">毎日の小さな積み重ねを記録しよう</p>

      {/* バッジ */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Star size={18} className="text-yellow-400" fill="#fbbf24" />
          <h2 className="font-semibold text-yellow-600 text-sm">がんばったポイント</h2>
        </div>
        <p className="text-3xl font-bold text-yellow-500">{totalBadges}<span className="text-sm font-normal ml-1">pt</span></p>
        <div className="mt-2 flex gap-3 text-xs text-yellow-500">
          <span>💊 服薬記録 {data.moodRecords.filter((r) => r.medicationTaken).length}回</span>
          <span>🛡️ 我慢 {data.impulseCount}回</span>
        </div>
      </div>

      {/* 今日の気分記録 */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <h2 className="font-semibold text-gray-600 text-sm mb-1">今日の気分を記録</h2>
        <p className="text-xs text-gray-400 mb-4">今日どうだった？正直に教えて</p>

        {todayRecord && !saved ? (
          <div className="text-center py-2">
            <p className="text-3xl mb-2">{MOOD_EMOJI[todayRecord.mood]}</p>
            <p className="text-sm text-gray-500">{MOOD_LABEL[todayRecord.mood]}</p>
            {todayRecord.note && <p className="text-xs text-gray-400 mt-2">「{todayRecord.note}」</p>}
            <button
              onClick={() => setSaved(false)}
              className="mt-3 text-xs text-blue-400 underline"
            >
              書き直す
            </button>
          </div>
        ) : saved ? (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">✨</p>
            <p className="text-sm text-green-500 font-medium">記録したよ！今日もお疲れさま</p>
          </div>
        ) : (
          <div>
            {/* 気分スライダー */}
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => setMood(v)}
                  className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all ${
                    mood === v ? 'bg-blue-50 scale-105' : ''
                  }`}
                >
                  <span className="text-2xl">{MOOD_EMOJI[v]}</span>
                  <span className="text-[9px] text-gray-400">{MOOD_LABEL[v]}</span>
                </button>
              ))}
            </div>

            {/* 今日できたこと */}
            <div className="bg-gray-50 rounded-xl p-3 mb-3">
              <p className="text-xs text-gray-500 mb-1">📝 今日できたこと・感じたこと（任意）</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="どんな小さなことでもOK"
                className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-600 outline-none border border-gray-100 resize-none"
                rows={2}
              />
            </div>

            <div className="bg-blue-50 rounded-xl p-2 mb-3 text-xs text-blue-400">
              今日のタスク達成：{doneTasks}個
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3 bg-blue-400 text-white rounded-xl text-sm font-medium shadow-sm active:scale-95 transition-transform"
            >
              記録する
            </button>
          </div>
        )}
      </div>

      {/* 最近7日間 */}
      {recentRecords.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-600 text-sm mb-3">最近の気分</h2>
          <div className="flex gap-2 justify-between">
            {recentRecords.map((r) => {
              const date = new Date(r.date);
              const day = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
              return (
                <div key={r.date} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xl">{MOOD_EMOJI[r.mood]}</span>
                  <div className="w-full bg-gray-100 rounded-full h-8 flex items-end justify-center overflow-hidden">
                    <div
                      className="w-full bg-blue-200 rounded-full transition-all"
                      style={{ height: `${(r.mood / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">{day}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 gap-2">
            <div className="bg-green-50 rounded-xl p-2 text-center">
              <p className="text-xs text-gray-400">服薬できた日</p>
              <p className="text-sm font-bold text-green-500">{recentRecords.filter((r) => r.medicationTaken).length}日</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-2 text-center">
              <p className="text-xs text-gray-400">タスク達成（平均）</p>
              <p className="text-sm font-bold text-blue-400">
                {recentRecords.length > 0
                  ? (recentRecords.reduce((s, r) => s + r.tasksDone, 0) / recentRecords.length).toFixed(1)
                  : 0}個
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
