#!/bin/bash
# ================================================
# 🐯 SAGAT SF6 NOTE — 自動セットアップスクリプト
# ================================================
# 使い方: このファイルを sagat-sf6-note フォルダに入れて
#         bash setup.sh を実行するだけ！
# ================================================

set -e

REPO_NAME="sagat-sf6-note"
TEAM_ID="team_fmDYaUBvVuiph3OuOk6AWk8f"
SUPABASE_URL="https://epmujeishyhwdswbztjo.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwbXVqZWlzaHlod2Rzd2J6dGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3Mjk0NzQsImV4cCI6MjA5MTMwNTQ3NH0.gfraOE-R4oHaWq3LLhi1pL6HK5zfcgLIBLZRTLiNGrE"

echo ""
echo "🐯 ====================================="
echo "   SAGAT SF6 NOTE セットアップ開始"
echo "======================================="
echo ""

# ── 1. 依存チェック ──
echo "📦 依存関係チェック中..."
for cmd in git node npm; do
  if ! command -v $cmd &>/dev/null; then
    echo "❌ $cmd がインストールされていません"
    echo "   https://nodejs.org からインストールしてください"
    exit 1
  fi
done
echo "✅ git / node / npm OK"

# ── 2. npm install ──
echo ""
echo "📦 npm install 中..."
npm install
echo "✅ パッケージインストール完了"

# ── 3. GitHub CLI チェック ──
echo ""
echo "🐙 GitHub設定中..."
if command -v gh &>/dev/null; then
  echo "GitHub CLIが見つかりました。リポジトリを自動作成します..."
  
  # ログイン確認
  if ! gh auth status &>/dev/null; then
    echo "GitHubにログインしてください："
    gh auth login
  fi
  
  # リポジトリ作成（publicで作成）
  echo "リポジトリ作成中: $REPO_NAME"
  gh repo create "$REPO_NAME" --public --source=. --remote=origin --push 2>/dev/null || {
    echo "既存リポジトリにpushします..."
    GITHUB_USER=$(gh api user --jq .login)
    git remote set-url origin "https://github.com/$GITHUB_USER/$REPO_NAME.git" 2>/dev/null || \
    git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
    git add -A
    git commit -m "🐯 SAGAT SF6 NOTE initial" 2>/dev/null || true
    git branch -M main
    git push -u origin main
  }
  
  GITHUB_USER=$(gh api user --jq .login)
  GITHUB_URL="https://github.com/$GITHUB_USER/$REPO_NAME"
  echo "✅ GitHub: $GITHUB_URL"

else
  echo "⚠️  GitHub CLI が未インストールです"
  echo ""
  echo "手動でGitHubリポジトリを作成してください："
  echo "  1. https://github.com/new を開く"
  echo "  2. Repository name: $REPO_NAME"
  echo "  3. Public を選択して作成"
  echo ""
  read -p "リポジトリのURLを入力してください (例: https://github.com/au6/sagat-sf6-note): " GITHUB_URL
  
  git init 2>/dev/null || true
  git add -A
  git commit -m "🐯 SAGAT SF6 NOTE initial" 2>/dev/null || true
  git branch -M main 2>/dev/null || true
  git remote add origin "$GITHUB_URL.git" 2>/dev/null || git remote set-url origin "$GITHUB_URL.git"
  git push -u origin main
  echo "✅ GitHub push完了"
fi

# ── 4. Vercel ──
echo ""
echo "🚀 Vercelデプロイ中..."

if command -v vercel &>/dev/null; then
  echo "Vercel CLIでデプロイします..."
  
  # env変数をVercelに設定
  echo "$SUPABASE_URL" | vercel env add VITE_SUPABASE_URL production --yes 2>/dev/null || true
  echo "$SUPABASE_KEY" | vercel env add VITE_SUPABASE_ANON_KEY production --yes 2>/dev/null || true
  
  vercel --prod --yes
  echo "✅ Vercelデプロイ完了！"

elif command -v npx &>/dev/null; then
  echo "npx vercelでデプロイします..."
  
  # env変数設定
  echo "$SUPABASE_URL" | npx vercel env add VITE_SUPABASE_URL production --yes 2>/dev/null || true
  echo "$SUPABASE_KEY" | npx vercel env add VITE_SUPABASE_ANON_KEY production --yes 2>/dev/null || true
  
  npx vercel --prod --yes
  echo "✅ Vercelデプロイ完了！"

else
  echo ""
  echo "⚠️  Vercel CLIが見つかりません"
  echo ""
  echo "以下の手順でVercelにデプロイしてください："
  echo ""
  echo "  1. https://vercel.com/new を開く"
  echo "  2. '$REPO_NAME' を選択してインポート"
  echo "  3. Environment Variables に以下を追加："
  echo ""
  echo "     VITE_SUPABASE_URL"
  echo "     = $SUPABASE_URL"
  echo ""
  echo "     VITE_SUPABASE_ANON_KEY"
  echo "     = $SUPABASE_KEY"
  echo ""
  echo "  4. Deploy ボタンを押す"
fi

echo ""
echo "🐯 ====================================="
echo "   セットアップ完了！"
echo "======================================="
echo ""
echo "📱 あとはVercelのURLをブックマークして使ってください！"
echo ""
