import API from './api.js';
import { comment, like, unlike } from './dummy.js';

const api = new API('http://127.0.0.1:5000');

// api.put('user/follow/?username=Sebastian', {
//     headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Token ${token}`,
//     },
// })

// api.put('user/unfollow/?username=Sebastian', {
//     headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Token ${token}`,
//     },
// })

function getFeed(token) {
    console.log(token);
    api.get('user/feed', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`,
        },
    })

    .then(data => {
        console.log(data);
        if (data.posts.length > 0) {
            for (let i = 0; i < data.posts.length; i++) {
                const feed = document.getElementById('loggedIn');
                const br = document.createElement('br');
                feed.appendChild(br);

                const post = document.createElement('div');
                post.className = 'post';
                post.style.display = 'block';
                const authorDiv = document.createElement('div');
                authorDiv.className = 'author';
                post.appendChild(authorDiv);

                const author = data.posts[i].meta.author;
                const date = new Date(+data.posts[i].meta.published * 1000);
                let likes = data.posts[i].meta.likes.length;
                const description = data.posts[i].meta.description_text;
                let comments = data.posts[i].comments.length;
                const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const d = date.getDate();
                const m = date.getMonth();
                const y = date.getFullYear();
        
                authorDiv.innerText = author;
                const image = document.createElement('img');
                image.setAttribute('src', 'data:img/png;base64,' + data.posts[i].src);
                post.appendChild(image);

                const interactDiv = document.createElement('div');
                const likeButton = document.createElement('img');

                displayLikeButton(interactDiv, data, i, likes, token, likeButton);

                const commentDiv = document.createElement('div');
                displayCommentButton(interactDiv, comments, post, commentDiv);

                displayLikesModal(data, likes, likeButton, i, token, post);

                const descDiv = document.createElement('div');
                const desc = document.createTextNode(description);
                descDiv.className = 'description';
                descDiv.appendChild(desc);
                post.appendChild(descDiv);

                const dateDiv = document.createElement('div');
                const dateString = document.createTextNode('Posted: ' + d + ' ' + monthName[m] + ' ' + y);
                dateDiv.className = 'date';
                dateDiv.appendChild(dateString);
                post.appendChild(dateDiv);

                feed.appendChild(post);

                displayCommentsModal(data, i, author, commentDiv, comments);

                document.getElementById('logoutButton').addEventListener('click', e => {
                    remove(post, br);
                });
                
            } 
        }
    })
    .catch(err => {
        alert(err);
    });
}

const remove = (post, br) => {
    document.getElementById('loggedOut').style.display = 'block';
    document.getElementById('loggedIn').style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('logoutButton').style.visibility = 'hidden';
    document.getElementById('profile').style.visibility = 'hidden';
    document.getElementById('home').style.visibility = 'hidden';
    post.remove();
    br.remove();
}

const displayLikesModal = (data, likes, likeButton, i, token, post) => {
    const likesDiv = document.createElement('div');
    likesDiv.innerText = likes + ' likes';
    likesDiv.className = 'likesDiv';
    post.appendChild(likesDiv);

    likeButton.addEventListener('click', e => {
        if (likeButton.getAttribute('src') === '/liked.png') {
            likeButton.setAttribute('src', '/empty-like.png');
            likeButton.className = 'likeButton';
            unlike(data.posts[i].id, token);
            likes = likes - 1;

            likesDiv.innerText = likes + ' likes';
        } else {
            likeButton.setAttribute('src', '/liked.png');
            likeButton.className = 'likeButton';
            like(data.posts[i].id, token);
            likes = likes + 1;

            likesDiv.innerText = likes + ' likes';
        }
    })

    const modal2 = document.getElementById('modal2');
    const likesModalContent = document.getElementById('likesModalContent');
    const span2 = document.getElementsByClassName('close2')[0];
    console.log(likes)

    likesDiv.addEventListener('click', e => {
        if (likes > 0) {
            modal2.style.display = "block";
            document.body.style.overflow = "hidden"; 
            document.body.style.height = "100%"; 
                console.log(likes)
            const numberOfLikes = document.createElement('div');
            numberOfLikes.className = 'numLikes';
            numberOfLikes.innerText = likes + ' likes';
            likesModalContent.appendChild(numberOfLikes);

            for (let i = 0; i < likes; i++) {
                api.get('user?id=' + data.posts[i].meta.likes[i], {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${localStorage.getItem('token')}`,
                    },
                })
                .then(data => {
                    const showLikesDiv = document.createElement('div');
                    showLikesDiv.innerText = data.username;
                    showLikesDiv.className = 'showLikesDiv';
                    likesModalContent.appendChild(showLikesDiv);

                    span2.addEventListener('click', e => {
                        modal2.style.display = "none";
                        document.body.style.overflow = "auto"; 
                        document.body.style.height = "auto";
                        showLikesDiv.remove()
                        numberOfLikes.remove();
                    })

                    window.addEventListener('click', e => {
                        if (e.target == modal2) {
                            modal2.style.display = "none";
                            document.body.style.overflow = "auto"; 
                            document.body.style.height = "auto";
                            showLikesDiv.remove()
                            numberOfLikes.remove();
                        }
                    })
                })
            }
        }
    })
}

