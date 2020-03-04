//import scripts
import createUserPage from './userpage.js';
import createUpdateForm from './update.js';
import sendDelete from './delete.js';

//export function which opens popup showing profile page
function profile(authToken, apiUrl){
	const array = createPopup("profile", "My Profile");
	const div = array[0];
	let content = array[1];
	const param = {
		             method: 'GET',
		             headers:{
				                  'Authorization': `Token ${authToken}`,
				                  'Content-Type': 'application/json',
			                   }
		            }
	fetch(apiUrl + "/user/", param)//defaults to logged in if id not supplied
	.then(function(response) {
 		if (!response.ok) throw Error(response.statusText);
		return response.json();
	})
	.then(function(responseAsJson){
		console.log(responseAsJson);
		//create info on pop up
		content = profileContent(div, content, responseAsJson, apiUrl, authToken);
	})
	.catch(function(error){
		console.log('Looks like there was a problem: \n', error);
	});
	console.log(div);
	return div;
}
export default profile;

//creates generic popup
function createPopup(id, text){
	const div = document.createElement("div"); //general div
	div.id = id;
	div.setAttribute("ss-container", "");
	div.className = "form-popup";
	const content = document.createElement("div"); //content div
	content.className = "form-container";
	content.setAttribute("ss-container", "");
	const h1 = document.createElement("h1"); //title
	h1.textContent = text;
	h1.style.textAlign = "center";
	const close = document.createElement("a"); //close button
	close.href = "#" + div.id;
	close.className = "close";
	//when clicked closes current and opens previous div
	close.onclick = function() {closeForm(div,content)};
	content.appendChild(close);
	content.appendChild(h1);
	div.appendChild(content);
	const root = document.getElementById("root");
	root.appendChild(div); //append to the root
	return [div, content, close];
}

//closes form
function closeForm(div, id){
	console.log(div);
	div.style.display = "none";
	const p = document.getElementById("failAuth");
	const form = document.getElementById(id);
	if (p != undefined) { //removes any error messages
		form.removeChild(p);
	}
	//allow clicking on background again
	const hiddenDiv = document.getElementById("disableDiv");
	if (hiddenDiv != undefined) hiddenDiv.style.display = "none";
}

//creates information on popup for profile
function profileContent(div, content, responseAsJson, apiUrl, authToken){
	//display username and then name
	content = displayNameUser(responseAsJson, div, authToken, apiUrl, content);
	const email = document.createElement("p"); //display email
	email.style.textAlign = "center";
	email.style.fontSize = "small";
	email.textContent = "Email: " + responseAsJson.email;
	content.appendChild(email);
	const table = document.createElement("table"); //display stats
	const tr1 = createFirstRow(); //display titles of stats
	//display numbers of stats
	const tr2 = createSecRow(responseAsJson, apiUrl, authToken, false, div);
	const edit = createFormButton("submit","edit", "Edit"); //display edit button
	//when clicked opens an edit popup
	edit.onclick = function(){let form = createEdit(div, responseAsJson, apiUrl,
                            authToken);
                            openEdit(div, form)};
	table.appendChild(tr1);
	table.appendChild(tr2);
	content.appendChild(table);
	content.appendChild(edit);
	return content;
}

//display username and then name
function displayNameUser(responseAsJson, div, authToken, apiUrl, content){
	const username = document.createElement("h1");
	username.style.textAlign = "center"; //display username
	username.textContent = "@" + responseAsJson.username;
	username.className = "listAll"; //make username linkable to public profile
	username.onclick = function(){let userPage = createUserPage(div,
										 responseAsJson.username, authToken, apiUrl);
										 openEdit(div, userPage)};
	content.appendChild(username);
	const n = document.createElement("h2"); //display name
	n.style.textAlign = "center";
	n.style.color = "var(--reddit-blue)";
	n.textContent = responseAsJson.name;
	content.appendChild(n);
	return content;
}

//create edit pop up
function createEdit(div, responseAsJson, apiUrl, authToken){
	const array = createPopup("edit", "");
	const editDiv = array[0];
	let content = array[1];
	let close = array[2];
	close.onclick = function() {closeEdit(div,editDiv)};
	//create title
	const h1 = document.createElement("h1"); //display title
	h1.textContent = "Update Profile";
	h1.style.textAlign = "center";
	//create warning message
	const p = document.createElement("p"); //create warning
	p.textContent =
        "Leaving a field empty will result in no changes to that information";
	p.style.textAlign = "center";
	content.appendChild(h1);
	content.appendChild(p);
	//create fields for input
	const labelEmail = createLabel("email", "New Email");
	const textEmail = createEmail("email", "Enter new email", "email");
	const labelName = createLabel("name", "New Name");
	const textName = createText("text", "Enter new name", "name");
	const labelPass = createLabel("password", "New Password");
	const textPass = createText("password", "Enter new password", "password");
	const edit = createFormButton("submit", "edit", "Save Changes");
	edit.onclick = function(event){content = saveChanges(content,responseAsJson,
                 textEmail.value, textName.value, textPass.value, apiUrl,
                 authToken)}; //send to backend new info
	content = appendContent(labelEmail, textEmail, labelName, textName, labelPass,
                         textPass, edit, content);
	return editDiv;
}

