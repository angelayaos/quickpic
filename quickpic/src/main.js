import API from './api.js';
import { getFeed } from './user.js';

// This url may need to change depending on what port your backend is running
// on.
const api = new API('http://127.0.0.1:5000');

const login = token => {
    document.getElementById('loggedOut').style.display = 'none';
    document.getElementById('logoutButton').style.visibility = 'visible';
    document.getElementById('profileButton').style.visibility = 'visible';
    document.getElementById('home').style.visibility = 'visible';
    document.getElementById('loggedIn').style.display = 'block';

    getFeed(token);
}

document.getElementById('loginButton').addEventListener('click', e => {
    e.preventDefault()
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    api.post('auth/login', {
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "username": username,
            "password": password,
        }),
    })
        .then(data => {
            localStorage.setItem('token', data['token']);
            const token = localStorage.getItem('token');
            login(token);
        })
        .catch(err => {
            errorModal(err);
        });
})

document.getElementById('back').addEventListener('click', e => {
    e.preventDefault()
    document.getElementById('loggedOut').style.display = 'block';
    document.getElementById('signup').style.display = 'none';
    document.getElementById('loggedIn').style.display = 'none';
})

document.getElementById('signupButton').addEventListener('click', e => {
    e.preventDefault()
    document.getElementById('signup').style.display = 'block';
    document.getElementById('loggedOut').style.display = 'none';
})

document.getElementById('submit').addEventListener('click', e => {
    e.preventDefault()
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    const email = document.getElementById('signupEmail').value;
    const name = document.getElementById('signupName').value;
    api.post('auth/signup', {
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "username": username,
            "password": password,
            "email": email,
            "name": name,
        }),
    })
        .then(data => {
            if (password === confirmPass) {
                document.getElementById('signup').style.display = 'none';
                login(data['token']);
            } else {
                throw new Error('Passwords must match!');
            }
        })
        .catch(err => {
            errorModal(err);
        });
})

const errorModal = (err => {
    const error = document.getElementById('errorModal');
    const errorModalContent = document.getElementById('errorModalContent');
    const closeError = document.getElementsByClassName('closeError')[0];
    errorModalContent.innerText = err;

    error.style.display = 'block';
    document.body.style.overflow = "hidden"; 
    document.body.style.height = "100%"; 
    
    closeError.addEventListener('click', e => {
        errorModal.style.display = "none";
        document.body.style.overflow = "auto"; 
        document.body.style.height = "auto";
    })

    window.addEventListener('click', e => {
        if (e.target === error) {
            error.style.display = "none";
            document.body.style.overflow = "auto"; 
            document.body.style.height = "auto";
        }
    })
})

export { errorModal };