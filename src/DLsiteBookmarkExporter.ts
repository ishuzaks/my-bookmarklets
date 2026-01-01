/**
 * DLsiteのページからサークル名と作品名を抽出し、テキストファイルとしてダウンロードするスクリプト。
 * 
 * 抽出対象:
 * - サークル名: .maker_name a
 * - 作品名: .work_name a
 * 
 * 出力フォーマット:
 * [サークル名] 作品名
 */

/**
 * 指定されたセレクタに一致する要素からテキストコンテンツを抽出します。
 * @param selector CSSセレクタ
 * @returns テキストの配列
 */
import {
    sanitizeFileName,
    removeBracketedText,
    removeWhiteHeavyCheckMark,
} from "./utils";


/**
 * 指定されたセレクタに一致する要素からテキストコンテンツを抽出します。
 * @param selector CSSセレクタ
 * @returns テキストの配列
 */
function extractTexts(selector: string): string[] {
    const elements = document.querySelectorAll<HTMLAnchorElement>(selector);
    return Array.from(elements).map((el) => el.textContent?.trim() || "").filter(text => text !== "");
}



/**
 * サークル名と作品名のリストを結合してブックマークリストを作成します。
 * @param makers サークル名の配列
 * @param works 作品名の配列
 * @returns 整形されたブックマークリスト文字列
 */
export function generateBookmarkContent(makers: string[], works: string[]): string {
    const lines: string[] = [];
    const count = Math.min(makers.length, works.length);

    for (let i = 0; i < count; i++) {
        const cleanedWorkName = removeWhiteHeavyCheckMark(removeBracketedText(works[i])).trim();
        const line = sanitizeFileName(`[${makers[i]}] ${cleanedWorkName}`);
        lines.push(line);
    }

    return lines.join("\r\n");
}

/**
 * テキストデータをファイルとしてダウンロードさせます。
 * @param content ファイルの内容
 * @param filename 保存するファイル名
 */
function downloadTextFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();

    // クリーンアップ
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
}

/**
 * メイン処理を実行します。
 */
export function execute(): void {
    try {
        const makers = extractTexts(".maker_name a");
        const works = extractTexts(".work_name a");

        if (makers.length === 0 && works.length === 0) {
            alert("ブックマーク対象の要素（サークル名または作品名）が見つかりませんでした。");
            return;
        }

        if (makers.length !== works.length) {
            console.warn(`要素数の不一致: サークル名(${makers.length}) != 作品名(${works.length})。少ない方に合わせて出力します。`);
        }

        const content = generateBookmarkContent(makers, works);
        downloadTextFile(content, "bookmarks.txt");

    } catch (error) {
        console.error("ブックマーク抽出中にエラーが発生しました:", error);
        alert("エラーが発生しました。コンソールを確認してください。");
    }
}

// スクリプトの実行
execute();
