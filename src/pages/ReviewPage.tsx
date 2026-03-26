import { useState } from 'react';
import { Star, ExternalLink } from 'lucide-react';

interface Review {
  id: number;
  category: string;
  name: string;
  rating: number; // 1-5
  comment: string;
  tag: string;
  affiliateUrl: string; // Amazonアフィリエイトリンクをここに入れてください
}

const REVIEWS: Review[] = [
  // 手帳・文具
  {
    id: 1,
    category: '手帳・文具',
    name: 'ほぼ日手帳',
    rating: 5,
    comment: '1日1ページなので、その日思ったことを何でも書けます。「書く」ことで頭が整理されてタスクの抜け漏れが減りました。',
    tag: '計画・整理',
    affiliateUrl: '#',
  },
  {
    id: 2,
    category: '手帳・文具',
    name: 'タイムタイマー（視覚化タイマー）',
    rating: 5,
    comment: '時間感覚が弱いADHDには神アイテム。残り時間が赤い扇形で「見える」から、時間が過ぎていく感覚がつかめます。',
    tag: '時間管理',
    affiliateUrl: '#',
  },
  {
    id: 3,
    category: '手帳・文具',
    name: 'ポモドーロ用キッチンタイマー',
    rating: 4,
    comment: '25分集中→5分休憩のポモドーロ法に。アプリより物理タイマーのほうが「ゲーム感覚」で続けやすかったです。',
    tag: '集中',
    affiliateUrl: '#',
  },
  // イヤホン・ガジェット
  {
    id: 4,
    category: 'イヤホン・ガジェット',
    name: 'AirPods Pro（ノイズキャンセリング）',
    rating: 5,
    comment: '周りの音が気になりすぎる問題が一気に解決。カフェや職場でも自分の世界に入れます。ADHDには投資価値あり。',
    tag: '集中',
    affiliateUrl: '#',
  },
  {
    id: 5,
    category: 'イヤホン・ガジェット',
    name: 'Apple Watch',
    rating: 4,
    comment: '薬を飲む時間・会議・タスクをバイブで知らせてくれる。スマホを見ない代わりに手首で通知を受け取れるのが◎',
    tag: '時間管理',
    affiliateUrl: '#',
  },
  // アプリ
  {
    id: 6,
    category: 'アプリ',
    name: 'Forest（集中タイマーアプリ）',
    rating: 5,
    comment: '集中中は木が育つゲーム感覚のアプリ。スマホをさわると木が枯れるから「もったいない」でスマホ依存が減りました。',
    tag: '集中',
    affiliateUrl: '#',
  },
  {
    id: 7,
    category: 'アプリ',
    name: 'Notion',
    rating: 4,
    comment: '頭の中をそのまま書き出せる自由度が高いノート。タスク・メモ・日記を全部一箇所にまとめられて「どこに書いたっけ」がなくなりました。',
    tag: '計画・整理',
    affiliateUrl: '#',
  },
  // サプリ・栄養
  {
    id: 8,
    category: 'サプリ・栄養',
    name: 'オメガ3（EPA/DHA）サプリ',
    rating: 4,
    comment: '主治医にすすめられて飲み始めました。即効性はないけど、2〜3ヶ月続けたら気分のムラが少し落ち着いた気がします。',
    tag: '気分安定',
    affiliateUrl: '#',
  },
  {
    id: 9,
    category: 'サプリ・栄養',
    name: 'マグネシウムサプリ',
    rating: 4,
    comment: '寝つきが悪い・夜に落ち着かない問題に。夜飲むと睡眠の質が上がって、翌朝の集中力も変わりました。',
    tag: '睡眠',
    affiliateUrl: '#',
  },
  // 本
  {
    id: 10,
    category: '本',
    name: '「発達障害の僕が仕事で使えるヤツに変わった すごい仕事術」借金玉',
    rating: 5,
    comment: 'ADHD当事者が書いた本。「こうあるべき」ではなく「こうやって乗り切った」という実践的な話が刺さります。',
    tag: '仕事',
    affiliateUrl: '#',
  },
  {
    id: 11,
    category: '本',
    name: '「ちゃんとしなきゃ！」をやめたら二度と散らからない部屋になりました',
    rating: 4,
    comment: '片付けられないADHD向けの本。「完璧に片付けなくていい」という考え方に救われました。',
    tag: '生活',
    affiliateUrl: '#',
  },
];

const CATEGORIES = ['すべて', '手帳・文具', 'イヤホン・ガジェット', 'アプリ', 'サプリ・栄養', '本'];
const TAG_COLORS: Record<string, string> = {
  '集中': 'bg-blue-50 text-blue-400',
  '時間管理': 'bg-purple-50 text-purple-400',
  '計画・整理': 'bg-green-50 text-green-400',
  '気分安定': 'bg-yellow-50 text-yellow-500',
  '睡眠': 'bg-indigo-50 text-indigo-400',
  '仕事': 'bg-orange-50 text-orange-400',
  '生活': 'bg-pink-50 text-pink-400',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

export default function ReviewPage() {
  const [activeCategory, setActiveCategory] = useState('すべて');

  const filtered = activeCategory === 'すべて'
    ? REVIEWS
    : REVIEWS.filter((r) => r.category === activeCategory);

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-700">ADHDに効いた！口コミ</h1>
        <p className="text-xs text-gray-400 mt-1">当事者のリアルな声をまとめました</p>
      </div>

      {/* カテゴリフィルター */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-blue-400 text-white'
                : 'bg-white text-gray-400 border border-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 口コミカード一覧 */}
      <div className="space-y-3">
        {filtered.map((review) => (
          <div key={review.id} className="bg-white rounded-2xl p-4 shadow-sm">
            {/* ヘッダー */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-300 mb-0.5">{review.category}</p>
                <h3 className="text-sm font-semibold text-gray-700 leading-snug">{review.name}</h3>
              </div>
              <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[review.tag] ?? 'bg-gray-50 text-gray-400'}`}>
                {review.tag}
              </span>
            </div>

            {/* 星評価 */}
            <StarRating rating={review.rating} />

            {/* コメント */}
            <p className="text-xs text-gray-500 leading-relaxed mt-2">{review.comment}</p>

            {/* リンクボタン */}
            <a
              href={review.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-1.5 text-xs text-blue-400 font-medium"
            >
              <ExternalLink size={13} />
              Amazonで見てみる
            </a>
          </div>
        ))}
      </div>

      {/* アフィリエイト開示 */}
      <p className="text-[10px] text-gray-300 text-center mt-6 leading-relaxed px-2">
        ※ 一部リンクはアフィリエイトリンクです。リンク経由でご購入いただくと、アプリの運営費になります。
        紹介する商品は当事者の実体験にもとづいています。
      </p>
    </div>
  );
}
