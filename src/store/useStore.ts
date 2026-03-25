import { useState, useEffect } from 'react';

// ── 型定義 ──────────────────────────────────────
export type Priority = 'high' | 'mid' | 'low';

export interface Task {
  id: string;
  text: string;
  priority: Priority;
  done: boolean;
  date: string; // YYYY-MM-DD
}

export interface Medication {
  id: string;
  name: string;
  time: string; // "HH:MM"
  taken: boolean;
  takenDate: string; // YYYY-MM-DD
}

export interface Debt {
  id: string;
  name: string;
  total: number;
  remaining: number;
  monthlyPayment: number;
}

export interface WishItem {
  id: string;
  name: string;
  price: number;
  addedAt: number; // timestamp
  purchased: boolean;
}

export interface MoodRecord {
  date: string;
  mood: number; // 1-5
  tasksDone: number;
  medicationTaken: boolean;
  note: string;
}

export interface AppData {
  tasks: Task[];
  medications: Medication[];
  debts: Debt[];
  wishItems: WishItem[];
  moodRecords: MoodRecord[];
  impulseCount: number; // 今月我慢した回数
  lastImpulseMonth: string; // YYYY-MM
  loginPoints: number; // 累計ログインポイント
  lastLoginDate: string; // 最後にポイントを獲得した日 YYYY-MM-DD
  loginStreak: number; // 連続ログイン日数
}

// ── デフォルト値 ────────────────────────────────
const defaultData: AppData = {
  tasks: [],
  medications: [],
  debts: [],
  wishItems: [],
  moodRecords: [],
  impulseCount: 0,
  lastImpulseMonth: '',
  loginPoints: 0,
  lastLoginDate: '',
  loginStreak: 0,
};

// ── localStorage ユーティリティ ─────────────────
function loadData(): AppData {
  try {
    const raw = localStorage.getItem('maipeace');
    return raw ? { ...defaultData, ...JSON.parse(raw) } : defaultData;
  } catch {
    return defaultData;
  }
}

function saveData(data: AppData) {
  localStorage.setItem('maipeace', JSON.stringify(data));
}

// ── 日付ユーティリティ ──────────────────────────
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toYYYYMM(): string {
  return new Date().toISOString().slice(0, 7);
}

// ── カスタムフック ──────────────────────────────
export function useStore() {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const update = (partial: Partial<AppData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  // ── タスク ──
  const addTask = (text: string, priority: Priority) => {
    const task: Task = {
      id: crypto.randomUUID(),
      text,
      priority,
      done: false,
      date: today(),
    };
    update({ tasks: [...data.tasks, task] });
  };

  const toggleTask = (id: string) => {
    update({
      tasks: data.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    });
  };

  const deleteTask = (id: string) => {
    update({ tasks: data.tasks.filter((t) => t.id !== id) });
  };

  const todayTasks = data.tasks.filter((t) => t.date === today());

  // ── 薬 ──
  const addMedication = (name: string, time: string) => {
    const med: Medication = {
      id: crypto.randomUUID(),
      name,
      time,
      taken: false,
      takenDate: '',
    };
    update({ medications: [...data.medications, med] });
  };

  const toggleMedication = (id: string) => {
    update({
      medications: data.medications.map((m) => {
        if (m.id !== id) return m;
        const nowTaken = !m.taken || m.takenDate !== today();
        return { ...m, taken: nowTaken, takenDate: nowTaken ? today() : '' };
      }),
    });
  };

  const deleteMedication = (id: string) => {
    update({ medications: data.medications.filter((m) => m.id !== id) });
  };

  const todayMedications = data.medications.map((m) => ({
    ...m,
    taken: m.takenDate === today() && m.taken,
  }));

  // ── 借金 ──
  const addDebt = (name: string, total: number, remaining: number, monthly: number) => {
    const debt: Debt = {
      id: crypto.randomUUID(),
      name,
      total,
      remaining,
      monthlyPayment: monthly,
    };
    update({ debts: [...data.debts, debt] });
  };

  const payDebt = (id: string, amount: number) => {
    update({
      debts: data.debts.map((d) =>
        d.id === id ? { ...d, remaining: Math.max(0, d.remaining - amount) } : d
      ),
    });
  };

  const deleteDebt = (id: string) => {
    update({ debts: data.debts.filter((d) => d.id !== id) });
  };

  // ── ウィッシュリスト ──
  const addWishItem = (name: string, price: number) => {
    const item: WishItem = {
      id: crypto.randomUUID(),
      name,
      price,
      addedAt: Date.now(),
      purchased: false,
    };
    update({ wishItems: [...data.wishItems, item] });
  };

  const deleteWishItem = (id: string) => {
    update({ wishItems: data.wishItems.filter((w) => w.id !== id) });
  };

  const markWishPurchased = (id: string) => {
    update({
      wishItems: data.wishItems.map((w) =>
        w.id === id ? { ...w, purchased: true } : w
      ),
    });
  };

  // ── ログインポイント ──
  const checkLoginBonus = () => {
    const todayStr = today();
    if (data.lastLoginDate === todayStr) return false; // 今日すでに取得済み

    // 昨日ログインしていたか確認（連続ログイン判定）
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const isStreak = data.lastLoginDate === yesterdayStr;

    const newStreak = isStreak ? data.loginStreak + 1 : 1;
    // 7日連続なら3pt、3日連続なら2pt、それ以外は1pt
    const bonus = newStreak % 7 === 0 ? 3 : newStreak % 3 === 0 ? 2 : 1;

    update({
      loginPoints: data.loginPoints + bonus,
      lastLoginDate: todayStr,
      loginStreak: newStreak,
    });
    return bonus;
  };

  const todayBonusReceived = data.lastLoginDate === today();

  // 我慢カウント
  const addImpulseResist = () => {
    const month = toYYYYMM();
    const count = data.lastImpulseMonth === month ? data.impulseCount + 1 : 1;
    update({ impulseCount: count, lastImpulseMonth: month });
  };

  // ── 気分記録 ──
  const saveMoodRecord = (mood: number, note: string) => {
    const record: MoodRecord = {
      date: today(),
      mood,
      tasksDone: todayTasks.filter((t) => t.done).length,
      medicationTaken: todayMedications.some((m) => m.taken),
      note,
    };
    const others = data.moodRecords.filter((r) => r.date !== today());
    update({ moodRecords: [...others, record] });
  };

  return {
    data,
    // タスク
    addTask,
    toggleTask,
    deleteTask,
    todayTasks,
    // 薬
    addMedication,
    toggleMedication,
    deleteMedication,
    todayMedications,
    // 借金
    addDebt,
    payDebt,
    deleteDebt,
    // ウィッシュリスト
    addWishItem,
    deleteWishItem,
    markWishPurchased,
    addImpulseResist,
    // 気分
    saveMoodRecord,
    // ポイント
    checkLoginBonus,
    todayBonusReceived,
  };
}
