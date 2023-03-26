// bookmark website to new tab
chrome.contextMenus.create({
  title: "Bookmark website to new tab",
  id: "bookmark",
  contexts: ["page"],
});

// save selected text as note in new tab
chrome.contextMenus.create({
  title: "Save as note in new tab",
  id: "save-as-note",
  contexts: ["selection"],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "bookmark":
      if (tab) {
        chrome.storage.sync.get("websites", (data) => {
          let websites = data.websites;
          websites.push({ url: info.pageUrl, icon: tab.favIconUrl });
          chrome.storage.sync.set({
            websites,
          });
        });
      }
      break;
    case "save-as-note":
      const text = info.selectionText;

      if (!text) break;

      chrome.storage.sync.get("notes", (data) => {
        const notes = data.notes ?? [];
        chrome.storage.sync.set({
          notes: [
            ...notes,
            {
              note: text,
              title: "",
              id: Math.max(...notes.map((note) => note.id), 0) + 1,
            },
          ],
        });
      });
      break;
  }
});
