import React, { useState } from "react";
import { Coffee, Map, Route, X } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-aizu-white/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="max-w-full mx-auto px-6 md:px-16 h-20 flex items-center justify-end">
          {/* PC版：右寄せナビ (文字サイズと間隔をアップ) */}
          <nav className="hidden md:flex items-center gap-16">
            <a
              href="#map"
              className="group flex items-center gap-3 text-[16px] font-medium text-aizu-gray hover:text-kusumi-blue transition-colors tracking-[0.25em]"
            >
              <Map
                size={18}
                className="group-hover:text-kusumi-blue transition-colors"
              />
              MAP
            </a>
            <a
              href="#root"
              className="group flex items-center gap-3 text-[16px] font-medium text-aizu-gray hover:text-kusumi-blue transition-colors tracking-[0.25em]"
            >
              <Route
                size={18}
                className="group-hover:text-kusumi-blue transition-colors"
              />
              ROOT
            </a>
          </nav>

          {/* スマホ版：珈琲カップメニュー (スマホ版はコンパクトなまま維持) */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col items-center justify-center w-10 h-10 transition-all active:scale-90"
              aria-label="Menu"
            >
              <div
                className={`transition-colors duration-300 ${
                  isMenuOpen ? "text-kusumi-pink" : "text-aizu-gray"
                }`}
              >
                {isMenuOpen ? (
                  <X size={24} strokeWidth={1.5} />
                ) : (
                  <Coffee size={24} strokeWidth={1.5} />
                )}
              </div>
              <span className="text-[7px] font-bold tracking-[0.2em] uppercase mt-0.5 text-aizu-sub/80">
                {isMenuOpen ? "Close" : "Menu"}
              </span>
            </button>
          </div>
        </div>

        {/* スマホ用ドロワー */}
        <div
          className={`absolute top-16 left-0 w-full bg-white/95 backdrop-blur-lg border-b border-gray-100 transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col p-8 gap-8">
            <a
              href="#map"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-between text-base font-serif text-aizu-gray"
            >
              <span className="flex items-center gap-4">
                <Map size={18} className="text-kusumi-blue" />
                Map
              </span>
              <span className="text-[10px] text-aizu-sub font-sans tracking-wider">
                会津の地図とスポット
              </span>
            </a>
            <a
              href="#root"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-between text-base font-serif text-aizu-gray"
            >
              <span className="flex items-center gap-4">
                <Route size={18} className="text-kusumi-blue" />
                Root
              </span>
              <span className="text-[10px] text-aizu-sub font-sans tracking-wider">
                おすすめの散歩道
              </span>
            </a>
          </nav>
        </div>
      </header>

      {/* ヘッダーの高さを少し出したので、余白も h-16 から h-20 へ */}
      <div className="h-20"></div>
    </>
  );
}
