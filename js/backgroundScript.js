chrome.contextMenus.create({
  title: "Bookmark website to new tab",
  id: "bookmark",
  contexts: ["page"],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "bookmark" && tab)
    chrome.storage.sync.get("websites", (data) => {
      let websites = data.websites;
      websites.push({ url: info.pageUrl, icon: tab.favIconUrl });
      chrome.storage.sync.set({
        websites,
      });
    });
});
