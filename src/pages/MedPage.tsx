import { useState } from 'react';
import { useAppStore } from '../App';
import { Plus, Trash2, CheckCircle2, Circle, Bell } from 'lucide-react';

export default function MedPage() {
  const { todayMedications, addMedication, toggleMedication, deleteMedication } = useAppStore();
  const [name, setName] = useState('');
  const [time, setTime] = useState('08:00');
  const [showForm, setShowForm] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);

  const handleAdd = () => {
    if (!name.trim()) return;
    addMedication(name.trim(), time);
    setName('');
    setTime('08:00');
    setShowForm(false);
  };

  const requestNotification = async () => {
    if (!('Notification' in window)) {
      alert('このブラウザは通知に対応していません');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotifEnabled(true);
      new Notification('まいぺーす', { body: '通知の設定ができたよ！お薬の時間に教えるね💊' });
    } else {
      alert('通知が許可されませんでした。ブラウザの設定から許可してください。');
    }
  };

  const allTaken = todayMedications.length > 0 && todayMedications.every((m) => m.taken);

  return (
    <div className="px-4 pt-8 pb-4">
      <h1 className="text-xl font-bold text-gray-700 mb-1">お薬</h1>
      <p className="text-gray-400 text-xs mb-6">飲んだらタップ。それだけでOK</p>

      {/* 今日の状態 */}
      {allTaken && (
        <div className="bg-green-50 rounded-2xl p-4 mb-4 shadow-sm text-center">
          <p className="text-2xl mb-1">💊</p>
          <p className="text-green-500 font-medium text-sm">今日のお薬、全部飲んだね！えらい！</p>
        </div>
      )}

      {/* 通知設定 */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className={notifEnabled ? 'text-blue-400' : 'text-gray-300'} />
            <div>
              <p className="text-sm font-medium text-gray-600">お薬の通知</p>
              <p className="text-xs text-gray-400">飲み忘れを防ぐ通知を受け取る</p>
            </div>
          </div>
          {!notifEnabled ? (
            <button
              onClick={requestNotification}
              className="px-3 py-1.5 bg-blue-400 text-white rounded-lg text-xs font-medium"
            >
              オンにする
            </button>
          ) : (
            <span className="text-xs text-green-400 font-medium">設定済み✓</span>
          )}
        </div>
      </div>

      {/* 薬リスト */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-600 text-sm">登録中のお薬</h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-blue-400 text-xs font-medium flex items-center gap-1"
          >
            <Plus size={16} /> 追加
          </button>
        </div>

        {showForm && (
          <div className="mb-4 bg-blue-50 rounded-xl p-3 space-y-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="薬の名前（例：コンサータ）"
              className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-600 outline-none border border-gray-100"
              autoFocus
            />
            <div>
              <p className="text-xs text-gray-400 mb-1">飲む時間</p>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-600 outline-none border border-gray-100"
              />
            </div>
            <button
              onClick={handleAdd}
              className="w-full py-2 bg-blue-400 text-white rounded-lg text-sm font-medium"
            >
              登録する
            </button>
          </div>
        )}

        {todayMedications.length === 0 ? (
          <p className="text-gray-300 text-sm py-2">+から薬を追加してね</p>
        ) : (
          <div className="space-y-2">
            {todayMedications.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <button
                  onClick={() => toggleMedication(m.id)}
                  className="flex-1 flex items-center gap-3 py-2"
                >
                  {m.taken ? (
                    <CheckCircle2 size={24} className="text-green-400 shrink-0" />
                  ) : (
                    <Circle size={24} className="text-gray-200 shrink-0" />
                  )}
                  <div className="text-left">
                    <p className={`text-sm font-medium ${m.taken ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                      {m.name}
                    </p>
                    <p className="text-xs text-gray-400">{m.time}</p>
                  </div>
                  {m.taken && (
                    <span className="ml-auto text-xs bg-green-50 text-green-400 px-2 py-0.5 rounded-full">飲んだ✓</span>
                  )}
                </button>
                <button
                  onClick={() => deleteMedication(m.id)}
                  className="p-1 text-gray-200 active:text-red-300"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ひとこと */}
      <div className="mt-4 bg-purple-50 rounded-2xl p-4 shadow-sm">
        <p className="text-xs text-purple-400 font-medium mb-1">💡 飲み忘れたときは</p>
        <p className="text-xs text-purple-300">
          飲み忘れても自分を責めないで。次の服薬時間から再スタートでOK。
          心配なときはかかりつけの先生に相談してね。
        </p>
      </div>
    </div>
  );
}
