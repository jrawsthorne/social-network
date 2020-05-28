let finalUsername = "";
const storiesDiv = document.getElementById("stories");

let recommendedFilter = false;

async function fetchStories() {

    const apiUrl = recommendedFilter ? "/api/stories/recommended" : "/api/stories";

    const latestJson = await fetch(apiUrl);
    const latest = await latestJson.json();

    renderStories(latest.data);

    storeStoriesCachedData(latest.data)
}

async function refreshStories() {
    fetchStories().catch(error => {
        const username = window.localStorage.getItem('username');
        getOtherUserStories(username);
    });
}

window.onload = async () => {

    verifyLogin();

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

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js');
    }

    //check for support
    if ('indexedDB' in window) {
        initDatabase();
    } else {
        console.log('This browser doesn\'t support IndexedDB');
    }

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

    refreshStories();

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