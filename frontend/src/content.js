//import scripts
import createUserPage from './userpage.js';

//exported function which creates list of posts on feed
function createContent(post, authToken, apiUrl){
  //sort posts by time, latest first
	post.comments.sort((a,b) => parseInt(convertTime(b.published))
								  - parseInt(convertTime(a.published)));
  //create separate div containing each post (outlined)
	let content = document.createElement("div");
	content.className = "content";
  //append line saying @subseddit Posted by author at time
  content = appendToContentTop(content, post, authToken, apiUrl);
  content = appendTitleDesc(content, post); //append Title and Desc
	if (post.image != null){  //append image if there is one
		let image = document.createElement("img");
		image.className = "post-image";
		image.src = "data:image/jpeg;base64," + post.image; //change base64 to url
		content.appendChild(image);
	}
  content = appendComment(content, post, authToken, apiUrl); //append comments
	return content;
}
export default createContent;

//creates subseddit, author and time to append to top of post
function appendToContentTop(content, post, authToken, apiUrl){
  //create subseddit
  let subseddit = document.createElement("p");
  subseddit.className = "post-subseddit";
  subseddit.textContent = "/s/" + post.meta.subseddit;
  //create author
  let author = document.createElement("p");
  author.className = "post-author";
  author.setAttribute("data-id-author", "");
  let span = document.createElement("span");
  span.textContent = post.meta.author;
  author.textContent = " Posted by @";
  author.appendChild(span);
  //create timestamp
  let time = document.createElement("p");
  time.className = "post-time";
  time.textContent = " at " + convertTime(post.meta.published);
  //if logged in, user can click on author name and see their user page
  if (authToken != null) {
    let userPage = createUserPage("",post.meta.author, authToken, apiUrl);
    let hiddenDiv = document.getElementById("disableDiv");
    span.onclick = function(){hiddenDiv.style.display = "block";
    /*can't click on background*/ userPage.style.display = "block"};
  }
  if (authToken != null) span.className = "listAll";
  //add to content
  content.appendChild(subseddit);
  content.appendChild(author);
  content.appendChild(time);
  return content;
}

