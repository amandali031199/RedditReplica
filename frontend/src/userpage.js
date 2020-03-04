//import scripts
import createUpdateForm from './update.js';
import sendDelete from './delete.js';
import sendFollow from './follow.js';
import sendUnfollow from './unfollow.js';

//export function that creates a popup showing user info
function createUserPage(div,username, authToken, apiUrl){
	const array = createPopup(username, "");
	const userDiv = array[0]; //general div
	let content = array[1]; //content div
	let close = array[2];
	close.onclick = function() {closeEdit(div,userDiv)};
	const param = {
			          method: 'GET',
			          headers:{
				                'Authorization': `Token ${authToken}`,
				                'Content-Type': 'application/json',
			                   }
		            }
	fetch(apiUrl + "/user/?username=" + username, param)
	//gets user info based off username
	.then(function(response) {
 		if (!response.ok) throw Error(response.statusText);
		return response.json();
	})
	.then(function(responseAsJson){
		console.log(responseAsJson);
		content = userPageContent(userDiv, content, responseAsJson, apiUrl,
              authToken); //create content to go on popup
	})
	.catch(function(error){
		console.log('Looks like there was a problem: \n', error);
	});
	return userDiv;
}
export default createUserPage;

//create a popup
function createPopup(id, text){
	const div = document.createElement("div"); //general div
	div.id = id;
	div.setAttribute("ss-container", "");
	div.className = "form-popup";
	let content = document.createElement("div"); //content div
	content.className = "form-container";
	content.setAttribute("ss-container", "");
	const h1 = document.createElement("h1"); //title
	h1.textContent = text;
	h1.style.textAlign = "center";
	const close = document.createElement("a"); //close button
	close.href = "#" + div.id;
	close.className = "close";
	close.onclick = function() {closeForm(div,content)};
	content.appendChild(close);
	content.appendChild(h1);
	div.appendChild(content);
	const root = document.getElementById("root");
	root.appendChild(div);
	return [div, content, close];
}

//close a form
function closeForm(div, id){
	console.log(div);
	div.style.display = "none";
	const p = document.getElementById("failAuth");
	const form = document.getElementById(id);
	if (p != undefined) { //remove error messages
		form.removeChild(p);
	}
	//allow clicking on background again
	const hiddenDiv = document.getElementById("disableDiv");
	if (hiddenDiv != undefined) hiddenDiv.style.display = "none";
}

//close a popup  by opening the previous popup
function closeEdit(div, editDiv){
	if (div != ""){
		div.style.display = "block";
	} else {
		//allow clicking on background again if no previous popup opened
		let hiddenDiv = document.getElementById("disableDiv");
		hiddenDiv.style.display = "none";
	}
	editDiv.style.display = "none";
}

//create info to display on user page
function userPageContent(div, content, responseAsJson, apiUrl, authToken){
	//append username, name, email
	content = appendInfo(content, responseAsJson);
	const table = document.createElement("table");
	const tr1 = createFirstRow(); //display titles of stat
	//display numbers of stat
	const tr2 = createSecRow(responseAsJson, apiUrl, authToken, true, div);
	table.appendChild(tr1);
	table.appendChild(tr2);
	content.appendChild(table);
	const follow = createFormButton("submit", "follow", "Follow");
	follow.onclick = function() { sendFollow(content, apiUrl, authToken,
                                responseAsJson.username)};
																//when clicked, logged in user follows this user
	const unfollow = createFormButton("submit", "unfollow", "Unfollow");
	unfollow.onclick = function() {sendUnfollow(content, apiUrl, authToken,
                                 responseAsJson.username)};
														//when clicked, logged in user unfollows this user
	content.appendChild(follow);
	content.appendChild(unfollow);
	return content;
}

//append username name and email to user page
function appendInfo(content, responseAsJson){
	//create username
	const username = document.createElement("h1"); //username
	username.style.textAlign = "center";
	username.textContent = "@" + responseAsJson.username;
	content.appendChild(username);
	//create name
	const n = document.createElement("h2"); //name
	n.style.textAlign = "center";
	n.style.color = "var(--reddit-blue)";
	n.textContent = responseAsJson.name;
	content.appendChild(n);
	//create email
	const email = document.createElement("p"); //email
	email.style.textAlign = "center";
	email.style.fontSize = "small";
	email.textContent = "Email: " + responseAsJson.email;
	content.appendChild(email);
	return content;
}

//create a form button
function createFormButton(type, className, text){
	const button = document.createElement("button");
	button.type = type;
	button.className = className;
	button.textContent = text;
	return button;
}

