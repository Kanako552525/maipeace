import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Home, CheckSquare, Wallet, Pill, BookHeart, Star } from 'lucide-react';
import HomePage from './pages/HomePage';
import TaskPage from './pages/TaskPage';
import MoneyPage from './pages/MoneyPage';
import MedPage from './pages/MedPage';
import RecordPage from './pages/RecordPage';
import ReviewPage from './pages/ReviewPage';
import { useStore } from './store/useStore';
import { createContext, useContext } from 'react';

const StoreContext = createContext<ReturnType<typeof useStore> | null>(null);
export const useAppStore = () => useContext(StoreContext)!;

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'ホーム' },
  { to: '/task', icon: CheckSquare, label: 'タスク' },
  { to: '/money', icon: Wallet, label: 'お金' },
  { to: '/med', icon: Pill, label: 'お薬' },
  { to: '/record', icon: BookHeart, label: 'きろく' },
  { to: '/review', icon: Star, label: '口コミ' },
];

function BottomNav() {
  const location = useLocation();
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 flex z-50 shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
        const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
        return (
          <NavLink key={to} to={to} className="flex-1 flex flex-col items-center py-2 gap-0.5">
            <Icon size={22} className={isActive ? 'text-blue-400' : 'text-gray-300'} />
            <span className={`text-[10px] font-medium ${isActive ? 'text-blue-400' : 'text-gray-300'}`}>
              {label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function Layout() {
  return (
    <div className="pb-20 min-h-svh">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/task" element={<TaskPage />} />
        <Route path="/money" element={<MoneyPage />} />
        <Route path="/med" element={<MedPage />} />
        <Route path="/record" element={<RecordPage />} />
        <Route path="/review" element={<ReviewPage />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default function App() {
  const store = useStore();
  return (
    <StoreContext.Provider value={store}>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </StoreContext.Provider>
  );
}