//turn time into a readable format
function convertTime(timestamp){
	let date = new Date(timestamp*1000); //turn into milliseconds
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

//append title and desc to content
function appendTitleDesc(content, post){
  //create title
  let title = document.createElement("h4");
  title.setAttribute("data-id-title", "");
  title.className = "post-title alt-text";
  title.textContent = post.title;
  //create desc
  let desc = document.createElement("p");
  desc.className = "post-desc";
  desc.textContent = post.text;
  //append to content
  content.appendChild(title);
  content.appendChild(desc);
  return content;
}

//append comment to content
function appendComment(content, post, authToken, apiUrl){
  //create comment
  let comment = document.createElement("p");
  if (post.comments != undefined){
    comment.textContent = post.comments.length + " comments";
  } else comment.textContent = "0 comments";
  content.appendChild(comment);
  //if logged in, can click comments and opens popup showing list of comments
  if (authToken != null){
    let form = createComments(comment, post, authToken);
    let hiddenDiv = document.getElementById("disableDiv");
    comment.onclick = function() { hiddenDiv.style.display = "block";
    /*prevent clicking on background*/ form.style.display = "block"};
    comment.className = "post-comment-priv";
    //create comment textbox to write new comments if logged in
    let newComment = createText("text","Write a comment...", "newComment");
    newComment.className = "commentbox";
    //create comment button to submit comment
    let postComment = createFormButton("submit", "postComment", "Comment");
    postComment.onclick = function(event){
        comment = postNewComment(comment,newComment, apiUrl, authToken, post)};
    //append to content
    content.appendChild(newComment);
    content.appendChild(postComment);
  } else { //only display num of comments if not logged in
    comment.className = "post-comment";
  }
  return content;
}

//create a button used in a popup/form
function createFormButton(type, className, text){
	const button = document.createElement("button");
	button.type = type;
	button.className = className;
	button.textContent = text;
	return button;
}

//create a textbox that users can type in
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

//create a popup showing all the comments on a post
function createComments(comment, post, authToken, apiUrl){
	const array = createPopup("comments" + post.id, "Comments");
	const div = array[0]; //get the overall div
	const content = array[1]; //get the content section
	if (post.comments.length > 0){ //if there are comments
		for (let comment of post.comments){ //foreach comment
      //create author
			let author = document.createElement("p");
			author.className = "post-author";
      author.textContent = " Posted by @" + comment.author + " at ";
      //create time
			let time = document.createElement("p");
			time.className = "post-time";
			time.textContent = convertTime(comment.published);
      //create speech bubble holding the comment
			let comm = document.createElement("p");
			comm.className = "speech-bubble";
			comm.textContent = comment.comment;
			author.style.fontSize = time.style.fontSize =
                              comm.style.fontSize = "small";
      //append to popup
      content.appendChild(author);
      content.appendChild(time);
			content.appendChild(comm);
		}
	} else { //if there are no comments tell user
		let msg = document.createElement("p");
		msg.textContent = "There are no comments for this post yet."
		content.appendChild(msg);
	}
	return div;
}

//create a popup form
function createPopup(id, text){
	const div = document.createElement("div");
	div.id = id; //overall div
	div.setAttribute("ss-container", "");
	div.className = "form-popup";
	const content = document.createElement("div"); //contains form content
	content.className = "form-container";
	content.setAttribute("ss-container", "");
	const h1 = document.createElement("h1"); //header title for form
	h1.textContent = text;
	h1.style.textAlign = "center";
	const close = document.createElement("a"); //close x button at right top
	close.href = "#" + div.id;
	close.className = "close";
	close.onclick = function() {closeForm(div,content)};
	content.appendChild(close);
	content.appendChild(h1);
	div.appendChild(content);
	const root = document.getElementById("root");
	root.appendChild(div); //add this form to the root
	return [div, content, close];
}

//send new comments to API
function postNewComment(comment,newComment, apiUrl, authToken, post){
	event.preventDefault(); //stop reload of page to allow live update
	if (newComment.value != ""){
		const inputs = {
				            "comment":newComment.value
		               }
		const param = {
			            method:'PUT',
			            body: JSON.stringify(inputs),
			            headers: {
				                   'Authorization': `Token ${authToken}`,
				                   'Content-Type': 'application/json',
			                     }
		              }
		fetch(apiUrl +'/post/comment?id=' + post.id, param) //post to API
		.then(function(response){
			if (!response.ok) throw Error(response.statusText);
 			console.log(response.json());
 			comment = updateComments(comment, post, authToken, apiUrl); //live update
 			newComment.value = "";
		});
	}
	console.log(newComment);
	return comment;
}

//live update of comments in popup and number increases
function updateComments(comment, post, authToken, apiUrl){
	const param = {
			          method: 'GET',
			          headers:{
				                'Authorization': `Token ${authToken}`,
				                'Content-Type': 'application/json',
			                   }
		            }
	fetch(apiUrl + "/post/?id=" + post.id, param) //grab comments under post again
	.then(function(response){
		if (!response.ok) throw Error(response.statusText);
		return response.json();
	})
	.then(function(responseAsJson){
		comment.textContent = responseAsJson.comments.length + " comments"; //length
		responseAsJson.comments.sort((a,b) => parseInt(convertTime(b.published))
								  - parseInt(convertTime(a.published))); //sort comments
   //create a popup displaying all the comments including updates
		let form = createComments(comment, responseAsJson, authToken, apiUrl);
		let hiddenDiv = document.getElementById("disableDiv");
		comment.onclick = function() { hiddenDiv.style.display = "block";
    /*prevent clicking on background*/ form.style.display = "block"};
	})
		.catch(function(error) {
  	console.log('Looks like there was a problem: \n', error);
	});
	return comment;
}

//close a form/popup and open the last openned item
function closeForm(div, id){
	div.style.display = "none"; //hide popup
	const p = document.getElementById("failAuth");
	const form = document.getElementById(id);
	if (p != undefined) { //remove any error messages
		form.removeChild(p);
	}
  //allow clicking on background
	const hiddenDiv = document.getElementById("disableDiv");
	if (hiddenDiv != undefined) hiddenDiv.style.display = "none";
}
