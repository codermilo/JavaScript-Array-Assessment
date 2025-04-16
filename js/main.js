
/*
********* use a randomly generated id number (max 1050) and then apply that to the url for the image and that way I can call the photo's info as well to store it... *********
*/

/* Functions to generate new image, to save the image in local array, save index, render images based on the index, save button states for blur and grayscale */

/* Functions to grab array of users from local storage, to check if submitted email is there, to add that email to the array, to add any new images to that user's array (or delete) */


const $authRoute = $('#auth-route');
const $loginRoute = $('#login-route');

const $registerBtn = $('form');
const $emailInput = $('#email');
$registerBtn.on('submit', (event) => {
    console.log('register button clicked');
    event.preventDefault();

    emailSubmit($emailInput.val());
    console.log(getUsers());
    console.log('$emailInput.val()', $emailInput.val())
})

const $deleteBtn = $('#delete');
$deleteBtn.click(() => {
    console.log('delete button clicked');
    deleteUser($emailInput.val());
    console.log(getUsers());
})

const $loginBtn = $('#login');
$loginBtn.click(() => {
    console.log('login button clicked');
    logInUser('dan_friend@hotmail.co.uk');
    console.log(getUsers());
})

const $logoutBtn = $('#logout');
$logoutBtn.click(() => {
    console.log('logout button clicked');
    logOutUsers();
    console.log(getUsers());
})

// *** Need to save id so that save btn can access it ***
const $saveBtn = $('#save');
$saveBtn.click((id) => {
    console.log('save button clicked');
    addImage(id);
    console.log(getUsers(), id);
})



// Function to style page so auth route is shown
function showAuthRoute() {
    $authRoute.removeClass('hidden');
    $loginRoute.addClass('hidden');
}

// Function to style page so auth route is hidden
function hideAuthRoute() {
    $authRoute.addClass('hidden');
    $loginRoute.removeClass('hidden');
    // Call populate user list as user will be seeing login section again
    populateEmailList();
}

// Function to retrieve users from local storage
function getUsers() {
    // Retrieve users json from local storage 
    const storedUsers = localStorage.getItem('usersList');
    // Convert json to array of objects
    const usersArray = JSON.parse(storedUsers);
    return usersArray;
}

// Function to set users in local storage
function setUsers(users) {
    // Convert the array into a JSON string
    const usersJSON = JSON.stringify(users);

    // Store the JSON string in local storage under a key
    localStorage.setItem('usersList', usersJSON);
}

// General function to check if email is valid and if user already exists in local storage. (Returns either user or undefined)
function checkUserEmail(email) {
    // Retrieve users
    const usersArray = getUsers();
    console.log('usersArray in checkUserEmail', usersArray);

    // Map and look for submitted email
    const user = usersArray.find((user) => user.email === email);
    console.log('user in checkUserEmail', user);

    return user;
}

// Delete user function
function deleteUser(email) {

    // Check if user exists
    if (checkUserEmail(email)) {
        // Retrieve users
        const usersArray = getUsers();

        // Return list of users that exclude the given user
        const filteredUsers = usersArray.filter((user) => user.email !== email);
        console.log("email given in deleteUser param", email);
        console.log("filteredEmails in deleteUsers", filteredUsers);

        // Set users to filteredUsers
        setUsers(filteredUsers);

        // If user was the one currently logged in. If so then show login page
        if (filteredUsers.some(user => user.isLoggedIn === true)) {
            console.log('Successfully deleted user');
        } else {
            hideAuthRoute();
            populateEmailList();
            console.log('Successfully deleted user, returning to login section');
        }
    } else {
        // Circuit break if user doesn't exist
        return new Error("User doesn't exist!");
    }
}

// Function to log out everyone (General helper function to reduce DRY)
function logOutUsers() {
    let users = getUsers();
    const loggedOut = users.map((user) => ({ ...user, isLoggedIn: false }));

    setUsers(loggedOut);
    hideAuthRoute();
}

// Function to log in user
function logInUser(email) {

    // Tracking variable to check if user login is successful
    let isValid = false;

    // Get all users
    let users = getUsers();

    const changedUsers = users.map((userObj) => {
        if (userObj.email === email) {
            // Set isValid to true so that changes are made
            isValid = true;
            return { ...userObj, isLoggedIn: true };
        } else {
            return userObj;
        }
    });

    if (isValid) {
        // Log out users so we can log in new user
        logOutUsers();
        setUsers(changedUsers);
        showAuthRoute();
    } else {
        return new Error('Unsuccessful Login');
    }

}

// Function to submit email to users and login variables in local storage
function emailSubmit(email) {

    // First check if email is valid regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const isValid = emailRegex.test(email);

    if (isValid) {
        // Check if user account already exists in local storage
        const doesUserExist = checkUserEmail(email);

        // If user exists then return error saying user already exists, else create and login user
        if (doesUserExist) {
            console.log('User already exists:', doesUserExist);
            return new Error('User with this email already exists');
        } else {
            console.log('doesUserExist', doesUserExist);
            // Log out users so we can log in new user
            logOutUsers();

            let currentUsers = getUsers();
            const newUser = { email: email, isLoggedIn: true, savedImages: [] };
            currentUsers.push(newUser);

            setUsers(currentUsers);
            // If successful create then login and show auth route
            showAuthRoute();
        }
    } else {
        return new Error('Invalid email');
    }


}

