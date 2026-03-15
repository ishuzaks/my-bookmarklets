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

## Commands

- **Build**: `npm run build`
- **Test**: `npm test`
- **Lint**: `npm run lint`
- **Format**: `npm run format`
