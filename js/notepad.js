const listStartString = "- ";

async function notepadInit() {
  let { notepad, showNotepad } = await getStorageValue([
    "notepad",
    "showNotepad",
  ]);

  if (notepad === undefined) {
    setStorageValue({ notepad: "", showNotepad: true });
    notepad = "";
  }

  const notepadEle = document.querySelector("#notepad textarea");
  function updateNotepad() {
    if (!showNotepad) notepadEle.style.display = "none";
    else {
      notepadEle.style.display = null;
      notepadEle.value = notepad;
    }
  }

  function initNotepad() {
    updateNotepad();

    // value to prevent input eventListener to overwrite changes from keydown listener
    enter = false;

    notepadEle.addEventListener("input", () => {
      if (enter) return (enter = false);
      notepad = notepadEle.value;
      setStorageValue({ notepad });
    });

    // eventListener for enter key to possibly add a dash to the next line
    notepadEle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftkey) {
        enter = true;
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
      }
    });

    notepadEle.value = notepad;
  }

  // global change listener
  changeListener.push((changes) => {
    let update = false;
    if (changes.notepad !== undefined) {
      if (notepad !== changes.notepad.newValue) {
        notepad = changes.notepad.newValue;
        update = true;
      }
    }
    if (changes.showNotepad !== undefined) {
      if (showNotepad !== changes.showNotepad.newValue) {
        showNotepad = changes.showNotepad.newValue;
        update = true;
      }
    }
    if (update) updateNotepad();
  });

  initNotepad();
}

notepadInit();
