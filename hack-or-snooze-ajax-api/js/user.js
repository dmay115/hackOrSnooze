"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

async function updateUserInfo(user) {
  const token = user.loginToken
  const res = await axios({
    url: `${BASE_URL}/users/${user.username}`,
    method: "GET",
    params: { token },
  });
  user.ownStories = res.data.user.stories.map(s => new Story(s));
}


async function setFavorite(evt) {
  evt.preventDefault();
  const $clicked = $(evt.target);
  const $story = $clicked.closest("li.in-main");
  favoriteIconSwitch(evt.target.className, $clicked);
  const $cloneStory = $story.clone();
  const storyID = evt.target.id;
  // $favoritesList.append($cloneStory);
  // $cloneStory.removeClass("in-main").addClass("in-favorites");
  await addFavorite(currentUser, storyID);
}

$(document).on("click", '.favorite-false', setFavorite);

async function unsetFavorite(evt) {
  evt.preventDefault();
  const $clicked = $(evt.target);
  const $story = $clicked.closest("li.in-favorites");
  const storyID = evt.target.id;
  favoriteIconSwitch(evt.target.className, $clicked);
  // $story.remove();
  await removeFavorite(currentUser, storyID);
}

$(document).on("click", '.favorite-true', unsetFavorite);

function favoriteIconSwitch(className, target) {
  if (className == "favorite-true") {
    target.html("&#x2661;");
    target.removeClass("favorite-true");
    target.addClass("favorite-false");
  } else {
    target.html("&#x2665;");
    target.removeClass("favorite-false");
    target.addClass("favorite-true");
  }
}

async function addFavorite(user, storyID) {
  const token = user.loginToken;
    const res = await axios.post(`${BASE_URL}/users/${user.username}/favorites/${storyID}`, 
    {
      "token": token,
    })
    user.favorites = res.data.user.favorites.map(s => new Story(s));
    return res
}

async function removeFavorite(user, storyID) {
  const token = user.loginToken;
    const res = await axios.delete(`${BASE_URL}/users/${user.username}/favorites/${storyID}`, {
    data: {
      "token": token,
    }
  })
    user.favorites = res.data.user.favorites.map(s => new Story(s));
    return res
}

async function deleteClick(evt) {
  evt.preventDefault();
  const $clicked = $(evt.target);
  const $story = $clicked.closest("li");
  const storyID = evt.target.id;
  const res = confirm("Delete Story?")
  if (res) {
    $story.remove();
    await deleteStory(currentUser, storyID);
  }
}

$(document).on("click", '.delete-story', deleteClick);

async function deleteStory(user, storyID) {
    const token = user.loginToken;
      const res = await axios.delete(`${BASE_URL}/stories/${storyID}`, {
      data: {
        "token": token,
      }
    })
    updateUserInfo(user)
      return res
}
/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  $allStoriesList.show();

  updateNavOnLogin();
}
