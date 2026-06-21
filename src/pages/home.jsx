import React, { useState, useMemo } from "react";
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
      {/* 1. メインビジュアル */}
      <main className="min-h-[35vh] w-full flex justify-center relative pt-12 md:pt-24">
        <div className="relative">
          <h2
            className="font-serif font-extralight text-aizu-gray"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              lineHeight: "5.0",
            }}
          >
            <div className="text-4xl md:text-[6.5rem] drop-shadow-sm flex flex-col items-start">
              <span className="tracking-[0.3em] mb-8 md:mb-16">
                <BudouxText text="ゆるり、" />
              </span>
              <span className="tracking-[0.3em] mb-8 md:mb-16">
                <BudouxText text="ぶらりと、" />
              </span>
              <span className="tracking-[0.3em]">
                <BudouxText text="会津手帖。" />
              </span>
            </div>
          </h2>
        </div>
      </main>

      {/* 2. スライドショー */}
      <section className="py-24 overflow-hidden">
        <div className="flex animate-infinite-scroll">
          {[...allPostsData, ...allPostsData].map((post, index) => (
            <div
              key={`${post.id}-${index}`}
              className="w-[280px] md:w-[400px] flex-shrink-0 px-3 md:px-6"
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

      {/* 3. タグ選択セクション */}
      <section className="bg-white py-20 px-6 border-t border-gray-50">
        <div className="max-w-4xl mx-auto text-center">
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

        {/* 4. 記事一覧グリッド（filteredPosts から currentPosts に変更） */}
        <div className="max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {currentPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="group">
              <div className="relative aspect-[4/5] overflow-hidden mb-6 rounded-sm">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-[10px] tracking-widest text-aizu-sub/50 uppercase">
                  <span>{post.date}</span>
                  <span className="w-4 h-[1px] bg-gray-200"></span>
                </div>
                <h4 className="text-xl font-serif text-aizu-gray leading-snug group-hover:text-kusumi-blue transition-colors">
                  <BudouxText text={post.title} />
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {post.tags.map((t) => (
                    <span key={t} className="text-[9px] text-aizu-sub/40 italic">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="pt-2 flex items-center gap-2 text-[10px] text-kusumi-blue font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
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
      `}</style>
    </div>
  );
}