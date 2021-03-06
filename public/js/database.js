let dbPromise;

// DB NAME
const DB_NAME = "db_story";

// DB STORE NAMES
const STORIES_STORE_NAME = "store_stories";

// Initialise the Database
function initDatabase() {
    dbPromise = idb.openDb(DB_NAME, 7, function (upgradeDb) {
        if (!upgradeDb.objectStoreNames.contains(STORIES_STORE_NAME)) {
            let storeDB = upgradeDb.createObjectStore(STORIES_STORE_NAME, {keyPath: '_id', autoIncrement: false});
            storeDB.createIndex('createdAt', 'createdAt', {unique: false});
            storeDB.createIndex('author', 'author.username', {unique: false});
        }
    });
}

/**
 * Returns a date object with the date exactly 28 days ago
 * @return {Date} date exactly 28 days ago
 */
function calcDeleteDate() {
    let deleteDate = new Date();
    return deleteDate.setDate(deleteDate.getDate() - 28);
}

/**
 * Removes Stories stored in Cache that are older than 28 days
 * Requires the database to be initialised first
 */
async function flushOldStories() {

    const deleteDate = calcDeleteDate();

    if (dbPromise) {
        dbPromise.then(function (db) {
            let tx = db.transaction(STORIES_STORE_NAME, 'readwrite');
            let store = tx.objectStore(STORIES_STORE_NAME);
            let index = store.index('createdAt');
            return index.openCursor();
        }).then(function filterStories(cursor) {
            if (!cursor) {
                return;
            }

            // convert story date to Date object
            cursorDate = new Date(cursor.key);

            // if story publishing date is older than 28 days ago
            // delete from indexdb
            if (deleteDate > cursorDate) {
                cursor.delete();
            }

            cursor.continue().then(filterStories);
        }).catch(error => {
            console.log("Error Occured in Flushing local cache")
        });
    }
}

/**
 * Saves a collection of Story Objects into IndexDB
 * Flushes cache of timedout (stories older than 28 days) story objects after completion
 * @param {[Object]} storyObjects list of story objects you wish to store
 */
async function storeStoriesCachedData(storyObjects) {
    for (let i = 0; i < storyObjects.length; i++) {
        let storyObject = storyObjects[i];
        storeStoryCachedData(storyObject);
    }
    flushOldStories()
}
/**
 * Saves an individual Story to IndexDB
 * @param {Object} storyObject Individual story object to be saved to IndexDB
 */
async function storeStoryCachedData(storyObject) {
    if (dbPromise) {
        dbPromise.then(async db => {
            let tx = db.transaction(STORIES_STORE_NAME, 'readwrite');
            let store = tx.objectStore(STORIES_STORE_NAME);
            await store.put(storyObject);
            return tx.complete;
        }).then(function () {
            console.log('Added story to the store');
        }).catch(function (error) {
            console.log(error);
            console.log("Store Story Failed");
        });
    }
}

/**
 * Loads a list of Story Objects from the IndexDB database and filters the stories
 * removing all stories with an author that has a matching username after will render them using the renderStoriesWithoutPhotos function
 * Does not return anything
 * @param {String} username username to remove stories with a matching author
 * @see [Story]
 */
async function getOtherUserStories(username) {
    if (dbPromise) {
        dbPromise.then(function (db) {
            let tx = db.transaction(STORIES_STORE_NAME, 'readonly');
            let store = tx.objectStore(STORIES_STORE_NAME);
            return store.getAll(); 
        }).then(function filterUserStories(stories) {
            stories = stories.reverse() // Order stories in reverse chronological order

            let other_user_stories = stories.filter(function(story) {
                return story.author.username != username;
            });

            renderStoriesWithoutPhotos(other_user_stories);
        });
    }
}

/**
 * Loads a list of Story Objects from the IndexDB database and filters the stories
 * removing all stories with an author that does not have a matching username after will render them using the renderStoriesWithoutPhotos function
 * Does not return anything 
 * @param {String} username
 * @see [Story]
 */
async function getPersonalStories(username) {
    if (dbPromise) {
        dbPromise.then(async db => {
            let tx = db.transaction(STORIES_STORE_NAME, 'readonly');
            let store = tx.objectStore(STORIES_STORE_NAME);
            let index = store.index('author');
            return await index.getAll(IDBKeyRange.only(username)); // only return stories with matching username on author index
        }).then(function (returnedStories) {
            if (returnedStories) {
                returnedStories = returnedStories.reverse(); // order into reverse chronological order
                renderStoriesWithoutPhotos(returnedStories);
            }
        });
    }
}

/**
 * Renders each of the story Object in the list to a standard application design in a section with a class of stories
 * Seperate Method as Images are too large to be stored locally and therefore cannot be rendered as usual
 * @param {[Object]} stories list of Stories to render
 * @see [Story] Renders the stories provided
 */
async function renderStoriesWithoutPhotos(stories) {
    const storiesDiv = document.querySelector(".stories");

    storiesDiv.textContent = "";

    for (const story of stories) {
        const outer = document.createElement("div");
        outer.classList = "story container border";
        const by = document.createElement("small");
        by.innerHTML = `By <b>${story.author.username}</b> at ${new Date(story.createdAt)}`;
        const text = document.createElement("p");
        text.innerHTML = story.text;

        const likesForm = renderLikes(story);

        outer.appendChild(by);
        outer.appendChild(text);
        outer.appendChild(likesForm);

        storiesDiv.appendChild(outer);
    }
}