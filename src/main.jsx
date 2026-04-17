import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // 追加
import "./index.css";
import Header from "./components/header.jsx";
import Home from "./pages/home.jsx"; // App から Home に名前を分かりやすく変更
import Blog from "./pages/blog.jsx";
import Footer from "./components/footer.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* 全ページ共通のヘッダー */}
      <Header />

      <Routes>
        {/* トップページ */}
        <Route path="/" element={<Home />} />

        {/* ブログ詳細ページ（:id 部分にファイル名が入る） */}
        <Route path="/blog/:id" element={<Blog />} />
      </Routes>

      {/* 全ページ共通のフッター */}
      <Footer />
    </BrowserRouter>
  </StrictMode>,
);
