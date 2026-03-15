declare const process: any;

const FILE_NAME_REPLACE_MAP = new Map<string, string>([
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

export function sanitizeFileName(name: string): string {
  return name.replace(/[:*?"<>|/\\!]/g, (e) => FILE_NAME_REPLACE_MAP.get(e) ?? e);
}

interface WorkInfo {
  workName: string;
  cleanedUpWorkName: string;
  makerName: string;
  voiceActorsStr: string;
  releaseDate: { year: string; month: string; day: string };
  genre: string;
}

function removeBracketedText(text: string): string {
  return text.replace(/【.*?】/g, "");
}

function removeWhiteHeavyCheckMark(text: string): string {
  return text.replace(/\u2705.*?\u2705/g, "");
}

function downloadAsFile(fileName: string, BlobPart: BlobPart[], mimeType: string): void {
  const blob = new Blob(BlobPart, { type: mimeType });
  const downloadURL = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadURL;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadURL);
}

function main(): void {
  if (location.hostname !== "www.dlsite.com") {
    alert("DLsiteのページで実行してください。");
    return;
  }

  downloadWorkInfo();
  downloadWorksJacketImage();
}

function getWorkInfoFromDOM(): WorkInfo | null {
  const workNameElement = document.getElementById("work_name");

  if (workNameElement === null || workNameElement.textContent === null) {
    alert("作品名を取得できませんでした。");
    return null;
  }
  const workName = workNameElement.textContent.trim();

  const makerNameElement = document.querySelector("span.maker_name");
  if (makerNameElement === null || makerNameElement.textContent === null) {
    alert("サークル名を取得できませんでした。");
    return null;
  }
  const makerName = makerNameElement.textContent.trim();

  // Try to find the release date anchor using a robust XPath
  const releaseDateNode = document.evaluate(
    "//th[contains(., '販売日')]/following-sibling::td/a",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue as HTMLAnchorElement | null;

  let releaseDateHref: string | null = null;
  let releaseDateText: string | null = null;

  if (releaseDateNode) {
    releaseDateHref = releaseDateNode.href;
    releaseDateText = releaseDateNode.textContent?.trim() ?? null;
  } else {
    // Fallback: try to find the TD directly if A is missing
    console.warn("Release date anchor not found, trying fallback to CD.");
    const releaseDateTd = document.evaluate(
      "//th[contains(., '販売日')]/following-sibling::td",
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue as HTMLElement | null;
    if (releaseDateTd) {
      releaseDateText = releaseDateTd.textContent?.trim() ?? null;
    } else {
      console.error("Release date TD not found.");
    }
  }

  const { year, month, day } = parseReleaseDate(releaseDateText, releaseDateHref);

  if (!year || !month || !day) {
    console.error("Failed to parse release date.", { releaseDateText, releaseDateHref });
  }

  const voiceActorXPathResult = document.evaluate(
    "//th[contains(., '声優')]/following-sibling::td/a",
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null,
  );
  const voiceActors: string[] = [];
  for (let i = 0; i < voiceActorXPathResult.snapshotLength; i++) {
    const voiceActorElement = voiceActorXPathResult.snapshotItem(i);
    if (voiceActorElement !== null && voiceActorElement.textContent !== null) {
      voiceActors.push(voiceActorElement.textContent.trim());
    }
  }
  const voiceActorsStr = voiceActors.join(", ");
  const cleanedUpWorkName = removeWhiteHeavyCheckMark(removeBracketedText(workName));

  const ageRestrictionXPathResult = document.evaluate(
    "//th[contains(., '年齢指定')]/following-sibling::td",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  );
  const ageRestrictionElement = ageRestrictionXPathResult.singleNodeValue;
  const ageRestriction = ageRestrictionElement?.textContent?.trim() ?? "";
  const genre = determineGenre(ageRestriction);

  return {
    workName,
    cleanedUpWorkName,
    makerName,
    voiceActorsStr,
    releaseDate: { year, month, day },
    genre,
  };
}

function downloadWorkInfo(): void {
  const info = getWorkInfoFromDOM();
  if (!info) return;

  const text = JSON.stringify(
    {
      声優: info.voiceActorsStr,
      作品名: info.cleanedUpWorkName,
      リリース日: {
        年月日: `${info.releaseDate.year}-${info.releaseDate.month}-${info.releaseDate.day}`,
        年: info.releaseDate.year,
        月: info.releaseDate.month,
        日: info.releaseDate.day,
      },
      ジャンル: info.genre,
      サークル名: info.makerName,
      "作品名(オリジナル)": info.workName,
      フォルダ名: `[${info.makerName}] ${info.workName}`,
    },
    null,
    2,
  );

  const saveFileName = sanitizeFileName(`[${info.makerName}] ${info.cleanedUpWorkName}`);
  downloadAsFile(`${saveFileName}.txt`, [text], "text/plain");
}

function downloadWorksJacketImage(): void {
  const imageElement = document.querySelector(
    "#work_left ul.slider_items li:first-of-type source",
  ) as HTMLImageElement;
  if (imageElement === null) {
    alert("ジャケット画像を取得できませんでした。");
    return;
  }

  const imageUrl = new URL(imageElement.srcset, location.href);
  const saveFileName =
    imageUrl.pathname
      .split("/")
      .slice(-1)[0]
      .replace(/\.webp$/i, ".png") || "jacket.png";

  // 新しいImageオブジェクトを作成して画像を読み込む (CORS対策)
  const originalImage = new Image();
  originalImage.crossOrigin = "Anonymous"; // CORSリクエストを試みる
  originalImage.onload = function () {
    // 画像読み込み成功
    try {
      // Canvasを作成
      const canvas = document.createElement("canvas");
      const size = Math.max(originalImage.naturalWidth, originalImage.naturalHeight);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        alert("Canvasのコンテキスト取得に失敗しました");
        return;
      }

      // 背景を白で塗りつぶし
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, size, size);

      // Canvasの中央に画像を描画
      const x = (size - originalImage.naturalWidth) / 2;
      const y = (size - originalImage.naturalHeight) / 2;
      ctx.drawImage(originalImage, x, y);

      // Canvasの内容をPNGのBlobとして取得
      canvas.toBlob(function (blob) {
        if (blob) {
          downloadAsFile(saveFileName, [blob], "image/png");
        } else {
          alert(`PNG Blobの生成に失敗しました: ${imageUrl}`);
        }
      }, "image/png"); // PNG形式を指定
    } catch {
      // Canvas操作中のエラー (多くはCORS関連)
      alert(`画像の処理に失敗しました (CORSの問題の可能性が高いです):\n${imageUrl}`);
    }
  };
  // 画像の読み込みを開始
  originalImage.src = imageUrl.href;
}

// Export functions for testing
export function determineGenre(ageRestriction: string): string {
  const keywords = ["R-18", "R18", "18禁"];
  for (const keyword of keywords) {
    if (ageRestriction.includes(keyword)) {
      return "HVoiceDrama";
    }
  }
  return "VoiceDrama";
}

export function parseReleaseDate(
  dateString: string | null,
  urlString: string | null,
): { year: string; month: string; day: string } {
  let year = "";
  let month = "";
  let day = "";

  if (urlString) {
    const yMatch = urlString.match(/\/year\/(\d+)/);
    const mMatch = urlString.match(/\/mon\/(\d+)/);
    const dMatch = urlString.match(/\/day\/(\d+)/);

    if (yMatch) year = yMatch[1];
    if (mMatch) month = mMatch[1];
    if (dMatch) day = dMatch[1];
  }

  if (!year || !month || !day) {
    if (dateString) {
      const match = dateString.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/);
      if (match) {
        if (!year) year = match[1];
        if (!month) month = match[2];
        if (!day) day = match[3];
      }
    }
  }

  return { year, month, day };
}

// execute if not in test environment (simple check)
// @ts-ignore
if (typeof process === "undefined" || (process.env && process.env.NODE_ENV !== "test")) {
  main();
}
