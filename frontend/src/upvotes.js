//import scripts
import createUserPage from './userpage.js';

//export function which creates a popup form of user who upvoted this post
function createUpvotes(vote, post, apiUrl, authToken){ 
	const array = createPopup("upvotes" + post.id,
                            "User who have upvoted this post");
	const div = array[0]; //general div
  let content = array[1]; //content
	for (let id of post.meta.upvotes){//fetch /user/ data from id
		const param = {
			             method: 'GET',
			             headers:{
				                    'Authorization': `Token ${authToken}`,
				                    'Content-Type': 'application/json',
			                     }
		               }
    content = getFromBack(apiUrl, id, param, content, div, authToken);
		//fetch data from API
	}
	if (post.meta.upvotes.length == 0){ //if no upvotes
		let msg = document.createElement("p");
		msg.textContent = "There are no upvotes for this post yet."
		msg.style.textAlign = "center";
		content.appendChild(msg); //show message
	}
	return div;
}
export default createUpvotes;

//fetch data about user from API given id
function getFromBack(apiUrl, id, param, content, div, authToken){
  fetch(apiUrl + '/user/?id=' + id, param)
  .then(function(response){
    if (!response.ok) throw Error(response.statusText);
    return response.json();
  })
  .then(function(responseAsJson){ //create <p> with names of users
    let p = document.createElement("p"); //name
    p.style.textAlign = "center";
    let span = document.createElement("span"); //username
    span.style.color = "var(--reddit-blue)";
    span.textContent = " @" + responseAsJson.username;
    span.style.fontSize = "small";
    span.className = "listAll"; //make username clickable
    span.onclick = function(){ let form = createUserPage(div,
                   responseAsJson.username, authToken, apiUrl);
                   openEdit(div, form)};
									 //when clicked, opens popup showing user page
    p.textContent = responseAsJson.name;
    p.appendChild(span);
    p.style.fontSize = "small";
    content.appendChild(p);

  })
  .catch(function(error){
    console.log('Looks like there was a problem: \n', error);
  });
  return content;
}

//create a popup
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

//open a form by closing previous form
function openEdit(div, form){
	div.style.display = "none";
	form.style.display = "block";
}
