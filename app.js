/*CONSTANTS*/

const saveNoteButton = document.querySelector('#save-btn');
const createNoteButton = document.querySelector('#new-note-btn');
const noteList = document.querySelector('#notes-list');
const content = document.querySelector('#content');
const editor = document.querySelector('#editor');
const CLS = document.querySelector('#delete-btn');
const search = document.querySelector('#search-field');
const favBtn = document.querySelector('#favorite-notes-item');
const clearAllNotes = document.querySelector('#clearAllNotes');
const removedBtn = document.querySelector('.fa-times');


/*VARIABLES*/

let Delta = Quill.import('delta');
let notesArr = [];
let activeNoteID;


/*QUILL*/

let quill = new Quill('#editor', {
  modules: {
      toolbar: [
          [{
              header: [1, 2, 3, false]
          }],
          ['bold', 'italic', 'underline'],
          ['link'],
          [{
              'list': 'ordered'
          }, {
              'list': 'bullet'
          }],
          ['clean']
      ]
  },
  placeholder: 'Write your note here...',
  theme: 'bubble'
});

/*EVENT LISTENER*/

document.addEventListener('DOMContentLoaded', initialize);




/*FUNCTIONS*/

//INITIALIZE
function initialize() {
  document.querySelector('#favorite-notes-item').addEventListener('click', function(evt) {
    renderNotesList(searchNotes('', favNotes));
  });



  search.addEventListener('input', function(evt) {
    evt.preventDefault();
    let searchStr = evt.target.value;
    if (searchStr.length >= 1) {
      let foundNotes = searchNotes(searchStr);
      renderNotesList(foundNotes);
    } else {
      renderNotesList(notesArr)
    }
  })
  CLS.addEventListener('click', function() {
      clearEditor()
  });

  // clearAllNotes.addEventListener('click', function() {
  //     clearLS()
  // });

  document.querySelector('#save-btn').addEventListener('click', function() {
    createNote();
    renderNotesList(notesArr);
  })
  noteList.addEventListener('click', function(evt) {
    let clickedLI = evt.target.closest('li');
    let clickedID = clickedLI.getAttribute('data-id');
    // som det är nu, resulterar alla klick på en note
    // i en "load", dvs editorn sätts till det innehåller
    // TODO: kolla om anv klickade på stjärnan
    // hitta rätt note mha id let clickedNote = notesArr.find...
    // clickedNote.favourite = !clickedNote.favourite
    // savenotes
    // if (evt.classList.contains('fa-star'))
    setEditor(readNote(clickedID));
  })

  // removedBtn.addEventListener('click', function(evt) {
  //   let clickedBtn = evt.target.closest('.fa-times');
  //   console.log(clickedBtn)

  // })

  let change = new Delta();
  quill.on('text-change', function(delta) {
    change = change.compose(delta);
  });

  
    //   // Save periodically
    //   setInterval(function () {
    //     if (change.length() > 0) {
    //         console.log('Saving changes', change);
    //         // Save the entire updated text to localStorage
    //         //const data = JSON.stringify(quill.getContents())
    //         //localStorage.setItem('storedText', data);
    //         // finns det en aktiv note? om inte, gör ingenting
    //         if (activeNoteID) {
    //             updateNote(activeNoteID)
    //         }
    //         change = new Delta();
    //     }
    // }, 2 * 1000);

getNotes();
renderNotesList(notesArr);

}

//CREATE NOTE
function createNote() {
  let noteObj = {
      id: Date.now(),
      title: findTitle(),
      content: quill.getContents(),
      text: findText(),
      favourite: false,
      removed: false,
  }
  notesArr.push(noteObj);
  saveNotes();
  setActiveNoteID(noteObj.id);
  renderNotesList(notesArr);
}

//TITLE
function findTitle() {
  let editorContents = document.querySelector('.ql-editor');
  let endOfFirstLine = editorContents.innerText.indexOf('\n');
  let firstLine = quill.getText(0, endOfFirstLine);
  return firstLine
}

// TEXT in note-list
function findText() {
  let allText = document.querySelector('.ql-editor');
  let allTextIndex = allText.length;
  let endOfTitle = allText.innerText.indexOf('\n');
  let restOfText = quill.getText(endOfTitle, allTextIndex)
  return restOfText;
}


// function savedDate() {
//   var time = new Date().getTime();
//   var date = new Date(time);
//   return date.toLocaleString();
// }

//DATE
function newSavedDate(id) {
  var date = new Date(id);
  return date.toLocaleString();
}

//READ NOTE
function readNote(id) {
  return notesArr.find(note => note.id == id);
}

function setEditor(note) {
  quill.setContents(note.content);
  setActiveNoteID(note.id);
}

function updateNote(id) {
  let noteObj = notesArr.find(note => note.id == id);
  noteObj.content = quill.getContents();
  noteObj.text = quill.getText();
  saveNotes();
  renderNotesList(notesArr);
}

function getNotes() {
  let notesArrStr = localStorage.getItem('notesArr');
  if (!notesArrStr) {
      return;
  }
  notesArr = JSON.parse(notesArrStr);
}

function saveNotes() {
  localStorage.setItem('notesArr', JSON.stringify(notesArr))
}


// function oldNoteObjToHTML(noteObj) {
//   let LI = document.createElement('li');
//   LI.setAttribute('data-id', noteObj.id);
//   LI.innerHTML = `<span>${noteObj.favourite ? '★' : '☆'
//       }</span> <h3>${noteObj.noteDate}</h3> <p>${noteObj.text}</p>`
//   return LI
// }

function noteObjToHTML(noteObj) {
  let LI = document.createElement('li');
  LI.setAttribute('data-id', noteObj.id);
  LI.innerHTML = `<i class="far fa-star unfilled"></i><i class="fas fa-trash removed"></i> <h2>${noteObj.title}</h2> <h3>${newSavedDate(noteObj.id)}</h3> <p>${noteObj.text}</p>`
  return LI
}

function renderNotesList(arr) {
  noteList.innerHTML = '';
  arr.forEach(function (note) {
      noteList.appendChild(noteObjToHTML(note));
  })
}

//SEARCH NOTES
function searchNotes(str, func = function (note) {
  return note.text.toLowerCase().includes(str.toLowerCase())
}) {
  return notesArr.filter(func)
}

//FAVORITE NOTES
function favNotes(note) {
  return note.favourite;
}

function toggleFav(id) {
  let noteObj = notesArr.find(note => note.id == id);
  noteObj.favourite = !noteObj.favourite;
  saveNotes();
}

function removedNotes() {

}


//CLEAR LS
function clearLS() {
  localStorage.clear();
}

//CLEAR EDITOR
function clearEditor() {
  quill.setText('');
}

function setActiveNoteID(id) {
  activeNoteID = id;
}