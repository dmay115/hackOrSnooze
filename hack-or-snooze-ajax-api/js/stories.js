"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
  putFavoritesOnPage();
  putUserStoriesOnPage()
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  const hostName = story.getHostName(story);
  console.log(hostName)
  return $(`
      <li id="${story.storyId}" class="in-main">
        <button id="${story.storyId}" class="favorite-false">&#x2661;</button>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
      <div class="line"></div>
    `);
}

function generateFavoritesMarkup(story) {
  const url = new URL(story.url)
  const hostName = url.hostname
  return $(`
      <li id="${story.storyId}" class="in-favorites">
        <button id="${story.storyId}" class="favorite-true">&#x2665;</button>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
      <div class="line"></div>
    `);
};

function generateUserStoriesMarkup(story) {
  const url = new URL(story.url)
  const hostName = url.hostname
  return $(`
      <li id="${story.storyId}">
        <button id="${story.storyId}" class="delete-story">&#x2716;</button>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
      <div class="line"></div>
    `);
}

async function submitStory(evt) {
  evt.preventDefault();
  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();
  const username = currentUser.username
  const input = { title, url, author, username };
  await storyList.addStory(currentUser, input);
}

$submitButton.on('click', submitStory);

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function putFavoritesOnPage() {
  const favList = currentUser.favorites
  $favoritesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of favList) {
    const res = await axios({
      url: `${BASE_URL}/stories/${story.storyId}`,
      method: "GET",
    });
    const $story = generateFavoritesMarkup(res.data.story);
    $favoritesList.append($story);
  }

  $favoritesList.show();
}

async function putUserStoriesOnPage() {
  const userStoriesList = currentUser.ownStories
  $userStoriesList.empty();
  // loop through all of our stories and generate HTML for them
      if (userStoriesList) {
        for (let story of userStoriesList) {
        const res = await axios({
          url: `${BASE_URL}/stories/${story.storyId}`,
          method: "GET",
        });
        const $story = generateUserStoriesMarkup(res.data.story);
        $userStoriesList.append($story);
    }

    $userStoriesList.show();
  }
}
