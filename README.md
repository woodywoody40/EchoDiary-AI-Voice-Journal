<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# EchoDiary - AI 語音日記

一個由 AI 驅動的智慧語音日記應用程式，使用 Google Gemini API 提供智能分析與洞察。

## ✨ 功能特色

- 🎤 **語音記錄** - 透過語音輸入輕鬆記錄您的日常想法與心情
- 🤖 **AI 分析** - 使用 Google Gemini AI 分析您的日記內容
- 📊 **數據視覺化** - 追蹤並視覺化您的情緒與行為模式
- 📱 **PWA 支援** - 可作為漸進式網頁應用程式安裝，支援離線使用
- 🎨 **現代化介面** - 使用 React 19 與 TypeScript 打造的流暢用戶體驗

## 🚀 快速開始

### 前置需求

- Node.js (建議版本 18 或以上)
- Gemini API 金鑰 ([取得金鑰](https://ai.google.dev/))

### 本地運行

1. **安裝依賴套件**
   ```bash
   npm install
   ```

2. **設定環境變數**

   在專案根目錄創建 `.env.local` 檔案，並設定您的 Gemini API 金鑰：
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

4. **在瀏覽器中開啟**

   應用程式將在 `http://localhost:5173` 運行

### 建置部署

建置生產版本：
```bash
npm run build
```

預覽生產版本：
```bash
npm run preview
```

## 🛠️ 技術架構

- **前端框架**: React 19
- **程式語言**: TypeScript
- **建置工具**: Vite
- **AI 引擎**: Google Gemini API
- **圖表庫**: Recharts
- **PWA**: vite-plugin-pwa

## 📱 AI Studio

在 AI Studio 中查看此應用程式：
https://ai.studio/apps/drive/1auhbHsxbOZNDgroL_EALomIbdm6ojTAm

## 📄 授權

本專案為私有專案。

## 🤝 貢獻

歡迎提交問題回報或功能建議！
