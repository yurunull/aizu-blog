import React from "react";
import ReactMarkdown from "react-markdown";

export default function MainContent({ article, pastArticles }) {
  return (
    <main className="max-w-3xl mx-auto px-6 pb-20">
      {/* メイン記事カード */}
      <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-10">
        <div className="aspect-video bg-gray-200 flex items-center justify-center text-gray-400">
          [ ここに {article.title} の写真を置く ]
        </div>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-kusumi-green/20 text-kusumi-green text-xs px-3 py-1 rounded-full font-medium">
              {article.category}
            </span>
            <time className="text-xs text-aizu-sub">{article.date}</time>
          </div>

          <h2 className="text-2xl font-bold mb-4 leading-relaxed">
            {article.title}
          </h2>

          {/* Markdown コンテンツ */}
          <div className="prose prose-slate max-w-none text-aizu-sub leading-loose mb-6">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>

          <button className="text-kusumi-pink font-bold text-sm hover:translate-x-1 transition-transform inline-flex items-center">
            日記の続きを読む →
          </button>
        </div>
      </article>

      {/* 過去の記事リスト */}
      <section>
        <h3 className="text-sm font-bold text-aizu-sub mb-6 border-b pb-2">
          他の日の日記
        </h3>
        <div className="grid gap-4">
          {pastArticles.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 border-b border-gray-50 italic"
            >
              <span className="text-aizu-gray">{item.title}</span>
              <span className="text-xs text-aizu-sub">{item.date}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
