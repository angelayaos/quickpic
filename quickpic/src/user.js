import API from './api.js';
import { like, unlike, createPost, makeAComment, editProfile } from './post.js';
import { errorModal } from './main.js';

const api = new API('http://127.0.0.1:5000');

const follow = (username, token) => {
    api.put('user/follow/?username=' + username, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
        },
    })
}

const unfollow = (username, token) => {
    api.put('user/unfollow/?username=' + username,  {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
        },
    })
}

const getFeed = (token) => {
    console.log(token);
    api.get('user/feed', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`,
        },
    })

    .then(data => {
        if (data.posts.length > 0) {
            for (let i = 0; i < data.posts.length; i++) {
                const feed = document.getElementById('loggedIn');

                const authorDiv = document.createElement('div');

                const post = document.createElement('div');
                post.className = 'post';
                post.style.display = 'block';

                displayPosts(data.posts[i], token, post, feed, authorDiv);
                
                authorDiv.addEventListener('click', e => {
                    document.getElementById('loggedIn').style.display = 'none';
                    getProfile(data.posts[i].meta.author);
                });
            } 
        }
    })
    .catch(err => { 
        errorModal(err);
    });
}

const profileButton = document.getElementById('profileButton');

profileButton.addEventListener('click', e => {
    document.getElementById('loggedIn').style.display = 'none';
    api.get('user', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`,
        },
    })
    .then(data => {
        createProfile(data);
        createPost();
        editProfile();
    })
    .catch(err => { 
        errorModal(err);
    });
});

const displayLikesModal = (data, likes, likeButton, token, post) => {
    const likesDiv = document.createElement('div');
    likesDiv.innerText = likes + ' likes';
    likesDiv.className = 'likesDiv';
    post.appendChild(likesDiv);

    likeButton.addEventListener('click', e => {
        if (likeButton.getAttribute('src') === 'icons/liked.png') {
            likeButton.setAttribute('src', 'icons/empty-like.png');
            likeButton.className = 'likeButton';
            likes = likes - 1;

            likesDiv.innerText = likes + ' likes';
            unlike(data.id, token);
        } else {
            likeButton.setAttribute('src', 'icons/liked.png');
            likeButton.className = 'likeButton';
            likes = likes + 1;

            likesDiv.innerText = likes + ' likes';
            like(data.id, token);
        }   
    })

    const likesModal = document.getElementById('likesModal');
    const likesModalContent = document.getElementById('likesModalContent');
    const closeLikes = document.getElementsByClassName('closeLikes')[0];
    
    likesDiv.addEventListener('click', e => {
        if (likes > 0) {
            likesModal.style.display = "block";
            document.body.style.overflow = "hidden"; 
            document.body.style.height = "100%"; 

            const numberOfLikes = document.createElement('div');
            numberOfLikes.className = 'numLikes';
            numberOfLikes.innerText = likes + ' likes';
            likesModalContent.appendChild(numberOfLikes);

            for (let j = 0; j < likes; j++) {
                api.get('user?id=' + data.meta.likes[j], {
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

                    closeLikes.addEventListener('click', e => {
                        likesModal.style.display = "none";
                        document.body.style.overflow = "auto"; 
                        document.body.style.height = "auto";
                        showLikesDiv.remove()
                        numberOfLikes.remove();
                    })

                    window.addEventListener('click', e => {
                        if (e.target === likesModal) {
                            likesModal.style.display = "none";
                            document.body.style.overflow = "auto"; 
                            document.body.style.height = "auto";
                            showLikesDiv.remove()
                            numberOfLikes.remove();
                        }
                    })
                })
                .catch(err => { 
                    errorModal(err);
                });
            }
        }
    })
}

const displayLikeButton = (data, likes, token) => {
    const likeButton = document.createElement('img');
    likeButton.setAttribute('src', 'icons/empty-like.png');
    likeButton.className = 'likeButton';

    for (let j = 0; j < likes; j++) {
        let idOfLiker = data.meta.likes[j];
        api.get('user', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
        })
        .then(data => {
            if (data.id === idOfLiker) {
                likeButton.setAttribute('src', 'icons/liked.png');
                likeButton.className = 'likeButton';
            }
        })
        .catch(err => { 
            errorModal(err);
        });
    }
    return likeButton;
}

