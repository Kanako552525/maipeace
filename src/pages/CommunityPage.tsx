import { useState } from 'react';
import { Star, ExternalLink, Users, Briefcase, MessageCircle } from 'lucide-react';

// ─── 口コミデータ ────────────────────────────────────
interface Review {
  id: number;
  category: string;
  name: string;
  rating: number;
  comment: string;
  tag: string;
  affiliateUrl: string;
}

const REVIEWS: Review[] = [
  { id: 1, category: '手帳・文具', name: 'ほぼ日手帳', rating: 5, comment: '1日1ページなので、その日思ったことを何でも書けます。「書く」ことで頭が整理されてタスクの抜け漏れが減りました。', tag: '計画・整理', affiliateUrl: '#' },
  { id: 2, category: '手帳・文具', name: 'タイムタイマー（視覚化タイマー）', rating: 5, comment: '時間感覚が弱いADHDには神アイテム。残り時間が赤い扇形で「見える」から、時間が過ぎていく感覚がつかめます。', tag: '時間管理', affiliateUrl: '#' },
  { id: 3, category: '手帳・文具', name: 'ポモドーロ用キッチンタイマー', rating: 4, comment: '25分集中→5分休憩のポモドーロ法に。アプリより物理タイマーのほうが「ゲーム感覚」で続けやすかったです。', tag: '集中', affiliateUrl: '#' },
  { id: 4, category: 'イヤホン・ガジェット', name: 'AirPods Pro（ノイズキャンセリング）', rating: 5, comment: '周りの音が気になりすぎる問題が一気に解決。カフェや職場でも自分の世界に入れます。ADHDには投資価値あり。', tag: '集中', affiliateUrl: '#' },
  { id: 5, category: 'イヤホン・ガジェット', name: 'Apple Watch', rating: 4, comment: '薬を飲む時間・会議・タスクをバイブで知らせてくれる。スマホを見ない代わりに手首で通知を受け取れるのが◎', tag: '時間管理', affiliateUrl: '#' },
  { id: 6, category: 'アプリ', name: 'Forest（集中タイマーアプリ）', rating: 5, comment: '集中中は木が育つゲーム感覚のアプリ。スマホをさわると木が枯れるから「もったいない」でスマホ依存が減りました。', tag: '集中', affiliateUrl: '#' },
  { id: 7, category: 'アプリ', name: 'Notion', rating: 4, comment: '頭の中をそのまま書き出せる自由度が高いノート。タスク・メモ・日記を全部一箇所にまとめられて「どこに書いたっけ」がなくなりました。', tag: '計画・整理', affiliateUrl: '#' },
  { id: 8, category: 'サプリ・栄養', name: 'オメガ3（EPA/DHA）サプリ', rating: 4, comment: '主治医にすすめられて飲み始めました。即効性はないけど、2〜3ヶ月続けたら気分のムラが少し落ち着いた気がします。', tag: '気分安定', affiliateUrl: '#' },
  { id: 9, category: 'サプリ・栄養', name: 'マグネシウムサプリ', rating: 4, comment: '寝つきが悪い・夜に落ち着かない問題に。夜飲むと睡眠の質が上がって、翌朝の集中力も変わりました。', tag: '睡眠', affiliateUrl: '#' },
  { id: 10, category: '本', name: '「発達障害の僕が仕事で使えるヤツに変わった すごい仕事術」借金玉', rating: 5, comment: 'ADHD当事者が書いた本。「こうあるべき」ではなく「こうやって乗り切った」という実践的な話が刺さります。', tag: '仕事', affiliateUrl: '#' },
  { id: 11, category: '本', name: '「ちゃんとしなきゃ！」をやめたら二度と散らからない部屋になりました', rating: 4, comment: '片付けられないADHD向けの本。「完璧に片付けなくていい」という考え方に救われました。', tag: '生活', affiliateUrl: '#' },
];

