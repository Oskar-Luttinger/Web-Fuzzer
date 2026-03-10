const login_btn = document.getElementById('loginBtn');
const staff_btn = document.querySelectorAll('.staff-btn');

/**
 * Redirects the browser to the staff details page based on the buttons data-user attribute
 * @param {Event} the click event from the staff button
 * @returns {void}
 */
function staff_button(event: Event): void {
    const target = event.currentTarget as HTMLElement;
    const user_id = target.getAttribute("data-user")
    window.location.href = `user.html?id=${user_id}`;
}

/** 
 * Handles the login of the user by sending the information to the server
 * @returns {Promise<void>} Resolves when the login attempt is complete
 */
async function login_handler(): Promise<void> {
    const user = (document.getElementById('username') as HTMLInputElement).value;
    const pass = (document.getElementById('password') as HTMLInputElement).value;
    const message_element = document.getElementById('message');
        try {
        //Sends the data to the server file
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pass })
        });

        const data = await response.json();

        //Send updates to the user
        if (message_element) {
            message_element.innerText = data.message;
            message_element.classList.remove('success', 'error');
            message_element.classList.add(data.success ? 'success' : 'error');
        } else {}

        if (data.success) {
         setTimeout(() => {
            if(data.redirectUrl)  {
                window.location.href = data.redirectUrl;
            } else {
                window.location.href = "../dashboard";
            }
         }, 1000);
        } else {}

    } catch (error) {
        console.error("Connection failed:", error);
        if (message_element) {
            message_element.innerText = "Server is offline.";
        } else {}
    }
}

staff_btn.forEach(btn => {
    btn.addEventListener("click", staff_button);
});

login_btn?.addEventListener("click", login_handler);