// Function to add image to logged in user's imageArray
function addImage(id) {
    // Get users so I can filter and modify list
    const users = getUsers();
    const changedUsers = users.map((userObj) => {
        if (userObj.isLoggedIn === true) {
            // Check if user already has image id already saved
            const hasImage = userObj.savedImages.find((img) => img === id);
            if (hasImage) {
                return {
                    ...userObj,
                    savedImages: [...userObj.savedImages, id]
                };
            } else {
                console.log('User has already saved that image!');
                return userObj;
            }
        } else {
            return userObj;
        }
    });
    setUsers(changedUsers);
}

// Function to append login accounts to sign in section
const $userList = $('#user-list');
$userList.on("click", '.delete-btn', function (event) {
    // Prevent the event from bubbling up to the li
    event.stopPropagation();
    const userEmail = $(this).siblings('span').text();
    deleteUser(userEmail);
})

// Function to log in user on li click
$userList.on("click", 'li', function () {
    // This will fire when the li (parent) is clicked on. Login the related user
    const userEmail = $(this).children('span').text();
    logInUser(userEmail);
});

// Populate existing users 
function populateEmailList() {
    const users = getUsers();
    console.log('users in populateEmailList', users);
    if (users && users.length > 0) {
        console.log('populating user list');
        let userListEl = $('<ul></ul>');
        users.forEach((user, i) => {
            userListEl.append(`<li id="user-${i}"><span>${user.email}</span><button class="delete-btn">Delete</button></li>`);
        })
        $userList.html(userListEl);
    } else {
        console.log('returning empty user list');
        $userList.html(`<p id='empty-list'>There are no email collections currently stored.. Please create a new user!</p>`);
    }
}

// Function to check if someone is logged in on page load
function loginCheck() {
    // Get users
    const users = getUsers();

    const loggedInUsers = users.filter(user => user.isLoggedIn === true);
    if (loggedInUsers.length === 1) {
        showAuthRoute();
    } else
        if (loggedInUsers.length === 0) {
            console.log('No logged in user');
            hideAuthRoute();
        } else {
            console.log('Error: there are multiple logged in users, logging off');
            logOutUsers();
            hideAuthRoute();
        }
}

// Call on page load
populateEmailList();
loginCheck();

// Function get user's profile and render their images
// - Need function to get images
// - To generate images
// - To append images to .image-gallery
function getUserGallery() {

}

const $mainImg = $('#main-img');
// Get size of parent container to generate image dimensions
const px = { h: 1920, w: 1080 };

// Function can be used to generate random image ids or retrieve specific ones from array
async function generateUrl(index) {
    if (index !== undefined) {
        const img = imgArray[index];
        // Regex to retrieve portion of url
        const regex = /^(https:\/\/fastly\.picsum\.photos\/id\/\d+)/;
        const validUrl = img.match(regex);
        if (validUrl) {
            url = `${validUrl[1]}/${px.h}/${px.w}.webp`;
        } else {
            throw new Error(`No match found`);
        }
        console.log('preexisting URL: ', url);
        return url;
    } else {
        // Generate random url from picsum
        let response = await fetch(`https://picsum.photos/${px.h}/${px.w}.webp`);
        if (!response.ok) {
            throw new Error(`Error fetching new image: ${response.status}`);
        }
        console.log('url', response.url);
        return response.url;
    }
}

// Variable to store array of random generated images
const imgArray = []
let index = 0;

// Function to populate or change main image. Pass param to use image from array
async function setMainImage(change) {
    let url;
    // If you pass a param (i.e. to view a previously generated image)
    if (change) {
        // If param is forward then generate a new image and attach it to array as well
        if (change == "next") {
            index++;
            // If index is longer than imgArray then generate a new image
            if (index >= imgArray.length) {
                url = await generateUrl();
                imgArray.push(url);
            } else {
                // Get the URL of imgArray[index]
                url = await generateUrl(index);
            }

        } else if (change == "previous") {
            // If index is lower than 0 then generate new id and unshift it onto imgArray
            if (index <= 0) {
                // Don't change index if it's at 0
                url = await generateUrl();
                imgArray.unshift(url);
            } else {
                index--;
                url = await generateUrl(index);
            }
        }
    } else {
        // Generate random image when no param passed (Usually on window load)
        if (index <= 1) {
            console.log('index is 0');
        } else {
            index++;
        }
        url = await generateUrl();
        imgArray.push(url);
    }
    $mainImg.css('background-image', `url(${url})`);
}

setMainImage();

// Button functionality to change main image
$nextBtn = $('#next');
$previousBtn = $('#previous');
// Generate new image and send it to image array
$nextBtn.click(() => {
    console.log('next button clicked');
    setMainImage('next');
})
$previousBtn.click(() => {
    console.log('previous button clicked');
    setMainImage('previous');
})

// Function to generateImgUrl 