const displayLikeButton = (interactDiv, data, i, likes, token, likeButton) => {
    likeButton.setAttribute('src', '/empty-like.png');
    likeButton.className = 'likeButton';
    interactDiv.appendChild(likeButton);
    
    for (let j = 0; j < likes; j++) {
        if (likes > 0) { 
            let idOfLiker = data.posts[i].meta.likes[j];
            api.get('user', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`,
                },
            })
            .then(data => {
                if (data.id === idOfLiker) {
                    likeButton.setAttribute('src', '/liked.png');
                    likeButton.className = 'likeButton';
                } else {
                    likeButton.setAttribute('src', '/empty-like.png');
                    likeButton.className = 'likeButton';
                }
            });
        }
    }
}

const displayCommentButton = (interactDiv, comments, post, commentDiv) => {
    const commButton = document.createElement('img');
    commButton.setAttribute('src', '/comment.png');
    commButton.className = 'commButton';
    commentDiv.appendChild(commButton);
    const numComments = document.createTextNode(comments);
    commentDiv.className = 'comments';
    commentDiv.appendChild(commButton);
    commentDiv.appendChild(numComments);
    interactDiv.appendChild(commentDiv);
    post.appendChild(interactDiv);
}

const displayCommentsModal = (data, i, author, commentDiv, comments) => {
    const modal = document.getElementById('modal');
    const span = document.getElementsByClassName('close')[0];

    const modalPic = document.getElementById('modalImage');
    modalPic.className = 'modalImage';

    const displayUser = document.getElementById('displayUser');
    displayUser.className = 'displayUser';
    displayUser.innerText = author;

    const displayComments = document.getElementById('displayComments');
    displayComments.className = 'displayComments';
    
    commentDiv.addEventListener('click', e => {
        modal.style.display = "block";
        document.body.style.overflow = "hidden"; 
        document.body.style.height = "100%"; 
        const modalImage = document.createElement('img');
        modalImage.setAttribute('src', 'data:img/png;base64,' + data.posts[i].src)
        modalPic.appendChild(modalImage);

        if (comments === 0) {
            span.addEventListener('click', e => {
                modal.style.display = "none";
                document.body.style.overflow = "auto"; 
                document.body.style.height = "auto";  
                modalImage.remove();
            })

            window.addEventListener('click', e => {
                if (e.target == modal) {
                    modal.style.display = "none";
                    document.body.style.overflow = "auto"; 
                    document.body.style.height = "auto";  
                    modalImage.remove();
                }
            })
        }

        api.get('post/?id=' + data.posts[i].id, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${localStorage.getItem('token')}`,
            },
        })

        .then(data => {
            for (let i = 0; i < data.comments.length; i++) {
                const showCommentsUser = document.createElement('div');
                showCommentsUser.innerText = data.comments[i].author + ':';
                showCommentsUser.className = 'showCommentsUser';
                displayComments.appendChild(showCommentsUser);

                const showComments = document.createElement('div');
                showComments.innerText = data.comments[i].comment;
                showComments.className = 'showComments';
                displayComments.appendChild(showComments);

                span.addEventListener('click', e => {
                    modal.style.display = "none";
                    document.body.style.overflow = "auto"; 
                    document.body.style.height = "auto";  
                    modalImage.remove();
                    showComments.remove();
                    showCommentsUser.remove();
                })

                window.addEventListener('click', e => {
                    if (e.target == modal) {
                        modal.style.display = "none";
                        document.body.style.overflow = "auto"; 
                        document.body.style.height = "auto";  
                        modalImage.remove();
                        showComments.remove();
                        showCommentsUser.remove();
                    }
                })
            }
        })
    }) 
}

export { getFeed };

    