//append all fields to the edit pop up
function appendContent(labelEmail, textEmail, labelName, textName, labelPass,
                       textPass, edit, content){
  content.appendChild(labelEmail);
  content.appendChild(textEmail);
  content.appendChild(labelName);
  content.appendChild(textName);
  content.appendChild(labelPass);
  content.appendChild(textPass);
  content.appendChild(edit);
  return content
}

//send to API new information
function saveChanges(content, oldInfo, email, newName, pass, apiUrl, authToken){
	//if fields are blank, use the open information e.g. no update
	if (email == "") email = oldInfo.email;
	if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/.test(email) == false){
		event.preventDefault(); //if email isnt valid send error message to display
		content = invalidEmail(content);
		return content;
	}
	if (newName == "") newName = oldInfo.name;
	let inputs = {};
	if (pass == ""){ //if pass is empty dont include in inputs
		inputs = {
			       "email": email,
			       "name": newName
		         }
	} else {
		inputs = {
			       "email": email,
			       "name": newName,
			       "password": pass
		         }
	}
	const param = {
		            method: 'PUT',
                body:JSON.stringify(inputs),
		            headers:{
				                 'Authorization': `Token ${authToken}`,
				                 'Content-Type': 'application/json',
		                     }
	              }
  saveToBackend(apiUrl, param); //send to API
}

//send to API the editted information
function saveToBackend(apiUrl, param){
  fetch(apiUrl + '/user/', param)
  .then(function(response) {
    if (!response.ok) throw Error(response.statusText);
    document.location.reload(true); //reload page to display new info
  })
  .catch(function(error) {
      console.log('Looks like there was a problem: \n', error);
  })
}

//if input for email is invalid, create error message
function invalidEmail(content){
	if (document.getElementById("invalid-email") != undefined) {
		//already showing message, remove it
    content.removeChild(document.getElementById("invalid-email"));
  }
	if (document.getElementById("failAuth") != undefined){
    content.removeChild(document.getElementById("failAuth"));
  }
	const msg = document.createElement("p"); //create error message
	msg.textContent = "Please enter a valid email";
	msg.style.textAlign = "center";
	msg.style.fontSize = "small";
	msg.id = "invalid-email"
	content.appendChild(msg);
	return content;
}

//create a text field
function createText(type, placeholder, inputName){
	const text = document.createElement("input");
	text.type = type;
	text.placeholder = placeholder;
	text.name = inputName;
	text.className = "formbox";
	text.required = true;
	console.log(text);
	return text;
}

//create email field only accepts strings matching valid email
function createEmail(type, placeholder, inputName){
	const text = document.createElement("input");
	text.type = type;
	text.placeholder = placeholder;
	text.name = inputName;
	text.required = true;
	//text must match this pattern
	text.pattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$";
	console.log(text);
	text.className = "formbox";
	return text;
}

//create title labelling text field
function createLabel(htmlFor, text){
	const label = document.createElement("label");
	label.htmlFor = htmlFor;
	const b = document.createElement("b");
	b.textContent = text;
	label.appendChild(b);
	return label;
}

//close a form
function closeEdit(div, editDiv){
	if (div != ""){
		div.style.display = "block";
	} else { //allow clicking on background again
		let hiddenDiv = document.getElementById("disableDiv");
		hiddenDiv.style.display = "none";
	}
	editDiv.style.display = "none";
}

//create second row displaying numbers for stats
function createSecRow(responseAsJson, apiUrl, authToken, userpage, div){
	let tr2 = document.createElement("tr"); //second row
	const posts = document.createElement("td") //first col
	if (userpage == true){ //if on others user page
		posts.className = "listAll"; //make posts clickable
		posts.onclick = function() { let allPosts = createAllPosts(div,
                    responseAsJson, apiUrl, authToken);
                    openEdit(div, allPosts)};
										//when clicked display popup of posts
	}
	posts.textContent = responseAsJson.posts.length; //num of posts made
	let upvotes = document.createElement("td"); //second col
	if (responseAsJson.posts.length == 0){
			upvotes.textContent = "0";
	} else { //fetch all post to calc and sum up how many upvotes total
		upvotes = fetchUpvotes(upvotes, responseAsJson, apiUrl, authToken);
	}
	const followers = document.createElement("td"); //third col
	followers.textContent = responseAsJson.followed_num;
	const following = document.createElement("td"); //fourth col
	following.textContent = responseAsJson.following.length;
	if (userpage == false){ //if on own profile page
		following.className = "listAll"; //make following clickable
		following.onclick = function() { let allFollowing = createAllFollowing(div,
                        responseAsJson, apiUrl, authToken);
                        openEdit(div, allFollowing)};
												//when clicked, opens popup showing all users followed
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
		update.onclick = function(){ let form = createUpdateForm(apiUrl, authToken,
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

//create form popup  button
function createFormButton(type, className, text){
	const button = document.createElement("button");
	button.type = type;
	button.className = className;
	button.textContent = text;
	return button;
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

//create a row in table displaying titles of stats
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

//open a popup by closing the prev popup
function openEdit(div, form){
	div.style.display = "none";
	form.style.display = "block";
}
