window.onload = async () => {
    document.querySelector("form#login").addEventListener("submit", async e => {
        e.preventDefault();
        const username = e.target.querySelector("#username").value;
        const password = e.target.querySelector("#password").value;
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ username, password }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (res.ok) {
                window.localStorage.setItem("username", username);
                window.location = "/";
            } else if (res.status === 401) {
                e.target.querySelector("#error").innerText = "bad username/password combination";
            } else {
                e.target.querySelector("#error").innerText = `unknown error`;
            }
        } catch (error) {
            e.target.querySelector("#error").innerText = `unknown error: ${e}`;
        }
    });
}