const displayCommentButton = (interactDiv, comments, post, commentDiv) => {
    const commButton = document.createElement('img');
    commButton.setAttribute('src', 'icons/comment.png');
    commButton.className = 'commButton';
    commentDiv.appendChild(commButton);
    const numComments = document.createTextNode(comments);
    commentDiv.className = 'comments';
    commentDiv.appendChild(commButton);
    commentDiv.appendChild(numComments);
    interactDiv.appendChild(commentDiv);
    post.appendChild(interactDiv);
}

const displayCommentsModal = (data, author, commentDiv, comments, token) => {
    const commentsModal = document.getElementById('commentsModal');
    const closeComments = document.getElementsByClassName('closeComments')[0];

    const modalPic = document.getElementById('modalImage');
    modalPic.className = 'modalImage';

    const displayUser = document.getElementById('displayUser');
    displayUser.className = 'displayUser';
    displayUser.innerText = author;

    const displayComments = document.getElementById('displayComments');
    displayComments.className = 'displayComments';
    
    commentDiv.addEventListener('click', e => {
        commentsModal.style.display = "block";
        document.body.style.overflow = "hidden"; 
        document.body.style.height = "100%"; 
        const modalImage = document.createElement('img');
        modalImage.setAttribute('src', 'data:img/png;base64,' + data.src)
        modalImage.className = 'imageSize';
        modalPic.appendChild(modalImage);

        if (comments === 0) {
            closeComments.addEventListener('click', e => {
                commentsModal.style.display = "none";
                document.body.style.overflow = "auto"; 
                document.body.style.height = "auto";  
                modalImage.remove();
            })

            window.addEventListener('click', e => {
                if (e.target === commentsModal) {
                    commentsModal.style.display = "none";
                    document.body.style.overflow = "auto"; 
                    document.body.style.height = "auto";  
                    modalImage.remove();
                }
            })
        }

        api.get('post/?id=' + data.id, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${localStorage.getItem('token')}`,
            },
        })
        .then(data => {
            for (let j = 0; j < data.comments.length; j++) {
                const showCommentsUser = document.createElement('div');
                showCommentsUser.innerText = data.comments[j].author + ':';
                showCommentsUser.className = 'showCommentsUser';
                displayComments.appendChild(showCommentsUser);

                const showComments = document.createElement('div');
                showComments.innerText = data.comments[j].comment;
                showComments.className = 'showComments';
                displayComments.appendChild(showComments);

                closeComments.addEventListener('click', e => {
                    commentsModal.style.display = "none";
                    document.body.style.overflow = "auto"; 
                    document.body.style.height = "auto";  
                    modalImage.remove();
                    showComments.remove();
                    showCommentsUser.remove();
                })

                window.addEventListener('click', e => {
                    if (e.target === commentsModal) {
                        commentsModal.style.display = "none";
                        document.body.style.overflow = "auto"; 
                        document.body.style.height = "auto";  
                        modalImage.remove();
                        showComments.remove();
                        showCommentsUser.remove();
                    }
                })
            }
            const makeComment = document.getElementById('confirmComment');
                
            makeComment.addEventListener('click', e => {
                const comment = document.getElementById('comment').value;
                makeAComment(data.id, token, comment);
    
                api.get('user', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`,
                    },
                })
                .then(data => {
                    const showUsername = document.createElement('div');
                    showUsername.innerText = data.username + ':';
                    showUsername.className = 'showCommentsUser';
                    displayComments.appendChild(showUsername);
    
                    const showNewComment = document.createElement('div');
                    showNewComment.innerText = comment;
                    showNewComment.className = 'showComments';
                    displayComments.appendChild(showNewComment);

                    closeComments.addEventListener('click', e => {
                        commentsModal.style.display = "none";
                        document.body.style.overflow = "auto"; 
                        document.body.style.height = "auto";  
                        modalImage.remove();
                        showUsername.remove();
                        showNewComment.remove();
                    })
    
                    window.addEventListener('click', e => {
                        if (e.target === commentsModal) {
                            commentsModal.style.display = "none";
                            document.body.style.overflow = "auto"; 
                            document.body.style.height = "auto";  
                            modalImage.remove();
                            showUsername.remove();
                            showNewComment.remove();    
                        }
                    })
                })
            })
        })
        .catch(err => { 
            errorModal(err);
        });
    }) 
}

