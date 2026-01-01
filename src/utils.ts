export const FILE_NAME_REPLACE_MAP = new Map<string, string>([
    [":", "："],
    ["*", "＊"],
    ["!", "！"],
    ["?", "？"],
    ['"', "”"],
    ["<", "＜"],
    [">", "＞"],
    ["|", "｜"],
    ["/", "／"],
    ["\\", "￥"],
]);

/**
 * ファイル名として使用できない文字を全角文字に置換します。
 * @param name 対象のファイル名
 * @returns 置換後のファイル名
 */
export function sanitizeFileName(name: string): string {
    return name.replace(/[:*?"<>|/\\!]/g, (e) => FILE_NAME_REPLACE_MAP.get(e) ?? e);
}

/**
 * テキストから【】で囲まれた部分を削除します。
 * @param text 対象テキスト
 * @returns 削除後のテキスト
 */
export function removeBracketedText(text: string): string {
    return text.replace(/【.*?】/g, "");
}

/**
 * テキストから✅で囲まれた部分（✅...✅）を削除します。
 * @param text 対象テキスト
 * @returns 削除後のテキスト
 */
export function removeWhiteHeavyCheckMark(text: string): string {
    return text.replace(/\u2705.*?\u2705/g, "");
}
