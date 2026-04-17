// posts.js から関数をインポート
import { getSortedPostsData } from "../lib/posts";

// --- クライアント側（ブラウザ）で動く部分 ---
export default function Home({ allPostsData }) {
  // ここでは fs や path は使わず、既に取得済みの allPostsData を使うだけ
  return <div>{/* スライドショーのコードなど */}</div>;
}

// --- サーバー側だけで動く部分 ---
export async function getStaticProps() {
  // ここはサーバーで実行されるので fs や path が使える
  const allPostsData = getSortedPostsData();

  return {
    props: {
      allPostsData, // これが Home コンポーネントの引数に渡される
    },
  };
}