const getProfile = (author) => {  
    api.get('user?username=' + author, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`,
        },
    })
    .then(data => {        
        createProfile(data);
        const makePost = document.getElementById('addButton');
        makePost.style.visibility = 'hidden';
        const editProfile = document.getElementById('editProfileButton');
        editProfile.style.visibility = 'hidden';
    })
    .catch(err => { 
        errorModal(err);
    });
}  

const goHome = (following, followers, posted) => {
    document.getElementById('logoutButton').style.visibility = 'visible';
    document.getElementById('profileButton').style.visibility = 'visible';
    document.getElementById('home').style.visibility = 'visible';
    document.getElementById('profile').style.display = 'none';
    document.getElementById('loggedIn').style.display = 'block';

    following.remove();
    followers.remove();
    posted.remove();
}

const createProfile = (data) => {
    const profile = document.getElementById('profile');
    document.getElementById('profile').style.display = 'block';
    
    const userProfileName = document.getElementById('userProfileName');
    userProfileName.innerText = data.username;

    const userStats = document.getElementById('userStats');
    const posted = document.createElement('div');
    posted.innerText = data.posts.length + ' posts';
    userStats.appendChild(posted);
    
    const followers = document.createElement('div');
    let followingNum = data.followed_num;
    followers.innerText = followingNum + ' followers';
    userStats.appendChild(followers);
    
    const following = document.createElement('div');
    following.className = 'following';
    following.innerText = data.following.length + ' following';
    userStats.appendChild(following);
    
    profile.appendChild(userStats);

    const profileID = data.id;
    const profileUsername = data.username;

    const followButton = document.getElementById('followButton');
    followButton.style.display = 'block';

    api.get('user', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`,
        },
    })
    .then(data => {
        for (let k = 0; k < followingNum; k++) {
            const followedUser = data.following[k];
            if (followedUser === profileID) {
                followButton.setAttribute('src', 'icons/followed.png');
            }
        }

        followButton.addEventListener('click', e => {
            if (followButton.getAttribute('src') === 'icons/followed.png') {
                followButton.setAttribute('src', 'icons/follow.png');
                followButton.className = 'followButton';
                unfollow(profileUsername, localStorage.getItem('token'));
                followingNum = followingNum - 1;
    
                followers.innerText = followingNum + ' followers';
            } else {
                followButton.setAttribute('src', 'icons/followed.png');
                followButton.className = 'followButton';
                follow(profileUsername, localStorage.getItem('token'));
                followingNum = followingNum + 1;
    
                followers.innerText = followingNum + ' followers';
            }
        })
    })
    .catch(err => { 
        errorModal(err);
    });

    const followingModal = document.getElementById('followingModal');

    displayFollowing(data, following, followingModal);

    const homeButton = document.getElementById('home');
    const logout = document.getElementById('logoutButton');

    if (data.posts.length === 0) {
        homeButton.addEventListener('click', e => {
            goHome(profileHeader, following, followers, posted);
            followingModal.style.display = "none";
        })
        profileButton.addEventListener('click', e => {
            removeProfile(profileHeader, following, followers, posted);
        })

        logout.addEventListener('click', e => {
            logoutRemove();
            userProfileName.remove();
            following.remove();
            followers.remove();
            posted.remove();
        });

        profile.className = 'noPosts';

    } else {
        for (let i = 0; i < data.posts.length; i++) {
            api.get('post/?id=' + data.posts[i], {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                },
            })
            .then(data => {
                const feed = document.getElementById('profile');

                const post = document.createElement('div');
                post.className = 'post';
                post.style.display = 'block';

                const authorDiv = document.createElement('div');

                const br = displayPosts(data, localStorage.getItem('token'), post, feed, authorDiv)
                
                homeButton.addEventListener('click', e => {
                    goHome(following, followers, posted);
                    post.remove();
                    br.remove();
                })

                profileButton.addEventListener('click', e => {
                    removeProfile(following, followers, posted);
                    post.remove();
                    br.remove();
                })
                logout.addEventListener('click', e => {
                    logoutRemove();
                    post.remove();
                    br.remove();
                    following.remove();
                    followers.remove();
                    posted.remove();
                });
            })
            .catch(err => { 
                errorModal(err);
            });
        }
        profile.className = 'yesPosts';
    }
}

