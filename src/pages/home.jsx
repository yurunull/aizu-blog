import React from "react";
import { Link } from "react-router-dom";

// --- Markdownファイルを一括読み込み ---
const postFiles = import.meta.glob("../article/*.md", {
  as: "raw",
  eager: true,
});

export default function Home() {
  const allPostsData = Object.keys(postFiles)
    .map((filePath) => {
      const content = postFiles[filePath];
      const fileName = filePath.split("/").pop();
      const id = fileName.replace(/\.md$/, "");

      const metaMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
      const metaData = {};

      if (metaMatch) {
        const metaLines = metaMatch[1].split("\n");
        metaLines.forEach((line) => {
          const [key, ...value] = line.split(":");
          if (key && value) {
            metaData[key.trim()] = value
              .join(":")
              .trim()
              .replace(/^["']|["']$/g, "");
          }
        });
      }

      return { id, ...metaData };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const scrollingPosts = [...allPostsData, ...allPostsData];

  return (
    <>
      {/* --- メインビジュアル（縦書き部分を復活） --- */}
      <main className="min-h-[35vh] w-full flex justify-center bg-aizu-white relative pt-12 md:pt-24">
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
              <span className="tracking-[0.3em] mb-8 md:mb-16">ゆるり、</span>
              <span className="tracking-[0.3em] mb-8 md:mb-16">ぶらりと、</span>
              <span className="tracking-[0.3em]">会津手帖。</span>
            </div>
          </h2>
        </div>
      </main>

      {/* --- ブログスライドショーセクション --- */}
      <section className="bg-aizu-white pb-20 overflow-hidden">
        <div className="relative flex">
          <div className="flex animate-infinite-scroll hover:[animation-play-state:paused] cursor-pointer">
            {scrollingPosts.map((post, index) => (
              <div
                key={`${post.id}-${index}`}
                className="w-[280px] md:w-[400px] flex-shrink-0 px-3 md:px-6"
              >
                <Link to={`/blog/${post.id}`} className="group space-y-4 block">
                  <div className="aspect-[16/10] overflow-hidden bg-aizu-gray/5 rounded-sm">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <p className="text-[10px] tracking-widest text-aizu-sub/60">
                      {post.date}
                    </p>
                    <h3 className="font-serif text-base md:text-lg text-aizu-gray tracking-wider group-hover:text-aizu-sub transition-colors duration-300">
                      {post.title}
                    </h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx="true">{`
        @keyframes infinite-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-infinite-scroll {
          display: flex;
          width: max-content;
          animation: infinite-scroll 60s linear infinite;
        }
      `}</style>
    </>
  );
}
