// import { openDB } from "./idb.js";
let finalUsername = "";
const storiesDiv = document.getElementById("stories");
// const db = openDB("CoronaSocial", 1, {
//     upgrade(db) {
//         // Create a store of objects
//         const store = db.createObjectStore('stories', {
//             // The 'id' property of the object will be the key.
//             keyPath: '_id',
//             // If it isn't explicitly set, create a value by auto incrementing.
//             autoIncrement: false,
//         });
//         // Create an index on the 'date' property of the objects.
//         store.createIndex('createdAt', 'createdAt');
//     },
// });

async function login() {
    const storedUsername = window.localStorage.getItem("username");

    if (storedUsername) {
        document.getElementById("greeting").innerText = `Hello ${storedUsername}`;
    }

    let username;

    try {
        const res = await fetch("/api/auth/me", { headers: { "Content-type": "application/json" } });
        const json = await res.json();
        username = json.username;
        finalUsername = username;
    } catch (e) {

    }

    if (!username) {
        window.localStorage.removeItem("username");
        window.location = "/login";
    } else {
        window.localStorage.setItem("username", username);
        document.getElementById("greeting").innerText = `Hello ${username}`;
    }

}

let recommendedFilter = false;

async function refreshStories() {
    const sDiv = document.querySelector(".stories");

    const apiUrl = recommendedFilter ? "/api/stories/recommended" : "/api/stories";

    const latestJson = await fetch(apiUrl);
    const latest = await latestJson.json();

    sDiv.textContent = "";

    for (const story of latest.data) {
        const outer = document.createElement("div");
        outer.classList = "story container border";
        const by = document.createElement("small");
        by.innerHTML = `By ${story.author.username}`;
        const text = document.createElement("p");
        text.innerHTML = story.text;


        outer.appendChild(text);
        outer.appendChild(by);


        sDiv.appendChild(outer);
    }
}

window.onload = async () => {

    refreshStories();

    document.getElementById("toggle-sort").addEventListener("click", async () => {
        recommendedFilter = !recommendedFilter;
        document.getElementById("toggle-sort").disabled = true;
        await refreshStories();
        document.getElementById("toggle-sort").disabled = false;
        document.getElementById("sort-text").innerHTML = `Sorting by ${recommendedFilter ? "recommended" : "latest"}`;
    });

    document.querySelector("a#logout").addEventListener("click", async e => {
        e.preventDefault();
        window.localStorage.removeItem("username");
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) { }
        window.location = "/login";
    })

    // $(document).ready(function () {
    //     var socket = io();
    //     $('#like').submit(function (e) {
    //         e.preventDefault(); // prevents page reloading
    //         console.log("AS");
    //         socket.emit('like-post', {
    //             name: finalUsername,
    //             numberOfLikes: $('#likeNumber').val()
    //         });
    //         $('#text').val('');
    //         return false;
    //     });
    // });

    login();

    // if ('serviceWorker' in navigator) {
    //    navigator.serviceWorker.register('./service-worker.js');
    //}

    // const cached = await (await db).getAllFromIndex("stories", "createdAt");
    // drawStories(cached);


    // // const cachedIds = new Set();
    // // cached.forEach(story => cachedIds.add(story._id));

    // console.log(document.getElementById("stories"))


    // const stories = await getStories();

    // const newStories = stories.filter(story => !cachedIds.has(story._id));

    // if (newStories.length) {

    // console.log(document.getElementById("stories"))

    // for (const story of storiesDiv.children) {
    //     story.remove();
    // }

    // drawStories(stories);
    // try {
    //     await cacheStories(stories);
    // } catch (e) {
    //     console.error(e)
    // }

}

async function getStories() {
    const res = await fetch("/stories");
    const json = await res.json();
    return json;
}

async function cacheStories(stories) {
    const tx = (await db).transaction("stories", "readwrite");
    for (const story of stories) {
        tx.store.add(story);
    }
    await tx.done;
}

function drawStories(stories) {
    for (const story of stories) {
        const s = storyTemplate.content.cloneNode(true);
        s.getElementById("author").textContent = `by ${story.author.username}`;
        s.getElementById("text").textContent = story.text;
        s.getElementById("created").textContent = story.createdAt;
        storiesDiv.appendChild(s);
    }
}