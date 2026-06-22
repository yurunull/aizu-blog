import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // ページが変わったら、画面のスクロール位置を最上部 (x: 0, y: 0) にリセットする
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}