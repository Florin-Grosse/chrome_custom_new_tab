mkdir build
7z a chrome.zip js popup resources stylesheets index.html manifest.json
mv chrome.zip build/chrome.zip
7z a firefox.zip js popup resources stylesheets index.html manifest_firefox.json
7z rn firefox.zip manifest_firefox.json manifest.json
mv firefox.zip build/firefox.zip