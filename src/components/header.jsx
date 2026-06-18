import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Coffee, Map, Route, X, Sparkles, Dot } from "lucide-react"; // 💡 Dot アイコンを追加

// 湯気のないコップ（完食）を表現
const EmptyCup = ({ size = 22, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
  </svg>
);

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-aizu-white/80 backdrop-blur-md border-b border-gray-100/30 selection:bg-kusumi-blue/10">
  <div className="max-w-full mx-auto px-6 md:px-16 h-20 flex items-center justify-between">
    
    <Link
      to="/"
      className="block h-full w-32 md:w-48 transition-opacity hover:opacity-70 flex-shrink-0"
    >
      <img
        src={`${import.meta.env.BASE_URL}images/logo.png`}
        alt="BURARI 会津手帖"
        /* h-full: ヘッダーの高さに合わせる
           object-cover: 枠からはみ出す分をカットして埋める
           object-position: 画像の上下をトリミングして中央を表示する
        */
        className="w-full h-full object-cover object-center"
      />
    </Link>

          {/* 💻 PC大画面のナビゲーション（下線アニメーション） */}
          <nav className="hidden xl:flex items-center gap-12 flex-shrink-0">
            <Link
              to="/map"
              className="group relative py-2 flex items-center gap-2.5 text-[14px] font-medium text-aizu-gray hover:text-kusumi-blue transition-colors tracking-[0.2em]"
            >
              <Map
                size={15}
                className="text-aizu-sub/60 group-hover:text-kusumi-blue group-hover:-translate-y-0.5 transition-all duration-300"
              />
              <span>MAP</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-kusumi-blue transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link
              to="/route"
              className="group relative py-2 flex items-center gap-2.5 text-[14px] font-medium text-aizu-gray hover:text-kusumi-blue transition-colors tracking-[0.2em]"
            >
              <Route
                size={15}
                className="text-aizu-sub/60 group-hover:text-kusumi-blue group-hover:rotate-12 transition-all duration-300"
              />
              <span>ROUTE</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-kusumi-blue transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* 📱 1280px未満：ハンバーガーメニュー（飲み干すエフェクト） */}
          <div className="xl:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col items-center justify-center w-12 h-12 rounded-full hover:bg-gray-50/50 transition-all active:scale-95 group/btn"
              aria-label="Menu"
            >
              <div
                className={`transition-all duration-300 ${isMenuOpen ? "text-kusumi-pink scale-105" : "text-aizu-gray"
                  }`}
              >
                {isMenuOpen ? (
                  // メニュー開いたとき：湯気のないコップ（完食・ごちそうさま）
                  <EmptyCup size={22} className="animate-in fade-in duration-300" />
                ) : (
                  // 通常時：湯気のあるホット珈琲
                  <Coffee size={22} strokeWidth={1.5} className="group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                )}
              </div>
              <span className="text-[7px] font-bold tracking-[0.15em] uppercase mt-0.5 text-aizu-sub/60">
                {isMenuOpen ? "Gochisou" : "Menu"}
              </span>
            </button>
          </div>
        </div>

        {/* スマホ・タブレット用ドロワーメニュー（和モダンに垢抜け！） */}
        <div
          className={`absolute top-20 left-0 w-full bg-aizu-white/95 backdrop-blur-lg border-b border-gray-100 shadow-inner transition-all duration-500 ease-out overflow-hidden xl:hidden ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
            }`}
        >
          <nav className="flex flex-col p-8 gap-6 animate-in slide-in-from-top-4 duration-500">
            {/* MAPのリンク */}
            <Link
              to="/map"
              onClick={() => setIsMenuOpen(false)}
              className="group flex flex-col p-5 rounded-sm bg-white border border-gray-100 hover:border-kusumi-blue/20 transition-all duration-300 shadow-sm"
            >
              <span className="flex items-center gap-4 text-sm font-serif font-bold text-aizu-gray group-hover:text-kusumi-blue transition-colors">
                <Map size={16} className="text-kusumi-blue" />
                会津ぶらりマップ
              </span>
              <span className="text-[10px] text-aizu-sub/50 font-sans tracking-[0.1em] mt-2 pl-8 flex items-center justify-between">
                町の道しるべ
                <Dot size={12} className="text-kusumi-pink/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </Link>

            {/* ROUTEのリンク */}
            <Link
              to="/route"
              onClick={() => setIsMenuOpen(false)}
              className="group flex flex-col p-5 rounded-sm bg-white border border-gray-100 hover:border-kusumi-blue/20 transition-all duration-300 shadow-sm"
            >
              <span className="flex items-center gap-4 text-sm font-serif font-bold text-aizu-gray group-hover:text-kusumi-blue transition-colors">
                <Route size={16} className="text-kusumi-blue" />
                おすすめの散歩道
              </span>
              <span className="text-[10px] text-aizu-sub/50 font-sans tracking-[0.1em] mt-2 pl-8 flex items-center justify-between">
                ゆるり和む、お散歩
                <Dot size={12} className="text-kusumi-pink/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </Link>
          </nav>
        </div>
      </header>

      {/* コンテンツ埋もれ防止用スペース */}
      <div className="h-20"></div>
    </>
  );
}