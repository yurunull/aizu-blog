import React from "react";

export default function Footer() {
  return (
    // フッター全体。線の色を border-aizu-gray/15 に濃く変更
    <footer className="w-full bg-aizu-white pt-32 pb-12 px-6 md:px-12 relative border-t border-aizu-gray/15 border-solid">
      {/* --- 自転車エリア --- */}
      {/* top-[-16px] で 32px(h-8) のアイコンのちょうど半分が線の上にくるように配置 */}
      <div className="absolute top-[-30px] left-0 w-full hidden md:block pointer-events-none">
        <div className="container mx-auto max-w-7xl relative px-12">
          {/* ml-[-4px] などでタイヤが線に接する微調整を行っています */}
          <div className="opacity-60 w-8 h-8 ml-[4px]">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-aizu-gray"
            >
              <circle cx="5.5" cy="17.5" r="3.5"></circle>
              <circle cx="18.5" cy="17.5" r="3.5"></circle>
              <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm1 0l2.64 6"></path>
              <path d="M16.5 10.5h-10"></path>
              <path d="M10.5 7.5L8 11"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* --- コンテンツエリア --- */}
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12 relative z-10">
        <div className="space-y-4">
          <p className="text-sm md:text-base text-aizu-gray/70 font-serif leading-relaxed tracking-widest max-w-2xl mx-auto">
            会津の空気に惹かれた一人の大学生が、
            <br className="md:hidden" />
            個人的な想いで綴っている場所です。
          </p>
          <p className="text-[11px] md:text-xs text-aizu-sub/50 tracking-wider">
            ※当サイトは個人製作によるものであり、公式団体等とは関係ありません。
          </p>
        </div>

        <div className="flex flex-col items-center space-y-3 pt-6 border-t border-aizu-gray/5 w-40 mx-auto">
          <span className="text-[10px] text-aizu-sub/40 uppercase tracking-[0.4em]">
            Produced by
          </span>

          <a
            href="https://yurunull.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center"
          >
            <span className="font-serif text-xl md:text-2xl text-aizu-gray tracking-[0.3em] group-hover:text-aizu-sub transition-colors duration-500">
              ゆるり
            </span>
            <div className="w-0 h-[1px] bg-aizu-sub/60 group-hover:w-full transition-all duration-700 mt-2"></div>
            <span className="text-[10px] text-aizu-sub/40 tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              yurunull.dev
            </span>
          </a>
        </div>

        <div className="pt-10">
          <p className="text-[10px] text-aizu-sub/30 tracking-[0.3em] uppercase">
            &copy; 2026 yurunull. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
