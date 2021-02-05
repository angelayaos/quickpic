import API from './api.js';
import { fileToDataUrl } from './helpers.js';
import { displayPosts } from './user.js';
import { errorModal } from './main.js';

const api = new API('http://127.0.0.1:5000');

const makeAComment = (id, token, comment) => {
    api.put('post/comment?id=' + id, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
            "comment": comment,
        }),
    })
}

const like = (id, token) => {
    api.put('post/like?id=' + id, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
        },
    })
}

const unlike = (id, token) => {
    api.put('post/unlike?id=' + id, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
        },
    })
}

const addPost = (token, description, src) => {
    api.post('post', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
            "description_text": description,
            "src": src,
        }),
    })
    .then(data => {
        api.get('post/?id=' + data.post_id, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
        })
        .then(data => {
            const feed = document.getElementById('profile');
            const post = document.createElement('div');
            post.className = 'post';
            post.style.display = 'block';
            const authorDiv = document.createElement('div');

            displayPosts(data, token, post, feed, authorDiv);
        })
    })
    .catch(err => { 
        errorModal(err);
    });
}

const createPost = () => {
    const makePost = document.getElementById('addButton');
    makePost.style.visibility = 'visible';

    const editProfile = document.getElementById('editProfileButton');
    editProfile.style.visibility = 'visible';

    const followButton = document.getElementById('followButton');
    followButton.style.display = 'none';

    makePost.addEventListener('click', e => {
        const createPostModal = document.getElementById('createPostModal');
        const closeCreatePost = document.getElementsByClassName('closeCreatePost')[0];
        createPostModal.style.display = "block";
        document.body.style.overflow = "hidden"; 
        document.body.style.height = "100%"; 

        closeCreatePost.addEventListener('click', e => {
            createPostModal.style.display = "none";
            document.body.style.overflow = "auto"; 
            document.body.style.height = "auto";
        })

        window.addEventListener('click', e => {
            if (e.target === createPostModal) {
                createPostModal.style.display = "none";
                document.body.style.overflow = "auto"; 
                document.body.style.height = "auto";
            }
        })  

        const postButton = document.getElementById('postButton');

        postButton.addEventListener('click', e => {
            e.preventDefault();
            createPostModal.style.display = "none";
            document.body.style.overflow = "auto"; 
            document.body.style.height = "auto";
            const file = document.querySelector('input[type="file"]').files[0];
            fileToDataUrl(file).then(data => {
                const data64 = data.split(',')[1];
                const description = document.getElementById('description').value;
                addPost(localStorage.getItem('token'), description, data64);
            })
        })
    });
}

const editProfile = () => {
    const updateProfile = document.getElementById('editProfileButton');

    updateProfile.addEventListener('click', e => {
        const editProfileModal = document.getElementById('editProfileModal');
        const closeUpdateProfile = document.getElementsByClassName('closeUpdateProfile')[0];
        editProfileModal.style.display = "block";
        document.body.style.overflow = "hidden"; 
        document.body.style.height = "100%"; 

        closeUpdateProfile.addEventListener('click', e => {
            editProfileModal.style.display = "none";
            document.body.style.overflow = "auto"; 
            document.body.style.height = "auto";
        })

        window.addEventListener('click', e => {
            if (e.target === editProfileModal) {
                editProfileModal.style.display = "none";
                document.body.style.overflow = "auto"; 
                document.body.style.height = "auto";
            }
        })  
    })
    const updateButton = document.getElementById('updateButton');

    updateButton.addEventListener('click', e => {
        updateMyProfile(document.getElementById('updateEmail').value, document.getElementById('updateName').value, document.getElementById('updatePassword').value);
        e.preventDefault();
    })
}

const updateMyProfile = (email, name, password) => {
    api.put('user', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
            "password": password,
            "name": name,
            "email": email,
        }),
    })
    .then(data => {
        successModal(data);
    })
    .catch(err => { 
        errorModal(err);
    });
    const editProfileModal = document.getElementById('editProfileModal');

    editProfileModal.style.display = "none";
    document.body.style.overflow = "auto"; 
    document.body.style.height = "auto";
}

const successModal = (data => {
    const success = document.getElementById('successModal');
    const successModalContent = document.getElementById('successModalContent');
    const closeSuccess = document.getElementsByClassName('closeSuccess')[0];
    successModalContent.innerText = 'Successfully updated'

    success.style.display = 'block';
    document.body.style.overflow = "hidden"; 
    document.body.style.height = "100%"; 
    
    closeSuccess.addEventListener('click', e => {
        success.style.display = "none";
        document.body.style.overflow = "auto"; 
        document.body.style.height = "auto";
        document.getElementById('updatingProfile').reset();
    })

    window.addEventListener('click', e => {
        if (e.target === success) {
            success.style.display = "none";
            document.body.style.overflow = "auto"; 
            document.body.style.height = "auto";
            document.getElementById('updatingProfile').reset();
        }
    })
})

export { like, unlike, createPost, makeAComment, editProfile };