var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const loginBtn = document.getElementById('loginBtn');
loginBtn === null || loginBtn === void 0 ? void 0 : loginBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
    // 1. Grab the values from your HTML inputs
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const messageElement = document.getElementById('message');
    try {
        // 2. Send the data to your server.ts
        // We use '/login' because the server is hosting the HTML and the API together
        const response = yield fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pass })
        });
        const data = yield response.json();
        // 3. Show the result to the user
        if (messageElement) {
            messageElement.innerText = data.message;
            messageElement.style.color = data.success ? 'green' : 'red';
        }
    }
    catch (error) {
        console.error("Connection failed:", error);
        if (messageElement)
            messageElement.innerText = "Server is offline.";
    }
}));
