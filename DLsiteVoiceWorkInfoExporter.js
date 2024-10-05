function main() {
  const workNameElement = document.getElementById("work_name");
  if (workNameElement) {
    const workName = workNameElement.textContent.trim();
    const makerNameElement = document.querySelector("span.maker_name");
    if (makerNameElement) {
      const makerName = makerNameElement.textContent.trim();
      const saveFileName = ("[" + makerName + "] " + workName).replace(
        /[:*?"<>|/\\]/g,
        function (e) {
          return {
            ":": "：",
            "*": "＊",
            "?": "？",
            '"': "”",
            "<": "＜",
            ">": "＞",
            "|": "｜",
            "/": "／",
            "\\": "￥",
          }[e];
        }
      );
      const yearMatchedOnj = document
        .querySelector('a[href*="year"]')
        .getAttribute("href")
        .match(/\/year\/(\d+)\//);
      const year = yearMatchedOnj ? yearMatchedOnj[1] : "";
      const voiceActorXPathResult = document.evaluate(
        "//th[contains(text(), '声優')]/following-sibling::td/a",
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      const voiceActors = [];
      for (let i = 0; i < voiceActorXPathResult.snapshotLength; i++)
        voiceActors.push(
          voiceActorXPathResult.snapshotItem(i).textContent.trim()
        );
      const voiceActorsStr = voiceActors.join(", ");
      const blob = new Blob(
          [
            voiceActorsStr +
              " " +
              workName +
              " " +
              year +
              " HVoiceDrama " +
              makerName,
          ],
          {
            type: "text/plain",
          }
        ),
        downloadURL = URL.createObjectURL(blob),
        downloadLink = document.createElement("a");
      downloadLink.href = downloadURL;
      downloadLink.download = `${saveFileName}.txt`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadURL);
    } else {
      alert("class='maker_name'を持つspan要素が見つかりませんでした。");
    }
  } else {
    alert("id='work_name'を持つ要素が見つかりませんでした。");
  }
}
main();
