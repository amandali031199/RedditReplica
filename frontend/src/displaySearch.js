//import scripts
import createContent from './content.js';
import createUpvotes from './upvotes.js';

//export function which given a search query displays post containing query
function createFeedSearch(ul, searchPosts, authToken, apiUrl){
	for (let id of searchPosts){ //for all posts found with query
		const param	= {
			             method: 'GET',
				           headers:{
				                    'Authorization': `Token ${authToken}`,
				                    'Content-Type': 'application/json',
			                     }
			            }
		ul = getPostFromBackend(ul, apiUrl, id, param, authToken); //fetch API
	}
		if (searchPosts.length == 0){ //if found nothing
			const msg = document.createElement("h5"); //display error message
			msg.textContent = "Sorry, we couldn't find anything with your search";
			msg.className = "end-of-post";
			ul.appendChild(msg);
		} else {
			let end = document.createElement("h5"); //if scrolled to end of feed
			end.textContent =
              "Here are all the posts on your feed generated from your search";
			end.className = "end-of-post"; //display end of feed message
			ul.appendChild(end);
		}
		return ul;
}
export default createFeedSearch;

//given an id, send to API and get post
function getPostFromBackend(ul, apiUrl, id, param, authToken){
  fetch(apiUrl + '/post/?id=' + id, param)
  .then(function(response) {
    if (!response.ok) throw Error(response.statusText);
    return response.json();
  })
  .then(function(responseAsJson) {
		//create a post div/li (outlined)
    let li = document.createElement("li");
    li.className = "post";
    li.setAttribute("data-id-post", "");
		//create vote side bar
    let vote = createVote(responseAsJson, authToken, apiUrl);
		//create post information
    let content = createContent(responseAsJson, authToken, apiUrl);
		//apend to ul/feed
    li.appendChild(vote);
    li.appendChild(content);
    ul.appendChild(li);
  })
  .catch(function(error) {
  console.log('Looks like there was a problem: \n', error);
  });
  return ul;
}

//given a post, create vote div
function createVote(post, authToken, apiUrl){
  let vote = document.createElement("div"); //overall vote div
  vote.className = "votepriv";
  vote.setAttribute("data-id-upvotes", "");
	//create text displaying number of upvotes
  let votepara = document.createElement("p");
  let up = document.createElement("i"); //button to upvote post
  votepara.className  = "votepara";
  votepara.textContent = post.meta.upvotes.length + " upvotes";
  up.className = "up";
  up.onclick = function() {votepara = //if button clicked, upvote post
                           upvotePost(votepara,post,authToken,apiUrl)};
  let down = document.createElement("i"); //button to downvote post
  down.className = "down";
  down.onclick = function() {votepara = //if button clicked, downvote post
                             downvotePost(votepara,post,authToken,apiUrl)};
  let form = createUpvotes(votepara, post, apiUrl, authToken);
  let hiddenDiv = document.getElementById("disableDiv");
  votepara.onclick = function() { hiddenDiv.style.display = "block";
  /*prevent clicking on background*/ form.style.display = "block"};
  vote.prepend(up); //append to vote div
  vote.append(votepara);
  vote.appendChild(down);
  return vote;
}

//send to API which vote to upvote
function upvotePost(votepara,post,authToken,apiUrl){
	const param = {
			method: 'PUT',
			headers:{
				'Authorization': `Token ${authToken}`,
				'Content-Type': 'application/json',
			}
		}
		fetch(apiUrl + "/post/vote/?id=" + post.id, param) //send to API
		.then(function(response) {
 		if (!response.ok) throw Error(response.statusText);
			votepara = updateVote(votepara, post, authToken, apiUrl); //live update
			console.log(votepara);

		});
	return votepara;
}

//given post, grab from API again and get new count of upvotes (live update)
function updateVote(votepara, post, authToken, apiUrl){
	const param = {
			method: 'GET',
			headers:{
				'Authorization': `Token ${authToken}`,
				'Content-Type': 'application/json',
			}
		}
	fetch(apiUrl + "/post/?id=" + post.id, param) //send to API
	.then(function(response){
		if (!response.ok) throw Error(response.statusText);
		return response.json();
	})
	.then(function(responseAsJson){ //grab new information
		votepara.textContent = responseAsJson.meta.upvotes.length + " upvotes";
		console.log(votepara.textContent);
		//create upvotes popup displaying this new information
		let form = createUpvotes(votepara, responseAsJson, apiUrl, authToken);
		let hiddenDiv = document.getElementById("disableDiv");
		votepara.onclick = function() { hiddenDiv.style.display = "block";
    /*prevent clicking on background*/ form.style.display = "block"};
	})
		.catch(function(error) {
  	console.log('Looks like there was a problem: \n', error);
	});
	return votepara;
}

//send to API which vote to remove the upvote for
function downvotePost(votepara,post,authToken,apiUrl){ //something wrong here
	const param = {
			method: 'DELETE',
			headers:{
				'Authorization': `Token ${authToken}`,
				'Content-Type': 'application/json',
			}
		}
		fetch(apiUrl + "/post/vote/?id=" + post.id, param) //send to API
		.then(function(response) {
 		if (!response.ok) throw Error(response.statusText);
		console.log(post.id);
		votepara = updateVote(votepara, post, authToken, apiUrl); //live update
		console.log(votepara);
		});
		return votepara;
}