//create row of titles for stats
function createFirstRow(){
	const tr1 = document.createElement("tr");
	const th1 = document.createElement("th");
	th1.textContent = "Posts";
	const th2 = document.createElement("th");
	th2.textContent = "Upvotes";
	const th3 = document.createElement("th");
	th3.textContent = "Followers";
	const th4 = document.createElement("th");
	th4.textContent = "Following";
	tr1.appendChild(th1);
	tr1.appendChild(th2);
	tr1.appendChild(th3);
	tr1.appendChild(th4);
	return tr1;
}

//open a popup by closing previous popup
function openEdit(div, form){
	div.style.display = "none";
	form.style.display = "block";
}

//create a second row containing nums of stats
function createSecRow(responseAsJson, apiUrl, authToken, userpage, div){
	let tr2 = document.createElement("tr"); //second row
	const posts = document.createElement("td") //first col
	if (userpage == true){ //if on others user page
		posts.className = "listAll"; //posts is linkable
		posts.onclick = function() { let allPosts = createAllPosts(div,
                    responseAsJson, apiUrl, authToken);
                    openEdit(div, allPosts)};
										//when clicked links to all posts made by user
	}
	posts.textContent = responseAsJson.posts.length;
	let upvotes = document.createElement("td"); //second col
	if (responseAsJson.posts.length == 0){ //no posts
			upvotes.textContent = "0";
	} else { //given all posts, calc and sum up total upvotes
		upvotes = fetchUpvotes(upvotes, responseAsJson, apiUrl, authToken);
	}
	const followers = document.createElement("td"); //third col
	followers.textContent = responseAsJson.followed_num;
	const following = document.createElement("td"); //fourth col
	following.textContent = responseAsJson.following.length;
	if (userpage == false){ //if on own user page
		following.className = "listAll"; //following is linkable
		following.onclick = function() { let allFollowing = createAllFollowing(div,
                        responseAsJson, apiUrl, authToken);
                        openEdit(div, allFollowing)};
												//when clicked, shows popup of all users followed
	}
	tr2 = appendTR2(posts, upvotes, followers, following, tr2); //append to table
	return tr2;
}

//append these fields to table row
function appendTR2(posts, upvotes, followers, following, tr2){
	tr2.appendChild(posts);
	tr2.appendChild(upvotes);
	tr2.appendChild(followers);
	tr2.appendChild(following);
	return tr2;
}

//create popup showing all users followed
function createAllFollowing(div, responseAsJson, apiUrl, authToken){
	const array = createPopup("allfollowing", "Everyone you follow"); //popup has to be enlarged
	const allDiv = array[0];
	let content = array[1];
	const close = array[2];
	close.onclick = function(){ openEdit(allDiv, div)};
	for (let id of responseAsJson.following){ //fetch all ids in following
	   let param = {
		              method: 'GET',
		              headers:{
				                  'Authorization': `Token ${authToken}`,
				                  'Content-Type': 'application/json',
		                      }
	               }
    getFollowFromBack(apiUrl, id, param, allDiv, content, authToken);
		//grab their names and usernames from id
	}
	if (responseAsJson.following.length == 0){ //not following people
		const msg = document.createElement("p");
		msg.textContent = "This user is not following anyone";
		content.appendChild(msg);
	}
	return allDiv;
}

//get from API given id, users names and usernames
function getFollowFromBack (apiUrl, id, param, allDiv, content, authToken){
  fetch(apiUrl + '/user/?id=' + id, param)
   .then(function(response) {
      if (!response.ok) throw Error(response.statusText);
      return response.json();
   })
   .then(function(responseAsJson){
       content = createListFollowing(allDiv, content, responseAsJson,
                 authToken, apiUrl);
   })
   .catch(function(error) {
       console.log('Looks like there was a problem: \n', error);
   })
}


//create a list of users given their username and name
function createListFollowing(allDiv, content, responseAsJson, authToken, apiUrl){
	let p = document.createElement("p"); //name
	p.style.textAlign = "center";
	let span = document.createElement("span"); //username
	span.style.color = "var(--reddit-blue)";
	span.textContent = " @" + responseAsJson.username;
	span.style.fontSize = "small";
	span.className = "listAll"; //make each username linkable
	span.onclick = function(){ let form = createUserPage(allDiv,
                 responseAsJson.username, authToken, apiUrl);
                 openEdit(allDiv, form)}; //when clicked opens their user page
	p.textContent = responseAsJson.name;
	p.appendChild(span);
	p.style.fontSize = "small";
	content.appendChild(p);
	return content
}

//given all posts, calc and sum up the total number of upvotes
function fetchUpvotes(upvotes, responseAsJson, apiUrl, authToken){
	let num_up = "0";
	for (let post of responseAsJson.posts){ //for all posts
		const param = {
			             method: 'GET',
			             headers:{
				                    'Authorization': `Token ${authToken}`,
				                    'Content-Type': 'application/json',
			                      }
		              }
		fetch(apiUrl + "/post/?id=" + post, param)//grab their post object from API
		.then(function(response) {
 			if (!response.ok) throw Error(response.statusText);
			return response.json();
		})
		.then(function(responseAsJson){ //sum up their number of upvotes
			num_up = parseInt(num_up) + parseInt(responseAsJson.meta.upvotes.length);
			upvotes.textContent = num_up.toString();
		})
		.catch(function(error){
			console.log('Looks like there was a problem: \n', error);
		});
	}
	return upvotes;
}

