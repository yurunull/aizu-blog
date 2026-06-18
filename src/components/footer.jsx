import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-aizu-white py-16 px-6 border-t border-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">

          {/* 左：コンセプト */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-kusumi-pink">
                <circle cx="18.5" cy="17.5" r="3.5" /><circle cx="5.5" cy="17.5" r="3.5" /><path d="M15 12a3 3 0 1 0-2.83-4H9" /><path d="M12 12h5.5l-3.5-3.5" /></svg>
              <h3 className="text-[12px] font-bold tracking-[0.3em] text-aizu-gray">AUTHOR</h3>
            </div>
            <p className="text-[12px] text-aizu-sub leading-relaxed tracking-[0.1em] border-l border-kusumi-pink pl-4">
              会津若松で暮らす大学生です。自転車や徒歩で若松を中心に巡っています。<br />
              そんな中で見つけた「いいな」と思う場所をこのサイトに記録しています。<br />
              この手帖で、会津の魅力を伝える道しるべとなりますように。
            </p>
          </div>

          {/* 右：サイトマップ詳細 */}
          <div className="grid grid-cols-2 gap-8 text-[11px]">
            {/* Exploreエリア */}
            <div className="space-y-4">
              <h4 className="font-bold text-aizu-gray tracking-[0.2em] uppercase border-b border-gray-200 pb-2">Explore</h4>
              <nav className="flex flex-col gap-3">
                <Link to="/map" className="group relative flex items-center gap-2 text-aizu-sub hover:text-kusumi-blue transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aizu-sub/60 group-hover:text-kusumi-blue group-hover:rotate-12 transition-all duration-300">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" x2="9" y1="3" y2="18" /><line x1="15" x2="15" y1="6" y2="21" />
                  </svg>
                  <span>会津ぶらりマップ</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-kusumi-blue transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/route" className="group relative flex items-center gap-2 text-aizu-sub hover:text-kusumi-blue transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aizu-sub/60 group-hover:text-kusumi-blue group-hover:rotate-12 transition-all duration-300">
                    <circle cx="6" cy="19" r="3" />
                    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
                    <circle cx="18" cy="5" r="3" />
                  </svg>
                  <span>おすすめの散歩道</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-kusumi-blue transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </nav>
            </div>

            {/* Informationエリア */}
            <div className="space-y-4">
              <h4 className="font-bold text-aizu-gray tracking-[0.2em] uppercase border-b border-gray-200 pb-2">Information</h4>
              <nav className="flex flex-col gap-3">
                <a href="https://yurunull.dev" target="_blank" rel="noopener noreferrer" className="group relative flex items-center gap-2 text-aizu-sub hover:text-kusumi-green transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aizu-sub/60 group-hover:text-kusumi-green group-hover:rotate-12 transition-all duration-300">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Portfolio</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-kusumi-green transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="https://instagram.com/your-account" target="_blank" rel="noopener noreferrer" className="group relative flex items-center gap-2 text-aizu-sub hover:text-kusumi-green transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aizu-sub/60 group-hover:text-kusumi-green group-hover:rotate-12 transition-all duration-300">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span>Instagram</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-kusumi-green transition-all duration-300 group-hover:w-full"></span>
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* フッター下部 */}
        <div className="relative pt-8 border-t border-gray-200 text-center">
          <p className="text-[10px] text-aizu-sub tracking-[0.2em]">&copy; Yurunull</p>
          <p className="text-[9px] text-aizu-sub/50 mt-2 tracking-[0.1em]">Aizuwakamatsu, Fukushima, Japan.</p>
        </div>
      </div>
    </footer>
  );
}