const listStartString = "- ";

async function notepadInit() {
  let { notepad } = await getStorageValue(["notepad"]);

  if (notepad === undefined) {
    setStorageValue({ notepad: "" });
    notepad = "";
  }

  const notepadEle = document.querySelector("#notepad textarea");
  function updateNotepad() {
    if (notepad === null) notepadEle.style.display = "none";
    else {
      notepadEle.style.display = null;
      notepadEle.value = notepad;
    }
  }

  function initNotepad() {
    updateNotepad();

    //
    notepadEle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftkey) {
        const lines = notepadEle.value.split("\n");
        let temp = notepadEle.selectionStart;
        const currentLineIndex = lines.findIndex((line) => {
          if (line.length >= temp) return true;
          temp -= line.length + 1;
          return false;
        });
        const currentLine =
          currentLineIndex === -1 ? "" : lines[currentLineIndex];

        if (currentLine.startsWith(listStartString)) {
          const newValue = lines
            .slice(0, currentLineIndex)
            .concat(
              [
                currentLine.slice(0, temp),
                listStartString + currentLine.slice(temp),
              ],
              lines.slice(currentLineIndex + 1)
            )
            .join("\n");

          setStorageValue({ notepad: newValue });
          const selectionStart = notepadEle.selectionStart;
          const selectionEnd = notepadEle.selectionEnd;
          setTimeout(() => {
            notepadEle.selectionEnd = selectionEnd + listStartString.length + 1;
            notepadEle.selectionStart =
              selectionStart + listStartString.length + 1;
          });
        }
      } else {
        notepad = notepadEle.value;
        setStorageValue({ notepad });
      }
    });

    notepadEle.value = notepad;
  }

  // global change listener
  changeListener.push((changes) => {
    if (changes.notepad !== undefined) {
      if (notepad !== changes.notepad.newValue) {
        notepad = changes.notepad.newValue;
        updateNotepad();
      }
    }
  });

  initNotepad();
}

notepadInit();