const REVIEW_CATEGORIES = ['すべて', '手帳・文具', 'イヤホン・ガジェット', 'アプリ', 'サプリ・栄養', '本'];
const TAG_COLORS: Record<string, string> = {
  '集中': 'bg-blue-50 text-blue-400',
  '時間管理': 'bg-purple-50 text-purple-400',
  '計画・整理': 'bg-green-50 text-green-400',
  '気分安定': 'bg-yellow-50 text-yellow-500',
  '睡眠': 'bg-indigo-50 text-indigo-400',
  '仕事': 'bg-orange-50 text-orange-400',
  '生活': 'bg-pink-50 text-pink-400',
};

// ─── 求人データ ────────────────────────────────────
const JOBS = [
  { id: 1, company: '株式会社リモートワークス', title: 'Webデザイナー（完全リモート）', tags: ['完全リモート', 'フレックス', '発達障害歓迎'], description: '自分のペースで働けるリモート環境。週1回のオンラインMTGのみ。集中しやすい環境を会社でサポートします。', url: '#' },
  { id: 2, company: 'NPO法人はなまる', title: '事務・データ入力スタッフ', tags: ['障害者雇用', '短時間OK', '理解ある職場'], description: '発達障害のある方が多く活躍しています。得意なことを活かせるよう、業務を一緒に考えます。', url: '#' },
  { id: 3, company: '株式会社フレキシブル', title: 'カスタマーサポート', tags: ['フレックス', 'リモート可', '未経験OK'], description: 'チャット対応メイン。自分のリズムで働ける環境です。ADHDの特性を強みとして活かせる職場づくりをしています。', url: '#' },
  { id: 4, company: 'デザイン事務所クリエイト', title: 'イラストレーター・グラフィックデザイナー', tags: ['フリーランス歓迎', '裁量大', 'こだわりOK'], description: '集中力の高さや独自の視点を活かせるクリエイティブな仕事。締め切り管理サポートあり。', url: '#' },
  { id: 5, company: '就労移行支援 まなびや', title: '就労支援スタッフ', tags: ['障害者雇用', '正社員', '研修充実'], description: '発達障害の当事者スタッフも活躍中。自分の経験を活かして、同じ悩みを持つ人をサポートするやりがいのある仕事。', url: '#' },
];

// ─── 友達さがしデータ ────────────────────────────────
const FRIEND_TAGS = ['仕事の悩み', '育児', '学業', '薬のこと', '恋愛・結婚', '片付け', '金銭管理', 'ゲーム', 'アート・創作', '読書', '音楽', '運動'];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

