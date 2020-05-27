
window.onload = async () => {
    const storedUsername = window.localStorage.getItem("username");

    login();

    document.querySelector("a#logout").addEventListener("click", async e => {
        e.preventDefault();
        window.localStorage.removeItem("username");
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) { }
        window.location = "/login";
    })

    /**
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js');
    }
    */

    //check for support
    if ('indexedDB' in window) {
        initDatabase();
    } else {
        console.log('This browser doesn\'t support IndexedDB');
    }

    // $(document).ready(function () {
    //     var socket = io();
    //     $('#createstory').submit(function (e) {
    //         e.preventDefault(); // prevents page reloading
    //         socket.emit('create-story', {
    //             name: storedUsername,
    //             text: $('#text').val()
    //         });
    //         $('#text').val('');
    //         return false;
    //     });
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

    document.getElementById("create-story").addEventListener("submit", async e => {
        e.preventDefault();

        const text = e.target.querySelector("#text").value;

        const formData = new FormData();
        const photos = document.querySelector('input[type="file"][multiple]');

        formData.append("text", text);
        for (const file of photos.files) {
            formData.append("photos", file);
        }

        await fetch("/api/stories", { method: "POST", body: formData });

        refreshStories();
    });

    refreshStories();

}

function renderStories(stories) {
    var sDiv = document.querySelector(".stories");

    sDiv.textContent = "";

    for (const story of stories) {
        const outer = document.createElement("div");
        outer.classList = "story container border";
        const by = document.createElement("small");
        by.innerHTML = `By <b>${story.author.username}</b> at ${new Date(story.createdAt)}`;
        const text = document.createElement("p");
        text.innerHTML = story.text;

        const photos = document.createElement("div");

        for (const photo of story.images) {
            const img = document.createElement("img");
            img.src = photo;
            img.width = 250;
            photos.appendChild(img);
        }   

        outer.appendChild(text);
        outer.appendChild(by);
        outer.appendChild(photos);

        sDiv.appendChild(outer);
    }
}

async function refreshStories() {
    fetchStories().catch(error => {
        const storedUsername = window.localStorage.getItem("username");
        getPersonalStories(storedUsername);
    });
}

async function fetchStories() {

    const storedUsername = window.localStorage.getItem("username");

    if (!storedUsername) {
        return;
    }

    const latestJson = await fetch(`/api/stories/${storedUsername}`);
    const latest = await latestJson.json();

    renderStories(latest.data);

    storeStoriesCachedData(latest.data);
}