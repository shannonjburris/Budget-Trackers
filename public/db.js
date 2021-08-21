const indexedDB =
  window.indexedDB 
  window.mozIndexedDB 
  window.webkitIndexedDB 
  window.msIndexedDB 
  window.shimIndexedDB;

let db;
const request = indexedDB.open("budget-tracker", 1);

request.onupgradeneeded = ({ target }) => {
  let db = target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
  db = target.result;

//  if the app is online then check db
  if (navigator.onLine) {
    checkDatabase();
  }
};
// if error throw code
request.onerror = function(event) {
  console.log(event.target.errorCode);
};

// adds object to store
function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");

  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  // if object is hanging around send them to db
  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, /",
          "Content-Type": "application/json"
        }
      })
      .then(response => {
        return response.json();
      })
      .then(() => {
     
        const transaction = db.transaction(["pending"], "readwrite");
        const store = transaction.objectStore("pending");
        store.clear();
      });
    }
  };
}


window.addEventListener("online", checkDatabase);

