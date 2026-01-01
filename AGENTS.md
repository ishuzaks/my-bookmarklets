# AI Agent Guidelines

このドキュメントは、本プロジェクト（my-bookmarklets）に参加するAIエージェントのための行動指針です。

## Project Overview

DLsite等のWebサイトで動作するブックマークレットをTypeScriptで開発・管理しています。
メインプロダクトは `DLsiteVoiceWorkInfoExporter` です。

## Tech Stack

- **Language**: TypeScript
- **Bundler**: esbuild (`node esbuild.mjs` でビルド)
- **Test**: Vitest
- **Linter/Formatter**: ESLint, Prettier

## Directory Structure

- `src/`: ソースコード
- `dist/`: バンドル済み出力（ブックマークレットとして使用）
- `tests/`: テストコード
- `docs/`: ドキュメント

## Development Rules

- **事前確認**: `docs/ai`フォルダの中にあるドキュメントを必ずすべて確認した上で作業すること。
- **言語**: コミットメッセージ、コメント、ドキュメントは全て**日本語**を使用してください。
- **TDD (Test Driven Development)**: 原則としてテスト駆動開発を行ってください。ロジック変更時はまずテストを書き、その後に実装を行ってください。
- **安全性**: 既存の挙動を壊さないよう、リファクタリング時は慎重に行ってください。
- **DRY原則 (Don't Repeat Yourself)**: 複数のスクリプトで共通するロジック（文字列操作、バリデーション等）は、`src/utils.ts` 等の共通モジュールに切り出し、コードの重複を避けてください。

## Implementation Checkpoints

開発時には以下のポイントを必ず確認してください。

- **DOM操作の安全性**: `querySelector` や `getElementById` の戻り値は必ず Null check を行ってください。要素が見つからない場合はコンソールエラーだけでなく、`alert` 等でユーザーに分かりやすく通知することを推奨します。
- **型定義**: `any` 型の使用は避け、`HTMLElement` や `HTMLAnchorElement` など適切な型にキャストして使用してください。
- **クロスプラットフォーム互換性**: 生成するテキストファイルの改行コードは、Windows環境での可読性を考慮して `CRLF (\r\n)` を使用してください。
- **ファイル名のサニタイズ**: ファイルとしてダウンロードさせる場合、ファイル名にはOSで使用できない文字が含まれる可能性があります。必ず `sanitizeFileName` (from `utils.ts`) を使用して無害化してください。

## Commands

- **Build**: `npm run build`
- **Test**: `npm test`
- **Lint**: `npm run lint`
- **Format**: `npm run format`
