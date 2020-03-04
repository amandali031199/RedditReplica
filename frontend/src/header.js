//import scripts
import searchQuery from './search.js';
import profile from './profile.js';

//export function which creates the buttons in header nav bar
function createUl(authToken, apiUrl, searchPosts){
  let ul = document.createElement("ul");
  ul.className = "nav";
  const liSearch = document.createElement("li"); //for search bar
  const liLog = document.createElement("li"); //for log button
  const liSign = document.createElement("li"); //for sign button
  liSearch.className = liLog.className = liSign.className = "nav-item";
  //create search bar
  const input = document.createElement("input");
  input.id = "search";
  input.setAttribute("data-id-search", "");
  input.placeholder = "Search Seddit";
  input.type = "search";
  //if click enter in search bar, get queries and find posts
  input.addEventListener('keyup', function onEvent(e) {
    if (e.keyCode === 13) { //Enter in input field
    	searchQuery(e.target.value, authToken, apiUrl);
    }
	});
 //create profile, login, clear, signup and logout buttons
  ul = createNav(searchPosts,authToken, apiUrl, liSearch, input, liLog,
                 liSign, ul);
  return ul;
}
export default createUl;

//create profile, login, clear, signup and logout buttons to append to nav bar
function createNav(searchPosts, authToken, apiUrl, liSearch, input, liLog,
                   liSign, ul){
  const refresh = createButton("data-id-refresh", "button button-third",
                               "Clear Search", "clear"); //clears search
	refresh.onclick = function(){localStorage.removeItem("searchPosts");
                              document.location.reload(true)};
                              //reload page if clicked
  const buttonLog = createButton("data-id-login", "button button-primary",
                                 "Log In", "login"); //login
  const buttonSign = createButton("data-id-signup", "button button-secondary",
                                  "Sign Up", "signup");//sign up
  const buttonOut =  createButton("data-id-logout", "button button-secondary",
                                  "Log Out", "logout"); //logout
  const buttonMe = createButton("data-id-profile", "button button-primary",
                                "Profile", "profile");//profile
  const hiddenDiv = document.getElementById("disableDiv");
  //open forms when login or signup is clicked + prevent clicking on background
  buttonLog.onclick = function() {hiddenDiv.style.display = "block";
                                  openForm("loginForm")};
  buttonSign.onclick = function() {hiddenDiv.style.display = "block";
                                   openForm("signForm")};
  buttonOut.onclick = function() {logOut()}; //logout when clicked
  if (authToken != null){ //if logged in, create profile button and display
  	let me = profile(authToken, apiUrl);
	buttonMe.onclick = function() {hiddenDiv.style.display = "block";
                                 me.style.display = "block"};
  }
  //append all buttons to nav depending if logged in
  ul = appendToNav(liSearch, input, authToken, refresh, liLog, buttonLog,
                   buttonSign, liSign, buttonMe, buttonOut, ul, searchPosts);
  return ul;
}

//append all buttons to nav depending if logged in
function appendToNav(liSearch, input, authToken, refresh, liLog, buttonLog,
                     buttonSign, liSign, buttonMe, buttonOut, ul, searchPosts){
  liSearch.appendChild(input);
  //if not logged in, can't search
  if (authToken == null) {input.disabled = true;}
  if (searchPosts != null) liSearch.appendChild(refresh); //if has searched
  if (authToken == null) liLog.appendChild(buttonLog); //not logged in
  if (authToken == null) liSign.appendChild(buttonSign); //not logged in
  else { //logged in
    liLog.appendChild(buttonMe);
    liSign.appendChild(buttonOut);
  }
  ul.appendChild(liSearch);
  ul.appendChild(liLog);
  ul.appendChild(liSign);
  return ul;
}

//create a general button
function createButton(att, className, text, id){
  const button = document.createElement("button");
  button.setAttribute(att, "");
 	button.className = className;
  button.textContent = text;
  button.id = id;
  return button;
}

//clear local storage and log out, returning to public page
function logOut(){
	localStorage.clear();
	document.location.reload(true);
}

//open a popup
function openForm(id){
	//close any open forms before
	if (document.getElementById("signForm").style.display == "block"){
		closeForm(document.getElementById("signForm"), "sign-form-container");
	}
	if (document.getElementById("loginForm").style.display == "block"){
		closeForm(document.getElementById("loginForm"), "log-form-container");
	}
	document.getElementById(id).style.display = "block";
}