// ─── 口コミタブ ────────────────────────────────────
function ReviewTab() {
  const [activeCategory, setActiveCategory] = useState('すべて');
  const filtered = activeCategory === 'すべて' ? REVIEWS : REVIEWS.filter((r) => r.category === activeCategory);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {REVIEW_CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${activeCategory === cat ? 'bg-blue-400 text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
            {cat}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((review) => (
          <div key={review.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-300 mb-0.5">{review.category}</p>
                <h3 className="text-sm font-semibold text-gray-700 leading-snug">{review.name}</h3>
              </div>
              <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[review.tag] ?? 'bg-gray-50 text-gray-400'}`}>{review.tag}</span>
            </div>
            <StarRating rating={review.rating} />
            <p className="text-xs text-gray-500 leading-relaxed mt-2">{review.comment}</p>
            <a href={review.affiliateUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-1.5 text-xs text-blue-400 font-medium">
              <ExternalLink size={13} />Amazonで見てみる
            </a>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-300 text-center mt-6 leading-relaxed px-2">
        ※ 一部リンクはアフィリエイトリンクです。リンク経由でご購入いただくと、アプリの運営費になります。
      </p>
    </div>
  );
}

// ─── 友達さがしタブ ────────────────────────────────
function FriendTab() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (tag: string) => {
    setSelected((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  return (
    <div>
      <div className="bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl p-4 mb-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} />
          <span className="font-bold text-sm">ADHD友達さがし</span>
        </div>
        <p className="text-xs opacity-80 leading-relaxed">同じ悩みを持つ人とつながれる場所。「わかる！」が見つかります。</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-3">
        <p className="text-sm font-semibold text-gray-700 mb-1">どんなことで話したい？</p>
        <p className="text-xs text-gray-400 mb-3">当てはまるものを選んでね（複数OK）</p>
        <div className="flex flex-wrap gap-2">
          {FRIEND_TAGS.map((tag) => (
            <button key={tag} onClick={() => toggle(tag)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${selected.includes(tag) ? 'bg-pink-400 text-white' : 'bg-gray-50 text-gray-400'}`}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-3">
        <p className="text-xs font-semibold text-amber-600 mb-1">🚧 マッチング機能、準備中です</p>
        <p className="text-xs text-amber-500 leading-relaxed">
          現在、友達マッチング機能を開発中です。興味のあるテーマを選んでおくと、リリース時に通知できます。
        </p>
      </div>

      {selected.length > 0 && (
        <button className="w-full bg-pink-400 text-white py-3 rounded-2xl text-sm font-semibold shadow-sm">
          {selected.length}個のテーマで通知を受け取る
        </button>
      )}

      <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-600 mb-3">今すぐつながるなら</p>
        <a href="https://twitter.com/search?q=%23ADHD" target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-between py-2 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-sky-400" />
            <span className="text-sm text-gray-600">X（Twitter）で #ADHD を検索</span>
          </div>
          <ExternalLink size={13} className="text-gray-300" />
        </a>
        <a href="https://www.reddit.com/r/ADHD_J/" target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-orange-400" />
            <span className="text-sm text-gray-600">Reddit ADHD_J コミュニティ</span>
          </div>
          <ExternalLink size={13} className="text-gray-300" />
        </a>
      </div>
    </div>
  );
}

// ─── 求人タブ ────────────────────────────────────
function JobTab() {
  return (
    <div>
      <div className="bg-gradient-to-r from-teal-400 to-cyan-400 rounded-2xl p-4 mb-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase size={18} />
          <span className="font-bold text-sm">ADHD向け求人</span>
        </div>
        <p className="text-xs opacity-80 leading-relaxed">理解ある職場・働きやすい環境の求人をまとめました。</p>
      </div>

      <div className="space-y-3">
        {JOBS.map((job) => (
          <div key={job.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] text-gray-300 mb-0.5">{job.company}</p>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">{job.title}</h3>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {job.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-500 font-medium">{tag}</span>
              ))}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{job.description}</p>
            <a href={job.url} target="_blank" rel="noopener noreferrer"
              className="mt-3 flex items-center gap-1.5 text-xs text-teal-500 font-medium">
              <ExternalLink size={13} />詳しく見る
            </a>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <p className="text-xs font-semibold text-amber-600 mb-1">求人を掲載したい企業様へ</p>
        <p className="text-xs text-amber-500 leading-relaxed">
          ADHDユーザーに直接アプローチできます。掲載のお問い合わせはプロフィール画面からどうぞ。
        </p>
      </div>
    </div>
  );
}

// ─── メインページ ────────────────────────────────────
const SUB_TABS = [
  { id: 'review', label: '口コミ', icon: Star },
  { id: 'friend', label: '友達さがし', icon: Users },
  { id: 'job', label: '求人', icon: Briefcase },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('review');

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-700">つながる</h1>
        <p className="text-xs text-gray-400 mt-1">ADHDの仲間と情報をシェアしよう</p>
      </div>

      {/* サブタブ */}
      <div className="flex gap-2 mb-5">
        {SUB_TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl text-xs font-medium transition-colors ${
              activeTab === id ? 'bg-blue-400 text-white shadow-sm' : 'bg-white text-gray-400'
            }`}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'review' && <ReviewTab />}
      {activeTab === 'friend' && <FriendTab />}
      {activeTab === 'job' && <JobTab />}
    </div>
  );
}
