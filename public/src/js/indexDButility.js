// Access indexDB
//open indexDb and create db posts-store, version and callback
const dbPromise = idb.open("posts-store", 1, (db) => {
  if (!db.objectStoreNames.contains("posts")) {
    // create store with the name posts and primary key id
    db.createObjectStore("posts", { keyPath: "id" });
  }
});

const writeDataInIndexDB = (indexDBStore, data) => {
  return dbPromise.then((db) => {
    //create transaction
    const transaction = db.transaction(indexDBStore, "readwrite");
    //open store
    const store = transaction.objectStore(indexDBStore);
    //save in store
    store.put(data);
    //close transaction
    return transaction.complete;
  });
};

const readDataFromIndexDB = (storeName) => {
  return dbPromise.then((db) => {
    //create transaction
    const transaction = db.transaction(storeName, "readonly");
    const store=transaction.objectStore(storeName)
    return store.getAll()
  });
};
