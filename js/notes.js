const listStartingStrings = [
  "- ",
  "* ",
  ". ",
  "~ ",
  "° ",
  "-",
  "*",
  ".",
  "~",
  "°",
];

const NOTE_ARROWS = [
  {
    text: "<->",
    arrow: "↔",
  },
  {
    text: "<-",
    arrow: "←",
  },
  {
    text: "->",
    arrow: "→",
  },
  {
    text: "<=>",
    arrow: "⇔",
  },
  {
    text: "<=",
    arrow: "⇐",
  },
  {
    text: "=>",
    arrow: "⇒",
  },
];

async function notepadInit() {
  let { notes, showNotes } = await getStorageValue(["notes", "showNotes"]);

  const noteTemplate = document.getElementById("note_template");
  const wrapper = document.getElementById("notepad");
  const addNoteButton = document.getElementById("add_note");

  const setStorageNotes = debounce(
    () => setStorageValue({ notes }),
    1000,
    1000
  );

  function setNotesVisibility() {
    if (!showNotes) wrapper.style.display = null;
    else wrapper.style.display = "initial";
  }

  function getNewId() {
    let newid = 0;
    while (notes.some(({ id }) => newid === id)) newid++;
    return newid;
  }

  // value to prevent input eventListener to overwrite changes from keydown listener
  // counts for currently focused input
  let preventTextfieldSave = false;
  // id of  focused note
  let focused = -1;

  // creates DOM elements from notes value
  // inits visibility of notes
  // add eventlistener to add note button
  function initNotes() {
    setNotesVisibility();

    notes.forEach(({ note, id }) => {
      addNote(id, note);
    });

    addNoteButton.addEventListener("click", () => {
      const emptyNote = notes.find((note) => !note.note && !note.title);
      if (emptyNote) {
        // if an empty note exists, focus title of empty note instead of creating new one
        wrapper
          .querySelector(`.note[noteid="${emptyNote.id}"]`)
          .querySelector("input")
          .focus();
      } else {
        const id = getNewId();
        notes.push({ id, note: "", title: "" });
        setStorageValue({ notes });
      }
    });

    window.addEventListener("beforeunload", () => setStorageValue({ notes }));
  }

  // updates DOM and textarea values from current notes value
  function updateNotes() {
    const mounted = [...wrapper.querySelectorAll(".note:not(#add_note)")].map(
      (ele) => ({
        id: getId(ele),
        textarea: ele.querySelector("textarea"),
        input: ele.querySelector("input"),
        ele,
      })
    );

    // update existing and add new
    notes.forEach(({ note, title, id }) => {
      const current = mounted.find((ele) => ele.id === id);
      // update current textfield
      if (current) {
        // don't update focused to not mess up cursor position and tabbing out blurs and sets focused to -1
        if (
          (current.textarea.value !== note || current.input.value !== title) &&
          id !== focused
        ) {
          current.textarea.value = note;

          current.input.value = title || "";
        }
        // add new notes
      } else addNote(id, note);
    });

    // removed notes
    mounted
      .filter((ele) => !notes.some((note) => note.id === ele.id))
      .forEach((note) => {
        note.ele.remove();
      });
  }

  // get id of a note DOM element
  function getId(element) {
    return Number(element.getAttribute("noteid"));
  }

  // adds a note DOM element with eventlisteners
  function addNote(id, note = "", title = "", autofocus = false) {
    const element = noteTemplate.content.cloneNode(true).children[0];
    const textarea = element.querySelector("textarea");
    const text_wrapper = element.querySelector(".text_wrapper");
    const input = element.querySelector("input");
    element.setAttribute("noteid", id);
    textarea.addEventListener("focus", () => {
      text_wrapper.classList.add("focused");
      preventTextfieldSave = false;
      focused = getId(element);
    });
    textarea.addEventListener("blur", (e) => {
      text_wrapper.classList.remove("focused");
      preventTextfieldSave = false;
      // switch from note textarea to title input
      if (e.relatedTarget === input) return;
      focused = -1;
      if (textarea.value === "" && input.value === "" && notes.length > 1) {
        deleteNote(getId(element));
      }
    });
    // update storage on change
    textarea.addEventListener("input", () => {
      if (preventTextfieldSave) return (preventTextfieldSave = false);
      const eleId = getId(element);
      notes.find(({ id }) => id == eleId).note = textarea.value;
      copyTextareaContentIntoParagraph(text_wrapper, textarea);
      setStorageNotes();
    });
    // eventListener for enter key to possibly add a dash to the next line
    textarea.addEventListener("keydown", (e) => {
      // when selecting a region and replacing or deleting it not input event gets fired ->
      if (textarea.selectionStart !== textarea.selectionEnd)
        return requestAnimationFrame(() => {
          copyTextareaContentIntoParagraph(text_wrapper, textarea);
          const eleId = getId(element);
          notes.find(({ id }) => id == eleId).note = textarea.value;
          setStorageNotes();
        });
      // tab presses to indent or dedent lines if they are lists
      // enter with list start creates new list entry
      // space is for changing -> to →
      if (!["Tab", "Enter", " "].includes(e.key)) return;

      if (e.key === "Enter") {
        // when ctrl is pressed either move to next note or create new
        if (e.ctrlKey) {
          // get note under current
          const nextNote = notes.reduce((cur, note) => {
            if (note.id <= id) return cur;
            if (note.id > (cur ? cur.id : Infinity)) return cur;
            return note;
          }, null);
          // is not last note
          if (nextNote) {
            wrapper
              .querySelector(`.note[noteid="${nextNote.id}"] input`)
              .focus();
            return;
          } else {
            // only create new note if user is at last note
            // don't make new note if current is empty and would be deleted
            if (textarea.value === "" && input.value === "") return;
            const id = getNewId();
            notes.push({ id, note: "", title: "" });
            addNote(id, "", "", true);
            setStorageValue({ notes });
            return;
          }
        }
        if (e.shiftKey) return;
      } else if (e.key === " ") {
        preventTextfieldSave = true;
        let newValue = textarea.value;
        let selectionStart = textarea.selectionStart;
        let selectionEnd = textarea.selectionEnd;
        const currentText = newValue.slice(selectionStart - 3, selectionStart);
        const arrow = NOTE_ARROWS.find(({ text }) =>
          currentText.endsWith(text)
        );

        if (arrow) {
          e.preventDefault();
          newValue =
            newValue.slice(0, selectionStart - arrow.text.length) +
            arrow.arrow +
            " " +
            newValue.slice(selectionStart);

          const eleId = getId(element);
          notes.find(({ id }) => id == eleId).note = newValue;

          textarea.value = newValue;
          copyTextareaContentIntoParagraph(text_wrapper, textarea);
          setStorageNotes();

          requestAnimationFrame(() => {
            textarea.selectionEnd = selectionEnd;
            textarea.selectionStart = selectionStart;
          });
        }
        return;
      }

      const lines = textarea.value.split("\n");
      let temp = textarea.selectionStart;
      const currentLineIndex = lines.findIndex((line) => {
        if (line.length >= temp) return true;
        temp -= line.length + 1;
        return false;
      });
      const currentLine =
        currentLineIndex === -1 ? "" : lines[currentLineIndex];

      const trimmedCurrentLine = currentLine.trimStart();
      let hasSpace = trimmedCurrentLine.match(/[1-9][0-9]*\.\s/) !== null;
      let numberedList = trimmedCurrentLine.match(/[1-9][0-9]*\./)?.["0"];
      // when a match was found in the middle of the line
      if (!trimmedCurrentLine.startsWith(numberedList)) numberedList = null;
      else if (hasSpace && !trimmedCurrentLine.startsWith(numberedList + " "))
        hasSpace = false;

      const listStartString =
        numberedList ||
        listStartingStrings.find((str) => trimmedCurrentLine.startsWith(str));

      // current line is part of a list
      if (listStartString) {
        let newValue = textarea.value;
        let selectionStart = textarea.selectionStart;
        let selectionEnd = textarea.selectionEnd;

        if (e.key === "Tab") {
          // trying to dedent with not indetation
          if (currentLine.length - trimmedCurrentLine.length < 2 && e.shiftKey)
            return;

          e.preventDefault();
          preventTextfieldSave = true;

          newValue = lines
            .slice(0, currentLineIndex)
            .concat(
              [e.shiftKey ? currentLine.slice(2) : " ".repeat(2) + currentLine],
              lines.slice(currentLineIndex + 1)
            )
            .join("\n");

          selectionStart = textarea.selectionStart + (e.shiftKey ? -2 : 2);
          selectionEnd = textarea.selectionEnd + (e.shiftKey ? -2 : 2);
        } else if (e.key === "Enter") {
          // only set enter true if value gets changed by this listener
          preventTextfieldSave = true;
          e.preventDefault();

          const indentLength = currentLine.length - trimmedCurrentLine.length;

          let newListStartString = listStartString;
          if (numberedList) {
            newListStartString =
              Number(listStartString.slice(0, -1)) +
              1 +
              "." +
              (hasSpace ? " " : "");
          }

          newValue = lines
            .slice(0, currentLineIndex)
            .concat(
              [
                currentLine.slice(0, temp),
                " ".repeat(indentLength) +
                  newListStartString +
                  currentLine.slice(temp),
              ],
              !numberedList
                ? lines.slice(currentLineIndex + 1)
                : incrementNumberedList(lines.slice(currentLineIndex + 1))
            )
            .join("\n");

          selectionStart =
            // current position + indetation + list string + new line
            textarea.selectionStart +
            indentLength +
            newListStartString.length +
            1;
          selectionEnd =
            textarea.selectionEnd +
            indentLength +
            newListStartString.length +
            1;
        }

        const eleId = getId(element);
        notes.find(({ id }) => id == eleId).note = newValue;

        textarea.value = newValue;
        copyTextareaContentIntoParagraph(text_wrapper, textarea);
        setStorageNotes();

        requestAnimationFrame(() => {
          textarea.selectionEnd = selectionEnd;
          textarea.selectionStart = selectionStart;
        });
      }
    });
    // add links class when
    textarea.addEventListener("keydown", (e) => {
      if (e.key !== "Control") return;
      if (!text_wrapper.classList.contains("focused")) return;
      e.preventDefault();
      text_wrapper.classList.add("links");
    });
    textarea.addEventListener("keyup", (e) => {
      if (e.key !== "Control") return;
      e.preventDefault();
      text_wrapper.classList.remove("links");
    });
    // changed focused when focusing / bluring title of note
    input.addEventListener("focus", () => {
      focused = getId(element);
    });
    input.addEventListener("blur", (e) => {
      // switch from title input to note textarea
      if (e.relatedTarget === textarea) return;
      focused = -1;
      if (textarea.value === "" && input.value === "" && notes.length > 1) {
        deleteNote(getId(element));
      }
    });
    // focus textarea on title enter keypress
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      textarea.focus();
    });
    // update title storage value
    input.addEventListener("input", () => {
      const eleId = getId(element);
      notes.find(({ id }) => id == eleId).title = input.value;
      setStorageNotes();
    });

    const existingNote = notes.find((note) => note.id === id);
    textarea.value = note || existingNote ? existingNote.note : "";
    copyTextareaContentIntoParagraph(text_wrapper, textarea);
    // title can be undefined since it was added with version 1.3.4
    input.value = title || existingNote ? existingNote.title || "" : "";

    wrapper.insertBefore(element, addNoteButton);

    if (autofocus)
      requestAnimationFrame(() => {
        input.focus();
      });
  }

  const link_template = document.getElementById("note_link_template");
  function copyTextareaContentIntoParagraph(text_wrapper, textarea) {
    let text = textarea.value;
    const urlMatch =
      /\b((https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]+)/gi;
    const urls = text.match(urlMatch) || [];
    const nodes = [];
    urls.forEach((url) => {
      const index = text.indexOf(url);
      nodes.push(text.slice(0, index));
      text = text.slice(index + url.length);

      const link = link_template.content.cloneNode(true).children[0];
      link.setAttribute("href", url);
      link.innerText = url;
      // open link in current tab instead openening in new tab
      // ctrl is key to click link -> ctrl + middle mouse opens in new tab
      link.addEventListener("click", (e) => {
        if (text_wrapper.classList.contains("links")) {
          e.preventDefault();
          window.location.href = url;
        }
      });
      nodes.push(link);
    });
    nodes.push(text);

    // remove every but the first child (textarea)
    while (text_wrapper.lastChild !== textarea)
      text_wrapper.removeChild(text_wrapper.lastChild);

    nodes.forEach((node) => {
      if (typeof node !== "string") return text_wrapper.append(node);
      const texts = node.split("\n");
      texts.forEach((text, index) => {
        if (index !== 0) text_wrapper.append(document.createElement("br"));
        const span = document.createElement("span");
        span.innerText = text;
        text_wrapper.append(span);
      });
    });
    // add padding to bottom when last line is empty since p doesn't grow otherwise
    if (
      text_wrapper.lastChild.nodeName === "SPAN" &&
      text_wrapper.lastChild.textContent.trim() === "" &&
      text_wrapper.lastChild.previousSibling &&
      text_wrapper.lastChild.previousSibling.nodeName === "BR"
    )
      text_wrapper.style.paddingBottom = "1.25rem";
    else text_wrapper.style.paddingBottom = null;
  }

  // deletes a note from notes and updates storage
  function deleteNote(id) {
    const index = notes.findIndex((note) => note.id === id);
    if (index === -1) return;
    notes.splice(index, 1);
    setStorageValue({ notes });
  }

  function incrementNumberedList(lines) {
    let listEnded = false;
    return lines.map((line) => {
      if (listEnded) return line;
      const start = line.match(/[1-9][0-9]*\./)?.["0"];
      if (!start) {
        listEnded = true;
        return line;
      }
      line =
        " ".repeat(line.length - line.trimStart().length) +
        (Number(start.slice(0, -1)) + 1) +
        "." +
        line.trimStart().slice(start.length);

      return line;
    });
  }

  // global change listener
  changeListener.push((changes) => {
    if (changes.notes !== undefined) {
      notes = changes.notes.newValue;
      updateNotes();
    }
    if (changes.showNotes !== undefined) {
      if (showNotes !== changes.showNotes.newValue) {
        showNotes = changes.showNotes.newValue;
        setNotesVisibility();
      }
    }
  });

  initNotes();
}

notepadInit();
