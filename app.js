const cl = console.log;

const postForm = document.getElementById('postForm')
const titleControl = document.getElementById('title')
const contentControl = document.getElementById('content')
const userIdControl = document.getElementById('userId')
const spinner = document.getElementById('spinner')
const addPostBtn = document.getElementById('addPostBtn')
const updatePostBtn = document.getElementById('updatePostBtn')

// create >> POST
// get from DB >> GET
// remove >> DELETE
// update >> PUT/PATCH

const BASE_URL = `https://crud-14628-default-rtdb.firebaseio.com`

const POSTS_URL = `${BASE_URL}/posts.json`;
const postContainer = document.getElementById('postContainer')

let postsArr = []


function objToArr(obj) {
    for (const key in obj) {
        postsArr.push({ ...obj[key], id: key })
    }
}

function toggleSpinner(flag) {
    if (!!flag) {
        spinner.classList.remove('d-none')
    } else {
        spinner.classList.add('d-none')
    }

}

function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 3000
    })
}


const createPostCards = arr => {
    postsArr = arr;
    let result = '';
    for (let i = arr.length - 1; i >= 0; i--) {
        result += `
            <div class="col-md-4 mb-4" id="${arr[i].id}">
                <div class="card h-100">
                    <div class="card-header">
                        <h3>
                            ${arr[i].title}
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">
                            ${arr[i].content}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button 
                        onclick="onEdit(this)"
                        class="btn btn-sm btn-outline-primary">Edit</button>
                        <button 
                        onclick="onRemove(this)"
                        class="btn btn-sm btn-outline-danger">Remove</button>
                    </div>
                </div>
            </div>`

    };

    postContainer.innerHTML = result;

}


async function makeApiCall(api_url, method_name, msg_body = null) {
    toggleSpinner(true)

    msg_body = msg_body ? JSON.stringify(msg_body) : null

    const config = {
        method: method_name,
        body: msg_body,
        headers: {
            auth: 'JWT token from LS'
        }
    }
    try {
        let res = await fetch(api_url, config)
        let data = await res.json()

        if (!res.ok) {
            let err = data.error || res.statusText || 'Something went wrong'
            throw new Error(err)
        }
        return data
    } catch (err) {
        snackbar(err, 'error')
    } finally {
        toggleSpinner()
    }
}

// makeApiCall(POSTS_URL, 'GET')
//     .then(data => {
//         objToArr(data)
//         createPostCards(postsArr)
//     })



async function fetchPosts() {
    try {
        let data = await makeApiCall(POSTS_URL, 'GET')
        objToArr(data)
        createPostCards(postsArr)

    } catch (err) {
        snackbar(err, 'error')
    }
}

fetchPosts()



async function onPostSubmit(eve) {
    eve.preventDefault()
    let postObj = {
        title: titleControl.value,
        content: contentControl.value,
        userId: userIdControl.value
    }
    try {
        let res = await makeApiCall(POSTS_URL, 'POST', postObj)
        postForm.reset()
        let col = document.createElement('div');
        col.className = 'col-md-4 mb-4'
        col.id = res.name
        col.innerHTML = `
            <div class="card h-100">
                    <div class="card-header">
                        <h3>
                            ${postObj.title}
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">
                            ${postObj.content}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button 
                        onclick="onEdit(this)"
                        class="btn btn-sm btn-outline-primary">Edit</button>
                        <button 
                        onclick="onRemove(this)"
                        class="btn btn-sm btn-outline-danger">Remove</button>
                    </div>
                </div>`
        postContainer.prepend(col)
        snackbar(`The post with ID ${res.name} is added successfully!!!`, 'success')

    } catch (err) {
        snackbar(err)
    }
}


async function onEdit(ele) {
    let EDIT_ID = ele.closest('.col-md-4').id;
    localStorage.setItem('EDIT_ID', EDIT_ID)

    let EDIT_URL = `${BASE_URL}/posts/${EDIT_ID}.json`

    try {
        let res = await makeApiCall(EDIT_URL, 'GET')
        titleControl.value = res.title;
        contentControl.value = res.content;
        userIdControl.value = res.userId;
        addPostBtn.classList.add('d-none')
        updatePostBtn.classList.remove('d-none')
        snackbar(`The post with ID ${EDIT_ID} is patched successfully!!!`, 'success')
    } catch (err) {
        snackbar(err)
    }
}

async function onPostUpdate() {
    // UPDATE_ID

    let UPDATE_ID = localStorage.getItem('EDIT_ID')
    // UPDATE_URL
    let UPDATE_URL = `${BASE_URL}/posts/${UPDATE_ID}.json`
    // UPDATED_OBJ

    let UPDATED_OBJ = {
        title: titleControl.value,
        content: contentControl.value,
        userId: userIdControl.value,
        id: UPDATE_ID
    }



    // API CALL

    try {
        let res = await makeApiCall(UPDATE_URL, 'PATCH', UPDATED_OBJ);
        postForm.reset();
        localStorage.removeItem('EDIT_ID')
        let col = document.getElementById(UPDATE_ID);
        col.querySelector('.card-header h3').innerText = res.title
        col.querySelector('.card-body p').innerText = res.content
        updatePostBtn.classList.add('d-none')
        addPostBtn.classList.remove('d-none')
        snackbar(`The Post with ID ${UPDATE_ID} is updated successfully!!!`, 'success')
    } catch (err) {
        snackbar(err)
    }


}

async function onRemove(ele) {
    let REMOVE_ID = ele.closest('.col-md-4').id;
    try {
        let getConfirm = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, remove it!"
        })
        if (getConfirm.isConfirmed) {
            // REMOVE API CALL

            let REMOVE_URL = `${BASE_URL}/posts/${REMOVE_ID}.json`

            let res = await makeApiCall(REMOVE_URL, 'DELETE')
            ele.closest('.col-md-4').remove()
        }
    } catch (err) {
        snackbar(err)
    }
}



postForm.addEventListener('submit', onPostSubmit)
updatePostBtn.addEventListener('click', onPostUpdate)







