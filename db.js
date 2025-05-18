// db.js - modul database IndexedDB untuk user login dan register

let db;

export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("UsersDB", 1);

    request.onupgradeneeded = function(event) {
      db = event.target.result;
      if (!db.objectStoreNames.contains("users")) {
        const objectStore = db.createObjectStore("users", { keyPath: "username" });
        objectStore.transaction.oncomplete = function() {
          const userObjectStore = db.transaction("users", "readwrite").objectStore("users");
          userObjectStore.add({ username: "admin", password: "password" });
        };
      }
    };

    request.onsuccess = function(event) {
      db = event.target.result;
      console.log("Database users siap");
      resolve(db);
    };

    request.onerror = function(event) {
      console.error("Database error: " + event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}

export function checkUser(username, password) {
  return new Promise((resolve, reject) => {
    if (!db) return reject("Database belum diinisialisasi");
    const transaction = db.transaction(["users"], "readonly");
    const objectStore = transaction.objectStore("users");
    const request = objectStore.get(username);
    request.onsuccess = function(e) {
      const user = e.target.result;
      if (user && user.password === password) {
        resolve(true);
      } else {
        resolve(false);
      }
    };
    request.onerror = function() {
      reject("Gagal ambil data user");
    };
  });
}

export function tambahUser(username, password) {
  return new Promise((resolve, reject) => {
    if (!db) return reject("Database belum diinisialisasi");
    const transaction = db.transaction(["users"], "readwrite");
    const objectStore = transaction.objectStore("users");
    const getRequest = objectStore.get(username);

    getRequest.onsuccess = function(e) {
      if (e.target.result) {
        reject("Username sudah digunakan");
      } else {
        const addRequest = objectStore.add({ username, password });
        addRequest.onsuccess = () => resolve("User berhasil didaftarkan");
        addRequest.onerror = () => reject("Gagal menambah user");
      }
    };

    getRequest.onerror = function() {
      reject("Gagal mengecek user");
    };
  });
}


