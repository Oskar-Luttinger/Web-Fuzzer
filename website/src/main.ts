const loginBtn = document.getElementById('loginBtn');

loginBtn?.addEventListener('click', async () => {
    //Gets the input from the HTML file
    const user = (document.getElementById('username') as HTMLInputElement).value;
    const pass = (document.getElementById('password') as HTMLInputElement).value;
    const messageElement = document.getElementById('message');

    try {
        //Sends the data to the server file
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pass })
        });

        const data = await response.json();

        //Send updates to the user
        if (messageElement) {
            messageElement.innerText = data.message;
            messageElement.style.color = data.success ? 'green' : 'red';
        }

    } catch (error) {
        console.error("Connection failed:", error);
        if (messageElement) messageElement.innerText = "Server is offline.";
    }
});