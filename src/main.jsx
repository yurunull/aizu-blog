import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // 追加
import "./index.css";
import Header from "./components/header.jsx";
import Home from "./pages/home.jsx"; // App から Home に名前を分かりやすく変更
import Blog from "./pages/blog.jsx";
import Map from "./pages/map.jsx"
import Mitinori from "./pages/route.jsx"
import Footer from "./components/footer.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {/* 全ページ共通のヘッダー */}
      <Header />

      <Routes>
        {/* トップページ */}
        <Route path="/" element={<Home />} />
        

        {/* ブログ詳細ページ（:id 部分にファイル名が入る） */}
        <Route path="/blog/:id" element={<Blog />} />

        <Route path="/map" element={<Map />} />
        <Route path="/route" element={<Mitinori />} />
      </Routes>

      {/* 全ページ共通のフッター */}
      <Footer />
    </BrowserRouter>
  </StrictMode>,
);
