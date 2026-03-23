import { useState } from 'react';
import { useAppStore } from '../App';
import { Plus, Trash2, Clock, ShieldCheck, CreditCard } from 'lucide-react';

const COOLING_HOURS = 72;

function hoursLeft(addedAt: number): number {
  const diff = Date.now() - addedAt;
  const h = diff / (1000 * 60 * 60);
  return Math.max(0, COOLING_HOURS - h);
}

export default function MoneyPage() {
  const { data, addDebt, deleteDebt, payDebt, addWishItem, deleteWishItem, markWishPurchased, addImpulseResist } = useAppStore();

  const [tab, setTab] = useState<'debt' | 'wish'>('debt');

  // 借金フォーム
  const [debtName, setDebtName] = useState('');
  const [debtTotal, setDebtTotal] = useState('');
  const [debtRemaining, setDebtRemaining] = useState('');
  const [debtMonthly, setDebtMonthly] = useState('');
  const [showDebtForm, setShowDebtForm] = useState(false);

  // ウィッシュリストフォーム
  const [wishName, setWishName] = useState('');
  const [wishPrice, setWishPrice] = useState('');
  const [showWishForm, setShowWishForm] = useState(false);

  const handleAddDebt = () => {
    if (!debtName || !debtRemaining) return;
    addDebt(debtName, Number(debtTotal) || 0, Number(debtRemaining), Number(debtMonthly) || 0);
    setDebtName(''); setDebtTotal(''); setDebtRemaining(''); setDebtMonthly('');
    setShowDebtForm(false);
  };

  const handleAddWish = () => {
    if (!wishName) return;
    addWishItem(wishName, Number(wishPrice) || 0);
    setWishName(''); setWishPrice('');
    setShowWishForm(false);
  };

  const totalDebt = data.debts.reduce((s, d) => s + d.remaining, 0);
  const activeWishes = data.wishItems.filter((w) => !w.purchased);
  const month = new Date().toISOString().slice(0, 7);
  const impulseCount = data.lastImpulseMonth === month ? data.impulseCount : 0;

  return (
    <div className="px-4 pt-8 pb-4">
      <h1 className="text-xl font-bold text-gray-700 mb-1">お金</h1>
      <p className="text-gray-400 text-xs mb-4">お金の流れを少しずつ把握しよう</p>

      {/* 我慢バッジ */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-4 shadow-sm flex items-center gap-3">
        <ShieldCheck size={28} className="text-green-400" />
        <div>
          <p className="text-xs text-green-500 font-medium">今月の衝動買い我慢回数</p>
          <p className="text-2xl font-bold text-green-500">{impulseCount}<span className="text-sm font-normal ml-1">回</span></p>
        </div>
      </div>

      {/* タブ */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
        <button
          onClick={() => setTab('debt')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'debt' ? 'bg-white text-gray-600 shadow-sm' : 'text-gray-400'
          }`}
        >
          借金管理
        </button>
        <button
          onClick={() => setTab('wish')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'wish' ? 'bg-white text-gray-600 shadow-sm' : 'text-gray-400'
          }`}
        >
          ウィッシュリスト
        </button>
      </div>

      {tab === 'debt' && (
        <div>
          {/* 合計 */}
          {data.debts.length > 0 && (
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">現在の借金合計</p>
              <p className="text-2xl font-bold text-gray-700">¥{totalDebt.toLocaleString()}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-600 text-sm flex items-center gap-2">
                <CreditCard size={16} className="text-gray-400" /> 借金リスト
              </h2>
              <button onClick={() => setShowDebtForm((v) => !v)} className="text-blue-400 text-xs font-medium flex items-center gap-1">
                <Plus size={16} /> 追加
              </button>
            </div>

            {showDebtForm && (
              <div className="mb-4 bg-blue-50 rounded-xl p-3 space-y-2">
                <input value={debtName} onChange={(e) => setDebtName(e.target.value)} placeholder="借金の名前（例：カードローン）" className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-600 outline-none border border-gray-100" />
                <input value={debtRemaining} onChange={(e) => setDebtRemaining(e.target.value)} type="number" placeholder="残高（円）" className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-600 outline-none border border-gray-100" />
                <input value={debtMonthly} onChange={(e) => setDebtMonthly(e.target.value)} type="number" placeholder="月々の返済額（円）" className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-600 outline-none border border-gray-100" />
                <button onClick={handleAddDebt} className="w-full py-2 bg-blue-400 text-white rounded-lg text-sm font-medium">登録する</button>
              </div>
            )}

            {data.debts.length === 0 ? (
              <p className="text-gray-300 text-sm py-2">借金を登録してみよう。把握するだけで気持ちが楽になるよ</p>
            ) : (
              <div className="space-y-3">
                {data.debts.map((d) => {
                  const months = d.monthlyPayment > 0 ? Math.ceil(d.remaining / d.monthlyPayment) : null;
                  const progress = d.total > 0 ? ((d.total - d.remaining) / d.total) * 100 : 0;
                  return (
                    <div key={d.id} className="border border-gray-100 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-600">{d.name}</span>
                        <button onClick={() => deleteDebt(d.id)} className="text-gray-200 active:text-red-300"><Trash2 size={14} /></button>
                      </div>
                      <p className="text-lg font-bold text-gray-700 mb-1">¥{d.remaining.toLocaleString()}</p>
                      {d.total > 0 && (
                        <div className="bg-gray-100 rounded-full h-2 mb-1">
                          <div className="h-full bg-green-300 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      )}
                      {months !== null && (
                        <p className="text-xs text-gray-400">このペースであと約{months}ヶ月で完済</p>
                      )}
                      <button
                        onClick={() => {
                          const amt = prompt('返済した金額を入力してください（円）');
                          if (amt && !isNaN(Number(amt))) payDebt(d.id, Number(amt));
                        }}
                        className="mt-2 text-xs text-blue-400 font-medium"
                      >
                        + 返済を記録する
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'wish' && (
        <div>
          <div className="bg-amber-50 rounded-2xl p-4 mb-4 shadow-sm">
            <p className="text-xs text-amber-600 font-medium mb-1">💡 72時間ルール</p>
            <p className="text-xs text-amber-500">「欲しい！」と思ったらまずここに登録。72時間後にまだ欲しかったら考えよう</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-600 text-sm">ほしいものリスト</h2>
              <button onClick={() => setShowWishForm((v) => !v)} className="text-blue-400 text-xs font-medium flex items-center gap-1">
                <Plus size={16} /> 追加
              </button>
            </div>

            {showWishForm && (
              <div className="mb-4 bg-amber-50 rounded-xl p-3 space-y-2">
                <input value={wishName} onChange={(e) => setWishName(e.target.value)} placeholder="ほしいもの" className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-600 outline-none border border-gray-100" />
                <input value={wishPrice} onChange={(e) => setWishPrice(e.target.value)} type="number" placeholder="金額（円）" className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-600 outline-none border border-gray-100" />
                <button onClick={handleAddWish} className="w-full py-2 bg-amber-400 text-white rounded-lg text-sm font-medium">72時間待ちリストに追加</button>
              </div>
            )}

            {activeWishes.length === 0 ? (
              <p className="text-gray-300 text-sm py-2">「欲しい！」と思ったらここに登録してみよう</p>
            ) : (
              <div className="space-y-3">
                {activeWishes.map((w) => {
                  const left = hoursLeft(w.addedAt);
                  const canBuy = left === 0;
                  return (
                    <div key={w.id} className={`border rounded-xl p-3 ${canBuy ? 'border-green-100 bg-green-50' : 'border-gray-100'}`}>
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{w.name}</p>
                          {w.price > 0 && <p className="text-xs text-gray-400">¥{w.price.toLocaleString()}</p>}
                        </div>
                        <button onClick={() => deleteWishItem(w.id)} className="text-gray-200 active:text-red-300 mt-0.5"><Trash2 size={14} /></button>
                      </div>
                      {canBuy ? (
                        <div>
                          <p className="text-xs text-green-500 font-medium mb-2">72時間経過！まだ欲しい？</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => markWishPurchased(w.id)}
                              className="flex-1 py-1.5 bg-green-400 text-white rounded-lg text-xs font-medium"
                            >
                              買う
                            </button>
                            <button
                              onClick={() => { deleteWishItem(w.id); addImpulseResist(); }}
                              className="flex-1 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium"
                            >
                              やめる🎉
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-amber-400" />
                          <p className="text-xs text-amber-500">あと{Math.ceil(left)}時間待ってみよう</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
