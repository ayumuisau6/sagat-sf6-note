# 🐯 SAGAT SF6 NOTE

サガット（ストリートファイター6）フレームデータ & コンボノートアプリ

## 技術スタック

- **フロントエンド**: React + Vite
- **データベース**: Supabase (PostgreSQL)
- **ホスティング**: Vercel

## ローカル開発

```bash
npm install
npm run dev
```

## 環境変数

`.env` ファイルに以下を設定：

```
VITE_SUPABASE_URL=https://epmujeishyhwdswbztjo.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Vercelデプロイ

1. GitHubにpushする
2. [vercel.com](https://vercel.com) でGitHubリポジトリをインポート
3. Environment Variablesに上記2つを設定
4. Deploy！

## 機能

- 📊 **技データ**: サガット全技のフレームデータ（発生/持続/硬直/ヒット差/ガード差）
- ⚡ **コンボノート**: 10カテゴリのコンボをタッチ操作で記録・管理
  - タッチパレットで技を追加
  - Supabaseにリアルタイム保存
