var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const login_btn = document.getElementById('loginBtn');
const staff_btn = document.querySelectorAll('.staff-btn');
/**
 * Redirects the browser to the staff details page based on the buttons data-user attribute
 * @param {Event}
 * @returns {void}
 */
function staff_button(event) {
    const target = event.currentTarget;
    const user_id = target.getAttribute("data-user");
    window.location.href = `user.html?id=${user_id}`;
}
/**
 * Handles the login of the user by sending the information to the server
 * @preconditions Elements with the IDs username, password, message
 * @returns {Promise<void>} Resolves when the login attempt is complete
 */
function login_handler() {
    return __awaiter(this, void 0, void 0, function* () {
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        const message_element = document.getElementById('message');
        try {
            //Sends the data to the server file
            const response = yield fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, pass })
            });
            const data = yield response.json();
            //Send updates to the user
            if (message_element) {
                message_element.innerText = data.message;
                message_element.classList.remove('success', 'error');
                message_element.classList.add(data.success ? 'success' : 'error');
            }
            else { }
            if (data.success) {
                setTimeout(() => {
                    if (data.redirectUrl) {
                        window.location.href = data.redirectUrl;
                    }
                    else {
                        window.location.href = "../dashboard";
                    }
                }, 1000);
            }
        }
        catch (error) {
            console.error("Connection failed:", error);
            if (message_element) {
                message_element.innerText = "Server is offline.";
            }
            else { }
        }
    });
}
staff_btn.forEach(btn => {
    btn.addEventListener("click", staff_button);
});
login_btn === null || login_btn === void 0 ? void 0 : login_btn.addEventListener("click", login_handler);
