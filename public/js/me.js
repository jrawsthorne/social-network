
window.onload = async () => {
    const storedUsername = window.localStorage.getItem("username");

    document.querySelector("a#logout").addEventListener("click", async e => {
        e.preventDefault();
        window.localStorage.removeItem("username");
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) { }
        window.location = "/login";
    })

    login();
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

    });

    fetchStories();

}

async function fetchStories() {

    const storedUsername = window.localStorage.getItem("username");

    if (!storedUsername) {
        return;
    }

    const sDiv = document.getElementById("stories");

    const latestJson = await fetch(`/api/stories/${storedUsername}`);
    const latest = await latestJson.json();

    sDiv.textContent = "";

    for (const story of latest.data) {
        const outer = document.createElement("div");
        outer.classList = "container border";
        const by = document.createElement("small");
        by.innerHTML = `<b>${story.author.username}</b> ${new Date(story.createdAt)}`;
        const text = document.createElement("p");
        text.innerHTML = story.text;

        const photos = document.createElement("div");

        for (const photo of story.images) {
            const img = document.createElement("img");
            img.src = photo;
            img.width = 250;
            photos.appendChild(img);
        }

        outer.appendChild(by);
        outer.appendChild(text);
        outer.appendChild(photos);


        sDiv.appendChild(outer);
    }
}