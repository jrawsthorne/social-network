window.onload = async () => {

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js');
    }

    document.querySelector("form#register").addEventListener("submit", async e => {
        e.preventDefault();
        const username = e.target.querySelector("#username").value;
        const password = e.target.querySelector("#password").value;
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({ username, password }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (res.ok) {
                // Store users username via local storage & redirect to stories wall
                const { username } = await res.json();
                window.localStorage.setItem("username", username);
                window.location = "/";
            } else {
                const { error } = await res.json();
                if (error) {
                    e.target.querySelector("#error").innerText = error.message;
                } else {
                    e.target.querySelector("#error").innerText = "unknown error";
                }

            }
        } catch (error) {
            e.target.querySelector("#error").innerText = "unknown error";
        }
    });
}