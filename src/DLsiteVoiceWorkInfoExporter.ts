function removeBracketedText(text: string): string {
  return text.replace(/【.*?】/g, "");
}

function main(): void {
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
  const saveFileName = ("[" + makerName + "] " + workName).replace(
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
    }
  );
  const yearMatchedObj = document
    .querySelector('a[href*="year"]')
    ?.getAttribute("href")
    ?.match(/\/year\/(\d+)\//);
  const year = yearMatchedObj ? yearMatchedObj[1] : "";
  const voiceActorXPathResult = document.evaluate(
    "//th[contains(text(), '声優')]/following-sibling::td/a",
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  const voiceActors: string[] = [];
  for (let i = 0; i < voiceActorXPathResult.snapshotLength; i++) {
    const voiceActorElement = voiceActorXPathResult.snapshotItem(i);
    if (voiceActorElement !== null && voiceActorElement.textContent !== null) {
      voiceActors.push(voiceActorElement.textContent.trim());
    }
  }
  const voiceActorsStr = voiceActors.join(", ");
  const text = JSON.stringify(
    {
      声優: voiceActorsStr,
      作品名: removeBracketedText(workName),
      年: year,
      ジャンル: "HVoiceDrama",
      サークル名: makerName,
      "作品名(オリジナル)": workName,
      フォルダ名: `[${makerName}] ${workName}`,
    },
    null,
    2
  );
  const blob = new Blob([text], {
      type: "text/plain",
    }),
    downloadURL = URL.createObjectURL(blob),
    downloadLink = document.createElement("a");
  downloadLink.href = downloadURL;
  downloadLink.download = `${saveFileName}.txt`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadURL);
}
main();
