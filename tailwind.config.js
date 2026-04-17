/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "aizu-white": "#F9F9F9",
        "aizu-gray": "#333333",
        "aizu-sub": "#777777",
        "kusumi-blue": "#87A7B3",
        "kusumi-green": "#A7B896",
        "kusumi-pink": "#C5A3A1",
      },
      // --- ここから追加 ---
      keyframes: {
        "bicycle-move": {
          "0%": { transform: "translateX(-50px)" }, // 画面外左から
          "100%": { transform: "translateX(105vw)" }, // 画面外右へ
        },
      },
      animation: {
        "bicycle-slow": "bicycle-move 30s linear infinite", // 30秒かけてゆっくり移動
      },
      // --- ここまで追加 ---
    },
  },
  plugins: [],
};