const displayFollowing = (data, following, followingModal) => {
    const followingModalContent = document.getElementById('followingModalContent');
    const closeFollowing = document.getElementsByClassName('closeFollowing')[0];
    
    following.addEventListener('click', e => {
        if (data.following.length > 0) {
            followingModal.style.display = "block";
            document.body.style.overflow = "hidden"; 
            document.body.style.height = "100%"; 

            const numberOfFollowing = document.createElement('div');
            numberOfFollowing.className = 'numFollowing';
            numberOfFollowing.innerText = data.following.length + ' following';
            followingModalContent.appendChild(numberOfFollowing);

            for (let i = 0; i < data.following.length; i++) {
                api.get('user?id=' + data.following[i], {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${localStorage.getItem('token')}`,
                    },
                })
                .then(data => {    
                    const showFollowingDiv = document.createElement('div');
                    showFollowingDiv.innerText = data.username;
                    showFollowingDiv.className = 'showFollowingDiv';
                    followingModalContent.appendChild(showFollowingDiv);

                    closeFollowing.addEventListener('click', e => {
                        closeFollowingModal(followingModal, showFollowingDiv, numberOfFollowing);
                    })

                    window.addEventListener('click', e => {
                        if (e.target === followingModal) {
                            closeFollowingModal(followingModal, showFollowingDiv, numberOfFollowing);
                        }
                    })         
                })
                .catch(err => { 
                    errorModal(err);
                });
            }
        }
    })
}

const removeProfile = (following, followers, posted) => {
    document.getElementById('logoutButton').style.visibility = 'visible';
    document.getElementById('profileButton').style.visibility = 'visible';
    document.getElementById('home').style.visibility = 'visible';
    document.getElementById('profile').style.display = 'none';
    document.getElementById('loggedIn').style.display = 'none';
    
    following.remove();
    followers.remove();
    posted.remove();   
}

const closeFollowingModal = (followingModal, showFollowingDiv, numberOfFollowing) => {
    followingModal.style.display = "none";
    document.body.style.overflow = "auto"; 
    document.body.style.height = "auto";
    showFollowingDiv.remove()
    numberOfFollowing.remove();
}

const displayPosts = (data, token, post, feed, authorDiv) => {
    const br = document.createElement('br');
    feed.appendChild(br);

    authorDiv.className = 'author';
    authorDiv.innerText = data.meta.author;
    post.appendChild(authorDiv);

    const author = data.meta.author;
    const date = new Date(+data.meta.published * 1000);
    let likes = data.meta.likes.length;
    const description = data.meta.description_text;
    let comments = data.comments.length;
    const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = date.getDate();
    const m = date.getMonth();
    const y = date.getFullYear();

    const image = document.createElement('img');
    image.className = 'imageSize';
    image.setAttribute('src', 'data:img/png;base64,' + data.src);
    post.appendChild(image);

    image.alt = 'An image uploaded by ' + author + ' on ' + d + ' ' + monthName[m] + ' ' + y;

    const interactDiv = document.createElement('div');
    const isButtonLiked = displayLikeButton(data, likes, token)
    interactDiv.appendChild(isButtonLiked)

    const commentDiv = document.createElement('div');
    displayCommentButton(interactDiv, comments, post, commentDiv);

    displayLikesModal(data, likes, isButtonLiked, token, post);

    const descDiv = document.createElement('div');
    const desc = document.createTextNode(description);
    descDiv.className = 'description';
    descDiv.appendChild(desc);
    post.appendChild(descDiv);

    const dateDiv = document.createElement('div');
    const dateString = document.createTextNode('Posted on ' + d + ' ' + monthName[m] + ' ' + y);
    dateDiv.className = 'date';
    dateDiv.appendChild(dateString);
    post.appendChild(dateDiv);

    feed.appendChild(post);

    displayCommentsModal(data, author, commentDiv, comments, token);

    document.getElementById('logoutButton').addEventListener('click', e => {
        remove(post, br);
    });

    return br;
}

const logoutRemove = () => {
    document.getElementById('loggedOut').style.display = 'block';
    document.getElementById('loggedIn').style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('logoutButton').style.visibility = 'hidden';
    document.getElementById('profileButton').style.visibility = 'hidden';
    document.getElementById('home').style.visibility = 'hidden';
    document.getElementById('profile').style.display = 'none';
}

const remove = (post, br) => {
    logoutRemove();
    post.remove();
    br.remove();
}

export { getFeed, displayPosts };

    