import React from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Heart, MapPin, Coffee, Info, ArrowLeft } from "lucide-react";

const postFiles = import.meta.glob("../article/*.md", {
  as: "raw",
  eager: true,
});

export default function BlogPage() {
  const { id } = useParams();
  const rawContent = postFiles[`../article/${id}.md`];

  if (!rawContent) {
    return (
      <div className="min-h-screen flex items-center justify-center font-serif text-aizu-sub">
        記事が見つかりませんでした。
      </div>
    );
  }

  // Markdownパース処理
  const parseMarkdown = (raw) => {
    const metaMatch = raw.match(/^---\s*([\s\S]*?)\s*---/);
    const metaData = {};
    if (metaMatch) {
      metaMatch[1].split("\n").forEach((line) => {
        const [key, ...value] = line.split(":");
        if (key && value.length) {
          const val = value
            .join(":")
            .trim()
            .replace(/^["']|["']$/g, "");
          // カンマ区切りのデータ（lovePoints, tags）を配列に変換
          if (key.trim() === "lovePoints" || key.trim() === "tags") {
            metaData[key.trim()] = val.split(",").map((i) => i.trim());
          } else {
            metaData[key.trim()] = val;
          }
        }
      });
    }
    const body = raw.replace(/^---\s*[\s\S]*?\s*---/, "").trim();
    return { meta: metaData, body };
  };

  const { meta, body } = parseMarkdown(rawContent);

  return (
    <article className="min-h-screen bg-aizu-white pb-32">
      {/* 1. Header (日付・題名) */}
      <header className="pt-24 pb-12 px-6 text-center max-w-3xl mx-auto">
        <p className="text-[10px] tracking-[0.4em] text-aizu-sub/60 uppercase mb-4">
          {meta.date}
        </p>
        <h1 className="text-3xl md:text-4xl font-serif text-aizu-gray leading-relaxed tracking-wider mb-2">
          {meta.title}
        </h1>
        {/* 場所名（サブタイトル的に配置） */}
        <p className="text-sm text-kusumi-blue font-serif italic tracking-widest mt-4">
          @ {meta.locationName || "Aizu"}
        </p>
      </header>

      {/* 2. Main Photo */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 mb-16">
        {meta.thumbnail && (
          <img
            src={meta.thumbnail}
            alt={meta.title}
            className="w-full aspect-video object-cover rounded-sm shadow-sm"
          />
        )}
      </div>

      <div className="max-w-2xl mx-auto px-6">
        {/* 3. Love Points (推しポイント) */}
        {meta.lovePoints && (
          <section className="mb-20 bg-white p-8 md:p-10 rounded-sm border border-gray-100 shadow-sm relative overflow-hidden">
            {/* 背景の装飾アイコン */}
            <Heart
              size={80}
              className="absolute -right-4 -bottom-4 text-kusumi-pink/5 -rotate-12"
            />

            <div className="flex items-center gap-2 mb-8">
              <Heart size={16} className="text-kusumi-pink fill-kusumi-pink" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-kusumi-pink uppercase">
                Love Points
              </span>
            </div>
            <ul className="space-y-6 font-serif text-aizu-gray relative z-10">
              {meta.lovePoints.map((point, index) => (
                <li key={index} className="flex gap-4 items-baseline">
                  <span className="text-kusumi-pink font-serif italic text-sm">
                    0{index + 1}.
                  </span>
                  <p className="leading-relaxed">{point}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 4. Impression (感想 - Markdown本文) */}
        <section className="mb-24">
          <div className="flex items-center gap-2 mb-10 opacity-40">
            <div className="h-[1px] w-8 bg-aizu-sub"></div>
            <span className="text-[10px] tracking-widest uppercase">
              Impression
            </span>
          </div>
          <div className="font-serif text-aizu-gray leading-[2.4] tracking-wide text-lg font-light">
            <ReactMarkdown>{body}</ReactMarkdown>
          </div>
        </section>

        {/* 5. Practical Info (場所・タグ) */}
        <footer className="pt-12 border-t border-gray-100">
          <div className="bg-gray-50/50 p-8 rounded-sm space-y-8">
            {/* 場所情報 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-kusumi-green">
                <MapPin size={18} />
                <span className="text-xs font-bold tracking-widest uppercase text-aizu-sub">
                  Location
                </span>
              </div>
              <p className="text-sm text-aizu-gray font-medium pl-7 leading-relaxed">
                {meta.address}
                {meta.memo && (
                  <span className="block mt-2 text-xs text-aizu-sub font-normal">
                    ※ {meta.memo}
                  </span>
                )}
              </p>
            </div>

            {/* タグ */}
            {meta.tags && (
              <div className="flex flex-wrap gap-2 pl-7">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-aizu-sub border border-gray-200 px-2 py-0.5 rounded-sm bg-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-20 text-center">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 text-[20px] tracking-[0.3em] text-aizu-sub/60 hover:text-aizu-gray transition-colors"
            >
              <ArrowLeft
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
              BACK TO INDEX
            </Link>
          </div>
        </footer>
      </div>
    </article>
  );
}
