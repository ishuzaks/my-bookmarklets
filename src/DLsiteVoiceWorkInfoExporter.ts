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

function downloadWorkInfo(): void {
  const workNameElement = document.getElementById("work_name");

  if (workNameElement === null || workNameElement.textContent === null) {
    alert("作品名を取得できませんでした。");
    return;
  }
  const workName = workNameElement.textContent.trim();

  const makerNameElement = document.querySelector("span.maker_name");
  if (makerNameElement === null || makerNameElement.textContent === null) {
    alert("サークル名を取得できませんでした。");
    return;
  }
  const makerName = makerNameElement.textContent.trim();
  const published_date_href = document.querySelector('a[href*="year"]')?.getAttribute("href");
  const yearMatchedObj = published_date_href?.match(/\/year\/(\d+)\//);
  const monthMatchedObj = published_date_href?.match(/\/mon\/(\d+)\//);
  const dayMatchedObj = published_date_href?.match(/\/day\/(\d+)\//);
  const year = yearMatchedObj && yearMatchedObj.length >= 2 ? yearMatchedObj[1] : "";
  const month = monthMatchedObj && monthMatchedObj.length >= 2 ? monthMatchedObj[1] : "";
  const day = dayMatchedObj && dayMatchedObj.length >= 2 ? dayMatchedObj[1] : "";
  const voiceActorXPathResult = document.evaluate(
    "//th[contains(text(), '声優')]/following-sibling::td/a",
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
  const text = JSON.stringify(
    {
      声優: voiceActorsStr,
      作品名: cleanedUpWorkName,
      リリース日: {
        年月日: `${year}-${month}-${day}`,
        年: year,
        月: month,
        日: day,
      },
      ジャンル: "HVoiceDrama",
      サークル名: makerName,
      "作品名(オリジナル)": workName,
      フォルダ名: `[${makerName}] ${workName}`,
    },
    null,
    2,
  );

  const saveFileName = ("[" + makerName + "] " + cleanedUpWorkName).replace(
    /[:*?"<>|/\\]/g,
    (e: string): string => {
      const map = new Map<string, string>([
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
      return map.get(e) ?? e;
    },
  );
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
      canvas.width = originalImage.naturalWidth;
      canvas.height = originalImage.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        alert("Canvasのコンテキスト取得に失敗しました");
        return;
      }
      // Canvasに画像を描画
      ctx.drawImage(originalImage, 0, 0);

      // Canvasの内容をPNGのBlobとして取得
      canvas.toBlob(function (blob) {
        if (blob) {
          downloadAsFile(saveFileName, [blob], "image/png");
        } else {
          alert(`PNG Blobの生成に失敗しました: ${imageUrl}`);
        }
      }, "image/png"); // PNG形式を指定
    } catch (e) {
      // Canvas操作中のエラー (多くはCORS関連)
      alert(`画像の処理に失敗しました (CORSの問題の可能性が高いです):\n${imageUrl}`);
    }
  };
  // 画像の読み込みを開始
  originalImage.src = imageUrl.href;
}

main();
