import { useAppStore } from '../App';
import { CheckCircle2, Circle, Pill } from 'lucide-react';

const MESSAGES = [
  'おはよう！今日もじぶんのペースで💙',
  '昨日できたこと、ちゃんと覚えてるよ',
  'うまくいかなくても、それでいい',
  '小さな一歩が積み重なってる',
  '今日もよく頑張ってるね',
  '焦らなくていい。まいぺーすで',
];

function todayGreeting() {
  const h = new Date().getHours();
  if (h < 11) return 'おはよう ☀️';
  if (h < 17) return 'こんにちは 🌤️';
  return 'おつかれさま 🌙';
}

function todayMessage() {
  const d = new Date().getDate();
  return MESSAGES[d % MESSAGES.length];
}

export default function HomePage() {
  const { todayTasks, toggleTask, todayMedications, toggleMedication } = useAppStore();

  const doneTasks = todayTasks.filter((t) => t.done).length;
  const totalTasks = todayTasks.length;
  const allMedTaken = todayMedications.length > 0 && todayMedications.every((m) => m.taken);

  return (
    <div className="px-4 pt-8 pb-4">
      {/* あいさつ */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-700">{todayGreeting()}</h1>
        <p className="text-gray-400 text-sm mt-1">{todayMessage()}</p>
      </div>

      {/* 今日のお薬 */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Pill size={18} className="text-purple-400" />
          <h2 className="font-semibold text-gray-600 text-sm">今日のお薬</h2>
        </div>
        {todayMedications.length === 0 ? (
          <p className="text-gray-300 text-sm">お薬タブで薬を登録してね</p>
        ) : (
          <div className="space-y-2">
            {todayMedications.map((m) => (
              <button
                key={m.id}
                onClick={() => toggleMedication(m.id)}
                className="w-full flex items-center gap-3 py-1"
              >
                {m.taken ? (
                  <CheckCircle2 size={22} className="text-green-400 shrink-0" />
                ) : (
                  <Circle size={22} className="text-gray-200 shrink-0" />
                )}
                <span className={`text-sm ${m.taken ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                  {m.name}
                  <span className="text-gray-300 ml-2">{m.time}</span>
                </span>
              </button>
            ))}
            {allMedTaken && (
              <p className="text-green-400 text-xs mt-1">✨ 今日のお薬、全部飲んだね！</p>
            )}
          </div>
        )}
      </div>

      {/* 今日のタスク */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-600 text-sm">今日のタスク</h2>
          {totalTasks > 0 && (
            <span className="text-xs text-gray-400">{doneTasks}/{totalTasks}</span>
          )}
        </div>
        {todayTasks.length === 0 ? (
          <p className="text-gray-300 text-sm">タスクタブで今日のやることを追加してね</p>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTask(t.id)}
                className="w-full flex items-center gap-3 py-1"
              >
                {t.done ? (
                  <CheckCircle2 size={22} className="text-blue-400 shrink-0" />
                ) : (
                  <Circle size={22} className="text-gray-200 shrink-0" />
                )}
                <span className={`text-sm text-left ${t.done ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                  {t.text}
                </span>
                <span className={`ml-auto text-xs shrink-0 px-2 py-0.5 rounded-full ${
                  t.priority === 'high' ? 'bg-red-50 text-red-400' :
                  t.priority === 'mid' ? 'bg-yellow-50 text-yellow-500' :
                  'bg-gray-50 text-gray-400'
                }`}>
                  {t.priority === 'high' ? '高' : t.priority === 'mid' ? '中' : '低'}
                </span>
              </button>
            ))}
            {doneTasks === totalTasks && totalTasks > 0 && (
              <p className="text-blue-400 text-xs mt-1">🎉 今日のタスク全部できた！すごい！</p>
            )}
          </div>
        )}
      </div>

      {/* 今日の進捗バー */}
      {totalTasks > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-600 text-sm mb-3">今日の達成率</h2>
          <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-300 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${totalTasks === 0 ? 0 : (doneTasks / totalTasks) * 100}%` }}
            />
          </div>
          <p className="text-right text-xs text-gray-400 mt-1">
            {Math.round(totalTasks === 0 ? 0 : (doneTasks / totalTasks) * 100)}%
          </p>
        </div>
      )}
    </div>
  );
}
