const listStartString = "- ";

async function notepadInit() {
  let { notes, showNotes } = await getStorageValue(["notes", "showNotes"]);

  if (notes === undefined) {
    setStorageValue({
      notes: [
        {
          note: "",
          id: 1,
        },
      ],
      showNotes: true,
    });
    notes = [
      {
        note: "",
        id: 1,
      },
    ];
    showNotes = true;
  }

  const noteTemplate = document.getElementById("note_template");
  const wrapper = document.getElementById("notepad");
  const addNoteButton = document.getElementById("add_note");

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
  let enter = false;
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
      const id = getNewId();
      notes.push({ id, note: "" });
      setStorageValue({ notes });
    });
  }

  // updates DOM and textarea values from current notes value
  function updateNotes() {
    const mounted = [...wrapper.querySelectorAll(".note:not(#add_note)")].map(
      (ele) => ({
        id: getId(ele),
        textarea: ele.querySelector("textarea"),
        ele,
      })
    );

    // update existing and add new
    notes.forEach(({ note, id }) => {
      const current = mounted.find((ele) => ele.id === id);
      // update current textfield
      if (current) {
        // don't update focused to not mess up cursor position and tabbing out blurs and sets focused to -1
        if (current.textarea.value !== note && id !== focused) {
          textarea.value = note;
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

  // resize textarea to correct height to not scroll
  function resizeTextarea(textarea) {
    // update height of textarea
    textarea.style.height = "0";
    textarea.style.height = textarea.scrollHeight + "px";
    // when deleting everything at once
    requestAnimationFrame(() => {
      textarea.style.height = "0";
      textarea.style.height = textarea.scrollHeight + "px";
    });
  }

  // get id of a note DOM element
  function getId(element) {
    return Number(element.getAttribute("noteid"));
  }

  // adds a note DOM element with eventlisteners
  function addNote(id, note = "", autofocus = false) {
    const element = noteTemplate.content.cloneNode(true).children[0];
    const textarea = element.querySelector("textarea");
    element.setAttribute("noteid", id);
    textarea.addEventListener("focus", () => {
      enter = false;
      focused = getId(element);
    });
    textarea.addEventListener("blur", () => {
      enter = false;
      focused = -1;
      if (textarea.value === "" && notes.length > 1) {
        deleteNote(getId(element));
      }
    });
    // update storage on change
    textarea.addEventListener("input", () => {
      if (enter) return (enter = false);
      const eleId = getId(element);
      notes.find(({ id }) => id == eleId).note = textarea.value;
      resizeTextarea(textarea);
      setStorageValue({ notes });
    });
    // eventListener for enter key to possibly add a dash to the next line
    textarea.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      if (e.ctrlKey) {
        const id = getNewId();
        notes.push({ id, note: "" });
        addNote(id, "", true);
        setStorageValue({ notes });
        return;
      }
      if (e.shiftKey) return;
      const lines = textarea.value.split("\n");
      let temp = textarea.selectionStart;
      const currentLineIndex = lines.findIndex((line) => {
        if (line.length >= temp) return true;
        temp -= line.length + 1;
        return false;
      });
      const currentLine =
        currentLineIndex === -1 ? "" : lines[currentLineIndex];

      if (currentLine.startsWith(listStartString)) {
        // only set enter true if value gets changed by this listener
        enter = true;
        e.preventDefault();

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

        const eleId = getId(element);
        notes.find(({ id }) => id == eleId).note = newValue;

        setStorageValue({ notes });
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;

        textarea.value = newValue;

        resizeTextarea(textarea);

        requestAnimationFrame(() => {
          textarea.selectionEnd = selectionEnd + listStartString.length + 1;
          textarea.selectionStart = selectionStart + listStartString.length + 1;
        });
      }
    });

    const existingNote = notes.find((note) => note.id === id);
    textarea.value = note || existingNote ? existingNote.note : "";
    textarea.style.height = "0";
    requestAnimationFrame(() => {
      textarea.style.height = textarea.scrollHeight + "px";
    });

    wrapper.insertBefore(element, addNoteButton);

    if (autofocus)
      requestAnimationFrame(() => {
        textarea.focus();
      });
  }

  // deletes a node from notes and updates storage
  function deleteNote(id) {
    const index = notes.findIndex((note) => note.id === id);
    if (index === -1) return;
    notes.splice(index, 1);
    setStorageValue({ notes });
  }

  // global change listener
  changeListener.push((changes) => {
    if (changes.notes !== undefined) {
      if (
        notes.some(
          ({ note, id }) =>
            changes.notes.newValue.find((note1) => note1.id === id).note !==
            note
        ) ||
        notes.length === changes.notes.newValue.length
      ) {
        notes = changes.notes.newValue;
        updateNotes();
      }
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
