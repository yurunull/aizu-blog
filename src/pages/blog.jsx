import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  Heart,
  MapPin,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { loadDefaultJapaneseParser } from "budoux";

const parser = loadDefaultJapaneseParser();

const postFiles = import.meta.glob("../article/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export default function BlogPage() {
  const { id } = useParams();

  // 1. 記事データの取得
  const rawContent = useMemo(() => {
    const directPath = `../article/${id}.md`;
    if (postFiles[directPath]) return postFiles[directPath];
    const allPaths = Object.keys(postFiles);
    const fuzzyPath = allPaths.find((path) =>
      path.toLowerCase().endsWith(`/${id?.toLowerCase()}.md`),
    );
    return fuzzyPath ? postFiles[fuzzyPath] : null;
  }, [id]);

  // ✨ どんなデータが来ても安全に文字列化してBudouxに通すコンポーネント
  const BudouxText = ({ text }) => {
    if (!text) return null;
    
    // 配列やオブジェクトが混ざってきた場合を想定し、安全に文字列（プレーンテキスト）へと変換
    const safeText = Array.isArray(text) 
      ? text.join("") 
      : typeof text === "object" 
        ? text.toString() 
        : String(text);

    // 空っぽ、または実体のない文字列なら何も出力しない（エラー防止）
    if (!safeText || safeText.trim() === "" || safeText === "[object Object]") {
      return <>{text}</>; 
    }

    try {
      return (
        <span
          dangerouslySetInnerHTML={{ __html: parser.translateHTMLString(safeText) }}
        />
      );
    } catch (e) {
      // 万が一Budoux側でエラーが起きても、プレーンテキストを表示して画面崩壊を防ぐ
      return <>{safeText}</>;
    }
  };

  // 2. Markdownパースロジック（imagesに対応）
  const parseMarkdown = (raw) => {
const metaMatch = raw?.match?.(/^---\s*([\s\S]*?)\s*---/);
    const metaData = {
      date: "",
      title: "",
      locationName: "Aizu",
      images: [], // 複数画像に対応
      address: "",
      memo: "",
      lovePoints: [],
      tags: [],
      links: [],
      mapUrl: "",
    };

    if (metaMatch) {
      metaMatch[1].split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split(":");
        if (key && valueParts.length) {
          const trimmedKey = key.trim();
          const val = valueParts
            .join(":")
            .trim()
            .replace(/^["']|["']$/g, "");

          if (["lovePoints", "tags", "links", "images"].includes(trimmedKey)) {
            metaData[trimmedKey] = val
              .split(",")
              .map((i) => i.trim())
              .filter(Boolean);
          } else {
            metaData[trimmedKey] = val;
          }
        }
      });
    }
    const body = raw.replace(/^---\s*[\s\S]*?\s*---/, "").trim();
    return { meta: metaData, body };
  };

  const { meta, body } = useMemo(
    () => (rawContent ? parseMarkdown(rawContent) : { meta: {}, body: "" }),
    [rawContent],
  );

  // 画像配列の整形
  const gallery = useMemo(() => {
    return (
      meta.images?.map((imgStr) => {
        const [url, caption] = imgStr.split("|");
        return { url, caption };
      }) || []
    );
  }, [meta.images]);

  // 3. Markdownコンポーネント（本文中の{image:X}置換機能付き）
  const MarkdownComponents = useMemo(
    () => ({
      p: ({ children }) => {
        // children が文字列、または単一要素の配列から文字列を抽出できるかチェック
        const isString = typeof children === "string";
        const contentStr = isString ? children : (Array.isArray(children) && typeof children[0] === "string" ? children[0] : "");

        // 本文中に {image:0} などの記述があれば画像に置換
        if (contentStr.match(/^{image:\d+}$/)) {
          const index = parseInt(contentStr.match(/\d+/)[0]);
          const img = gallery[index];
          if (!img) return null;
          return (
            <figure className="my-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="overflow-hidden rounded-sm shadow-lg">
                <img
                  src={img.url}
                  alt={img.caption}
                  className="w-full object-cover hover:scale-105 transition-transform duration-1000"
                />
              </div>
              {img.caption && (
                <figcaption className="mt-4 text-center text-sm text-aizu-sub/60 font-serif italic tracking-widest">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          );
        }
        
        // 通常の文章段落
        return (
          <p className="mb-10 last:mb-0">
            <BudouxText text={children} />
          </p>
        );
      },
    }),
    [gallery],
  );

  // 記事がない場合
  if (!rawContent) {
    return (
      <div className="min-h-screen bg-aizu-white flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl font-serif text-aizu-gray mb-4 tracking-widest">
          No Article Found
        </h2>
        <p className="text-aizu-sub/60 mb-8 font-serif tracking-widest">
          記事「{id}」は見つかりませんでした
        </p>
        <Link
          to="/"
          className="group flex flex-col items-center gap-4 hover:opacity-60 transition-opacity"
        >
          <ArrowLeft
            size={24}
            strokeWidth={1}
            className="text-aizu-sub/40 group-hover:-translate-y-1 transition-transform"
          />
          <span className="text-[10px] tracking-[0.6em] text-aizu-sub/40 uppercase">
            Back to Index
          </span>
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-aizu-white pb-32 selection:bg-kusumi-blue/10 animate-in fade-in duration-700">
      {/* HEADER */}
      <header className="pt-28 pb-16 px-6 text-center max-w-4xl mx-auto">
        <p className="text-[11px] tracking-[0.5em] text-aizu-sub/40 uppercase mb-6 flex items-center justify-center gap-4">
          <span className="h-[1px] w-8 bg-gray-200"></span>
          {meta.date}
          <span className="h-[1px] w-8 bg-gray-200"></span>
        </p>
        <h1 className="text-3xl md:text-5xl font-serif text-aizu-gray leading-[1.4] tracking-tight mb-6">
          <BudouxText text={meta.title} />
        </h1>
        <p className="text-[20px] text-kusumi-blue font-serif italic tracking-[0.2em]">
          @ {meta.locationName}
        </p>
      </header>

      {/* MAIN VISUAL (本文で1枚目を使っていない場合のみ表示) */}
      <div className="max-w-6xl mx-auto px-4 md:px-12 mb-20">
        {gallery.length > 0 && !body.includes("{image:0}") && (
          <div className="overflow-hidden rounded-sm shadow-xl shadow-gray-200/50">
            <img
              src={gallery[0].url}
              alt={meta.title}
              className="w-full aspect-[16/9] object-cover hover:scale-105 transition-transform duration-1000"
            />
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-6">
        {/* LOVE POINTS */}
        {meta.lovePoints?.length > 0 && (
          <section className="mb-24 bg-white/60 backdrop-blur-sm p-10 md:p-14 rounded-sm border border-gray-100/50 shadow-sm relative overflow-hidden group">
            <Heart
              size={120}
              className="absolute -right-6 -bottom-6 text-kusumi-pink/5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000"
            />
            <div className="flex items-center gap-3 mb-10">
              <Heart
                size={18}
                className="text-kusumi-pink/80 fill-kusumi-pink/10"
              />
              <span className="text-[20px] font-bold tracking-[0.3em] text-kusumi-pink/80 uppercase">
                Love Points
              </span>
            </div>
            <ul className="space-y-8 font-serif text-aizu-gray relative z-10">
              {meta.lovePoints.map((point, index) => (
                <li
                  key={index}
                  className="flex gap-6 items-baseline border-b border-gray-50 pb-6 last:border-0 last:pb-0"
                >
                  <span className="text-kusumi-pink/40 font-serif italic text-xl">
                    0{index + 1}
                  </span>
                  <p className="leading-relaxed text-[17px]">
                    <BudouxText text={point} />
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* IMPRESSION / BODY */}
        <section className="mb-32">
          <div className="flex items-center gap-3 mb-12 opacity-30 justify-center md:justify-start">
            <div className="h-[1px] w-12 bg-aizu-sub"></div>
            <span className="text-[15px] tracking-[0.5em] uppercase">
              Main Text
            </span>
          </div>
          <div className="font-serif text-aizu-gray leading-[2.6] tracking-wide text-[18px] font-light text-justify">
            <ReactMarkdown components={MarkdownComponents}>
              {body}
            </ReactMarkdown>
          </div>
        </section>

        {/* FOOTER INFO */}
        <footer className="pt-16 border-t border-gray-100">
          <div className="bg-gray-50/40 p-10 rounded-sm space-y-10">
            {/* Location Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 text-kusumi-green/70">
                <MapPin size={20} />
                <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-aizu-sub/60">
                  Location
                </span>
              </div>
              <div className="pl-8 space-y-6">
                <p className="text-2xl text-aizu-gray font-medium tracking-wider">
                  {meta.address}
                </p>
                {meta.mapUrl && (
                  <div className="w-full aspect-video rounded-sm overflow-hidden border border-gray-200 shadow-inner">
                    <iframe
                      src={meta.mapUrl}
                      className="w-full h-full grayscale opacity-80"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                )}
                {meta.memo && (
                  <p className="text-[20px] text-aizu-sub/70 font-light flex gap-2">
                    <span className="text-kusumi-pink">※</span>
                    <BudouxText text={meta.memo} />
                  </p>
                )}
              </div>
            </div>

            {/* Links Section */}
            {meta.links?.length > 0 && (
              <div className="flex flex-col gap-6 border-t border-gray-100 pt-10">
                <div className="flex items-center gap-3 text-kusumi-blue/70">
                  <ArrowRight size={20} />
                  <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-aizu-sub/60">
                    Links
                  </span>
                </div>
                <div className="pl-8 flex flex-col gap-4">
                  {meta.links.map((link, idx) => {
                    const [label, url] = link.split("|");
                    return (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[15px] text-kusumi-blue hover:underline underline-offset-4 flex items-center gap-2"
                      >
                        {label || url}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tags Section */}
            {meta.tags?.length > 0 && (
              <div className="flex flex-wrap gap-3 pl-8 pt-6">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[15px] tracking-widest text-aizu-sub/70 border border-gray-200/60 px-3 py-1 rounded-sm bg-white/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* BACK TO INDEX BUTTON */}
          <div className="mt-24 text-center">
            <Link
              to="/"
              className="group inline-flex flex-col items-center gap-4 transition-opacity hover:opacity-60"
            >
              <ArrowLeft
                size={24}
                strokeWidth={1}
                className="text-aizu-sub/40 group-hover:-translate-y-1 transition-transform"
              />
              <span className="text-[10px] tracking-[0.6em] text-aizu-sub/40 uppercase">
                Back to Index
              </span>
            </Link>
          </div>
        </footer>
      </div>
    </article>
  );
}