//create a popup displaying all posts by user
function createAllPosts(div, responseAsJsonOld, apiUrl, authToken){
	const array = createPopup("allposts", "All Posts");
	const allDiv = array[0];
	console.log("inside");
	let content = array[1];
	const close = array[2];
	close.onclick = function(){ openEdit(allDiv, div)};
	for (let id of responseAsJsonOld.posts){ //fetch posts
	   let param = {
		              method: 'GET',
		              headers:{
				                  'Authorization': `Token ${authToken}`,
				                  'Content-Type': 'application/json',
		                      }
	                }
	   allPostsSendBackend(apiUrl, id, param, allDiv, authToken, content,
                         responseAsJsonOld); //get all posts from id
	}
	if (responseAsJsonOld.posts.length == 0){
		const msg = document.createElement("p");
		msg.textContent = "This user has not posted anything yet";
		content.appendChild(msg);
	}
	return allDiv;
}

//get all posts from ids
function allPostsSendBackend(apiUrl, id, param, allDiv, authToken, content,
                             responseAsJsonOld){
  fetch(apiUrl + '/post/?id=' + id, param)
  .then(function(response) {
    if (!response.ok) throw Error(response.statusText);
    return response.json();
  })
  .then(function(responseAsJson){
    content = createPreview(allDiv,apiUrl, authToken, content,responseAsJson,
                            responseAsJsonOld); //create a mini feed in popup
  })
  .catch(function(error) {
    console.log('Looks like there was a problem: \n', error);
  })
}

//create a  mini feed of posts in post  popup
function createPreview(allDiv,apiUrl, authToken, content, responseAsJson,
                       responseAsJsonOld){
	const username = localStorage.getItem('user');
	const li = document.createElement("li"); //general div
	li.setAttribute("data-id-post", "");
	li.className = "post";
	let div = document.createElement("div");
	div.className = "content";
  div = attachToDiv(div, responseAsJson); //append subseddit, time , desc and title
	if (responseAsJson.image != null){ //if theres an image append image
		let image = document.createElement("img");
		image.className = "post-image";
		image.src = "data:image/jpeg;base64," + responseAsJson.image;
		div.appendChild(image);
	}
	li.appendChild(div);
	li.appendChild(document.createElement("br"));
	content.appendChild(li);
	if (username == responseAsJsonOld.username){
		//if own own user page, can delete or update these posts
		const update = createFormButton("submit", "unfollow", "Update");
		update.onclick = function(){ let form = createUpdateForm(allDiv, apiUrl, authToken,
                     responseAsJson.text, responseAsJson.title,
                     responseAsJson.id);
                     openEdit(allDiv,form)};
		const deletePost = createFormButton("submit", "follow", "Delete");
		deletePost.onclick = function(){sendDelete(apiUrl, authToken,
                         responseAsJson.id)};
		div.appendChild(deletePost);
		div.appendChild(update);
	}
	return content;
}


//create and append title, subsedit, time and desc to popup mini feed
function attachToDiv(div, responseAsJson){
	//create subseddit
  const subseddit = document.createElement("p");
  subseddit.className = "post-subseddit";
  subseddit.textContent = "/s/" + responseAsJson.meta.subseddit;
	//create time
  const time = document.createElement("p");
  time.className = "post-author";
  time.setAttribute("data-id-author", "");
  time.textContent = " Posted at " + convertTime(responseAsJson.meta.published);
	//create title
  const title = document.createElement("h4");
  title.className = "post-title alt-text";
  title.setAttribute("data-id-title", "");
  title.textContent = responseAsJson.title;
	//create desc
  const desc = document.createElement("p");
  desc.className = "post-desc";
  desc.textContent = responseAsJson.text;
	//append all
  div.appendChild(subseddit);
  div.appendChild(time);
  div.appendChild(title);
  div.appendChild(desc);
  return div;
}

//convert time in API to readable format
function convertTime(timestamp){
	let date = new Date(timestamp*1000); //turn to milliseconds
	let seconds = date.getSeconds();
	let minutes = date.getMinutes();
	let hours = date.getHours();
	let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug',
				        'Sep','Oct','Nov','Dec'];
 	let year = date.getFullYear();
 	let month = months[date.getMonth()];
 	let datenum = date.getDate();
	return datenum + " " + month + " " + year + " " + hours + ":" + minutes
		     + "." + seconds;
}
