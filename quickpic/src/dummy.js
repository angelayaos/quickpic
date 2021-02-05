import API from './api.js';

const api = new API('http://127.0.0.1:5000');

const comment = (id, token) => {
    api.put('/dummy/post/comment/?id=' + id, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
            "comment": "cute photo!",
        })
    })
}

const like = (id, token) => {
    api.put('/dummy/post/like/?id=' + id, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
        },
    })
}

const unlike = (id, token) => {
    api.put('/dummy/post/unlike/?id=' + id, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
        },
    })
}

export {comment, like, unlike};