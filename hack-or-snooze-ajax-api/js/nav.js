"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

function navSubmitStory(evt) {
  console.debug("navSubmitStory", evt)
  hidePageComponents();
  $submitForm.show();
}

$body.on("click", "#submit-story-link", navSubmitStory);

function navFavoriteStories(evt) {
  hidePageComponents();
  putFavoritesOnPage()
  $userFavorites.show();
  if (currentUser.favorites.length == []){
    $favoritesList.html("No Favorite Stories!")
  }
}

$body.on("click", "#user-favorites-link", navFavoriteStories)

function navUserStories(evt) {
  hidePageComponents();
  putUserStoriesOnPage();
  $userStories.show();
  if (currentUser.ownStories.length === 0){
    $userStoriesList.html("No Stories Submitted!")
  }
}

$body.on("click", "#user-stories-link", navUserStories)
/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}
