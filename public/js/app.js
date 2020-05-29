/**
 * When the client gets off-line, it shows an off line warning to the user
 * so that it is clear that the data is not updating
 */
window.addEventListener('offline', function (e) {
    // Queue up events for server.
    console.log("You are offline");
    showOfflineWarning();
}, false);

/**
 * When the client gets online, it hides the off line warning
 */
window.addEventListener('online', function (e) {
    console.log("You are online");

    // If client is at the Login / Register page no need to verify login
    path = window.location.pathname;
    if (path !== "/login" && path !== "/register") {

        verifyLogin();

        if (path === "/") {
            refreshOtherUserStories();
        } else if (path === "/me") {
            refreshPersonalStories();
        }
    }

    hideOfflineWarning();
}, false);

/**
 * Updates a banner above the navigation bar indicating the client is offline
 * @see Row Row indicating the client is offline
 */
function showOfflineWarning() {
    if (document.getElementById('offline') != null) {
        document.getElementById('offline').style.display = 'block';
    }
}

/**
 * Remove offline banner above the navigation bar
 * @see Row Row indicating the client is offline is removed
 */
function hideOfflineWarning() {
    if (document.getElementById('offline') != null) {
        document.getElementById('offline').style.display = 'none';
    }
}

/**
*  Renders stories with: text, images, author, likes & date
*  @param {[Story]} stories A collection of Story Objects
*  @see [Story] A collection of rendered boxes with story information
*/
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
        photos.classList = "row image-padding"

        for (const photo of story.images) {
            const column = document.createElement("div");
            column.classList = "col-xs-12 col-sm-4 col-md-4 mobile-sm-padding";
            const img = document.createElement("img");
            img.src = photo;
            column.appendChild(img);
            photos.appendChild(column);
        }

        const likesForm = renderLikes(story);

        outer.appendChild(by);
        outer.appendChild(text);

        if (story.images.length) {
            outer.appendChild(photos);
        }

        outer.appendChild(likesForm);
        
        sDiv.appendChild(outer);
    }
}

/**
 * This function deals with creation of like elements for each story
 * If the client is not online this function will return a form that will be unable to submit and
 * the like counter disabled
 * @param {Story} story A story Object to generate Likes for
 * @return A form html element containing the relevant information for the story
 */
function renderLikes(story) {
    const form = document.createElement("form");
    form.className = "form-inline";

    const likesCount = document.createElement("span");
    likesCount.className = "mr-2"
    likesCount.innerText = `${story.likes.length} likes`;
    likesCount.title = story.likes.map(like => `${like.user.username} (${like.rating})`).join("\n")

    const currentUser = localStorage.getItem("username");
    const currentUserLike = story.likes.find(like => like.user.username === currentUser);

    const likeContainer = document.createElement("span");
    likeContainer.className = "mr-2 d-inline"

    const likeButton = document.createElement("button");
    likeButton.innerText = currentUserLike === undefined ? "Like" : `Already liked (${currentUserLike.rating})`;
    likeButton.className = "btn btn-primary"

    const like = document.createElement("input");
    like.className = "form-control"
    like.disabled = currentUserLike !== undefined;
    like.type = "number";
    like.max = 5;
    like.min = 1;

    if (currentUserLike) {
        like.value = currentUserLike.rating;
        // If already liked, disable button
        likeButton.disabled = true;
    } else {
        like.value = 5;
    }

    // If not online unable to properly perform likes and disable the button
    if (navigator.onLine) {
        // Handle liking
        likeButton.addEventListener("click", async e => {
            e.preventDefault();
            try {
                await fetch("/api/stories/like", {
                    method: "POST", body: JSON.stringify({ storyId: story._id, rating: like.value }), headers: {
                        "Content-Type": "application/json"
                    }
                });
                likeButton.disabled = true;
                like.disabled = true;
                likesCount.innerText = `${story.likes.length + 1} likes`;
                likeButton.innerText = `Already liked (${like.value})`;
            } catch (error) {
                console.error(error);
            }
        });
    } else {
        likeButton.disabled = true;
    }

    form.appendChild(likesCount);

    // Don't allow user to like own posts
    if (currentUser !== story.author.username) {
        likeContainer.appendChild(like)
        form.appendChild(likeContainer);
        form.appendChild(likeButton);
    }

    return form;
}

/**
 * Ensures that if the user is online and has a valid login credentials
 */
async function verifyLogin() {

    const storedUsername = window.localStorage.getItem("username");

    if (storedUsername) {
        document.getElementById("greeting").innerText = `Hello, ${storedUsername}!`;
    }

    // if client is offline unable to verify user status
    if (navigator.onLine) {

        let username;

        try {
            const res = await fetch("/api/auth/me", { headers: { "Content-type": "application/json" } });
            const json = await res.json();
            username = json.username;
        } catch (e) {
            console.log("Login Failed " + e)
        }

        if (!username) {
            window.localStorage.removeItem("username");
            window.location = "/login";
        } else {
            window.localStorage.setItem("username", username);
            document.getElementById("greeting").innerText = `Hello, ${username}!`;
        }

    } else {
        showOfflineWarning();
    }
}