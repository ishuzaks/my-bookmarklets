function removeBracketedText(text: string): string {
  return text.replace(/【.*?】/g, "");
}

function main(): void {
  if (location.hostname !== "www.dlsite.com") {
    alert("DLsiteのページで実行してください。");
    return;
  }

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
  const published_date_href = document
    .querySelector('a[href*="year"]')
    ?.getAttribute("href");
  const yearMatchedObj = published_date_href?.match(/\/year\/(\d+)\//);
  const monthMatchedObj = published_date_href?.match(/\/mon\/(\d+)\//);
  const dayMatchedObj = published_date_href?.match(/\/day\/(\d+)\//);
  const year =
    yearMatchedObj && yearMatchedObj.length >= 2 ? yearMatchedObj[1] : "";
  const month =
    monthMatchedObj && monthMatchedObj.length >= 2 ? monthMatchedObj[1] : "";
  const day =
    dayMatchedObj && dayMatchedObj.length >= 2 ? dayMatchedObj[1] : "";
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
    2
  );
  const blob = new Blob([text], { type: "text/plain" });
  const downloadURL = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadURL;
  downloadLink.download = `${saveFileName}.txt`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadURL);
}
main();
