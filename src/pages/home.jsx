import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { User, Tag as TagIcon, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"; // アイコンを追加
import { loadDefaultJapaneseParser } from "budoux";

const postFiles = import.meta.glob("../article/*.md", {
  query: "raw",
  import: "default",
  eager: true,
});

export default function Home() {
  const [selectedTag, setSelectedTag] = useState(null);
  // ─── ページネーション用の状態管理 ──────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6; // 1ページあたりの表示件数を6件に設定
  // ─────────────────────────────────────────────────────────────────

  // 全記事データの解析
  const allPostsData = useMemo(() => {
    return Object.keys(postFiles)
      .map((filePath) => {
        const content = postFiles[filePath];
        const fileName = filePath.split("/").pop();
        const id = fileName.replace(/\.md$/, "");

        const metaMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
        const metaData = {
          tags: [],
          images: [],
        };

        if (metaMatch) {
          metaMatch[1].split("\n").forEach((line) => {
            const [key, ...value] = line.split(":");
            if (key && value.length) {
              const trimmedKey = key.trim();
              const val = value
                .join(":")
                .trim()
                .replace(/^["']|["']$/g, "");

              if (trimmedKey === "tags" || trimmedKey === "images") {
                metaData[trimmedKey] = val
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean);
              } else {
                metaData[trimmedKey] = val;
              }
            }
          });
        }

        const displayThumbnail =
          metaData.images && metaData.images.length > 0
            ? metaData.images[0].split("|")[0]
            : metaData.thumbnail || null;

        return { id, ...metaData, thumbnail: displayThumbnail };
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, []);

  // タグリストの抽出
  const activeTags = useMemo(() => {
    const tags = allPostsData.flatMap((post) => post.tags);
    return Array.from(new Set(tags));
  }, [allPostsData]);

  // 記事セクションの位置を捕捉するためのRef
  const postSectionRef = useRef(null);

  // ページ切り替え時に記事セクションの先頭へ自動スクロール
  useEffect(() => {
    // 2ページ目以降に切り替わった時だけスクロールさせる（初回読み込み時の誤作動防止）
    if (currentPage > 1 && postSectionRef.current) {
      postSectionRef.current.scrollIntoView({
        behavior: "smooth", // ぬるっと動かす
        block: "start",    // セクションの先頭を画面のトップに合わせる
      });
    }
  }, [currentPage]);

  // タグでフィルタリングされた記事
  const filteredPosts = useMemo(() => {
    if (!selectedTag) return allPostsData;
    return allPostsData.filter((post) => post.tags.includes(selectedTag));
  }, [selectedTag, allPostsData]);

  // ─── ページネーションの計算 ──────────────────────────────────────
  // タグが切り替わったら、ページを1ページ目に戻す
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedTag]);

  // 総ページ数の計算
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // 現在のページに表示する記事だけを切り出す（ここがポイント！）
  const currentPosts = useMemo(() => {
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    return filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  }, [currentPage, filteredPosts]);
  // ─────────────────────────────────────────────────────────────────

  const BudouxText = ({ text }) => {
    if (!text) return null;
    const [tokens, setTokens] = useState([text]);

    React.useEffect(() => {
      try {
        const parser = loadDefaultJapaneseParser();
        setTokens(parser.parse(text));
      } catch (e) {
        console.error("BudouX parsing failed:", e);
      }
    }, [text]);

    return (
      <>
        {tokens.map((token, index) => (
          <span key={index} style={{ display: "inline-block" }}>
            {token}
          </span>
        ))}
      </>
    );
  };

  return (
    <div className="bg-aizu-white min-h-screen">
      {/* 1. メインビジュアル (PCでのサイズ拡大・位置ズレの完全修正) */}
      <main className="h-[48vh] min-h-[350px] w-full flex justify-center items-center relative pt-26 md:pt-24">
        <div
          className="font-serif font-extralight text-aizu-gray tracking-[0.3em] relative"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            whiteSpace: "nowrap",
          }}
        >
          <div className="text-4xl md:text-[3.8rem] block leading-none">
            ゆるり、
          </div>
          <div className="text-4xl md:text-[3.8rem] block leading-none mt-8 md:mt-12 mr-8 md:mr-16">
            ぶらりと、
          </div>
          <div className="text-4xl md:text-[3.8rem] block leading-none mt-16 md:mt-24 mr-8 md:mr-16">
            会津手帖。
          </div>
        </div>
      </main>

      {/* 2. スライドショー */}
      <section className="py-12 md:py-16 overflow-hidden">
        <div className="flex animate-infinite-scroll">
          {[...allPostsData, ...allPostsData].map((post, index) => (
            <div
              key={`${post.id}-${index}`}
              className="w-[280px] md:w-[300px] flex-shrink-0 px-3 md:px-6"
            >
              <Link to={`/blog/${post.id}`} className="group block">
                <div className="aspect-[16/10] overflow-hidden bg-gray-100 rounded-sm mb-4">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000 ease-out"
                  />
                </div>
                <p className="text-[10px] tracking-widest text-aizu-sub/40 mb-1">
                  {post.date}
                </p>
                <h3 className="font-serif text-sm md:text-base text-aizu-gray group-hover:text-kusumi-blue transition-colors">
                  <BudouxText text={post.title} />
                </h3>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 3. タグ選択・記事一覧セクション（巨大回転文字を背景に配置するため、section全体を relative・overflow-hidden に） */}
      <section ref={postSectionRef} className="bg-white py-20 px-6 border-t border-gray-50 relative overflow-hidden min-h-[600px]">

        {/* 🎡 背景でダイナミックに回転する巨大円形テキスト */}
        {/* 右下（または右上）に大胆にはみ出させ、opacityを極限まで下げることでモダンな誌面のようなデザインに */}
        <div className="absolute -bottom-32 -right-32 md:-bottom-48 md:-right-48 w-[24rem] h-[24rem] md:w-[35rem] md:h-[35rem] pointer-events-none select-none animate-spin-slow z-0">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <path
              id="textPath"
              d="M 50,50 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
              fill="none"
            />

            <text className="text-[5.5px] font-sans font-light tracking-[0.35em] fill-kusumi-blue/15 uppercase">
              <textPath href="#textPath" startOffset="0%">
                BRARI YURURI DIARY FROM AIZU 🐾 SLOW WANDERING DIARY 🐾 {"\u00A0\u00A0"}
              </textPath>
            </text>
          </svg>
        </div>

        {/* 💡 コンテンツ全体を z-10 にして、回転文字の「前面」に浮き上がらせる */}
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-2 text-kusumi-green mb-8">
            <TagIcon size={16} />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase">
              Filter by Tags
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-6 py-2 text-[11px] tracking-widest rounded-full border transition-all ${!selectedTag ? "bg-aizu-gray text-white border-aizu-gray" : "text-aizu-sub border-gray-100 hover:border-gray-300"}`}
            >
              All Posts
            </button>
            {activeTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-6 py-2 text-[11px] tracking-widest rounded-full border transition-all ${selectedTag === tag ? "bg-kusumi-blue text-white border-kusumi-blue" : "text-aizu-sub border-gray-100 hover:border-kusumi-blue/30"}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 4. 記事一覧グリッド（ここも z-10 を追加して回転文字の上に重ねる） */}
        <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 relative z-10">
          {currentPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden mb-4 rounded-sm bg-gray-50 shadow-sm">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-[10px] tracking-widest text-aizu-sub/50 uppercase">
                  <span>{post.date}</span>
                  <span className="w-3 h-[1px] bg-gray-200"></span>
                </div>
                <h4 className="text-sm font-serif text-aizu-gray leading-relaxed group-hover:text-kusumi-blue transition-colors">
                  <BudouxText text={post.title} />
                </h4>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {post.tags.map((t) => (
                    <span key={t} className="text-[9px] text-aizu-sub/40 italic">
                      #{t}
                    </span>
                  ))}
                </div>
                <div className="pt-1 flex items-center gap-2 text-[10px] text-kusumi-blue font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  Read More <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ─── 5. ページネーションコントロール（新設） ────────────────────── */}
        {totalPages > 1 && (
          <div className="max-w-5xl mx-auto mt-20 flex justify-center items-center gap-4 border-t border-gray-100 pt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 text-aizu-sub hover:text-kusumi-blue disabled:opacity-20 disabled:hover:text-aizu-sub transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-full text-xs tracking-widest transition-all ${currentPage === page
                    ? "bg-kusumi-blue text-white"
                    : "text-aizu-sub hover:bg-gray-50"
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 text-aizu-sub hover:text-kusumi-blue disabled:opacity-20 disabled:hover:text-aizu-sub transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
        {/* ───────────────────────────────────────────────────────────────── */}

        {filteredPosts.length === 0 && (
          <p className="text-center py-20 font-serif text-aizu-sub/30 italic">
            No articles found.
          </p>
        )}
      </section>

      <style jsx="true">{`
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          display: flex;
          width: max-content;
          animation: infinite-scroll 80s linear infinite;
        }
          @keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin 15s linear infinite;
}
      `}</style>
    </div>
  );
}