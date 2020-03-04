/**
 * Written by A. Hinds with Z. Afzal 2018 for UNSW CSE.
 *
 * Updated 2019.
 */

// import your own scripts here.
import initSign from './sign.js';
import initLog from './log.js';
import createUl from './header.js';
import createPosts from './posts.js';
import createFeed from './feed.js';
import createPostForm from './postNew.js';
// your app must take an apiUrl as an argument --
// this will allow us to verify your apps behaviour with
// different datasets. //apiUrl:
function initApp(apiUrl) {
  // your app initialisation goes here
  const authToken = localStorage.getItem('auth'); //grab authentication token
  const searchPosts = JSON.parse(localStorage.getItem('searchPosts'));
  //grab search query if any
  const root = document.getElementById("root"); //grab root from html
  const hiddenDiv = document.createElement("div");
  //load div to hide background when popups are open
  document.body.appendChild(hiddenDiv);
  hiddenDiv.id = "disableDiv";

  initLog(apiUrl); //load hidden login form
  initSign(apiUrl); //load hidden signup form

  const header = createHeader(authToken, apiUrl, searchPosts); //init header
  const main = createMain(apiUrl, authToken, searchPosts); //init main
  root.appendChild(header);
  root.appendChild(main);
}

export default initApp;

//creates the header/nav bar on the top of the page
function createHeader(authToken, apiUrl, searchPosts){
  const header = document.createElement("header");
  //style overall header div
  header.className = "banner";
  header.id = "nav";
  const h1 = document.createElement("h1");
  h1.id = "logo" ;
  h1.className = "flex-center";
  h1.textContent = "Seddit";
  header.appendChild(h1);

  //init the buttons and search bar to appear in nav bar
  const ul = createUl(authToken, apiUrl, searchPosts);
  header.appendChild(ul);
  return header;
}

//creates the main body feed section of the page
function createMain(apiUrl, authToken, searchPosts){
  //style main
	const main = document.createElement("main");
	main.role = "main";
  //style ul containing posts
	let ul = document.createElement("ul");
	ul.setAttribute("data-id-feed", "");
	ul.id = "feed";
  //style feed
	let feed = document.createElement("div");
	feed.className = "feed-header";
  //style header saying popular posts or posts from your feed
	const h3 = document.createElement("h3");
	h3.className = "feed-title alt-text";
	if (authToken == null) h3.textContent = "Popular posts";
	else h3.textContent = "Posts from your feed";
	feed.appendChild(h3);
  //add POST button to feed if logged in
  feed = appendPostToFeed(authToken, apiUrl, feed)
	ul.appendChild(feed);
	if (authToken == null){ //not logged in
		ul = createPosts(ul, apiUrl, authToken, searchPosts); //create actual posts
	} else { //create actual posts from user feed if logged in
		ul = createFeed(ul, apiUrl, authToken, 0, 5, searchPosts );
	}
	main.appendChild(ul);
	return main;
}

//creates a POST button and appends it to feed if logged in 
function appendPostToFeed(authToken, apiUrl, feed){
  if (authToken != null) { //if logged in
    //create POST button
    const button = document.createElement("button");
    button.className = "button button-secondary";
    button.textContent = "Post";
    //display post popup if button is clicked
    const form = createPostForm(apiUrl, authToken);
    const hiddenDiv = document.getElementById("disableDiv");
    button.onclick = function(){hiddenDiv.style.display = "block";
                                form.style.display = "block"};
    feed.appendChild(button);
  }
  return feed;
}
