//import scripts
import createFeedSearch from './displaySearch.js';
import infiniteScroll from './scroll.js';
import createUpvotes from './upvotes.js';
import createContent from './content.js';

//export function which generates the feed of posts when logged in
function createFeed(ul, apiUrl, authToken, p, n, searchPosts){
	if (searchPosts != null) { //has searched for something, grab specific posts
    ul = createFeedSearch(ul, searchPosts, authToken, apiUrl);
  } else { //grab all posts in user feed
    const param = {
			method: 'GET',
			headers:{
				'Authorization': `Token ${authToken}`,
				'Content-Type': 'application/json',
			}
		}
    ul = getFeedFromBack(apiUrl, p, n, param, ul, authToken); //fetch API
  }
	return ul;
}
export default createFeed;

//append to current empty feed with public posts 
function appendPublic(ul, apiUrl, authToken){
	//grab all posts in public feed
    ul = getFeedFromBackPublic(apiUrl, ul, authToken); //fetch API
	return ul;
}


//get public feed through API
function getFeedFromBackPublic(apiUrl, ul, authToken){	
	fetch(apiUrl + "/post/public")
	.then(function(response) {
    if (!response.ok) throw Error(response.statusText);
    return response.json();
    })
    .then(function(responseAsJsonPublic) {
    //sort posts from latest first
    	responseAsJsonPublic.posts.sort((a,b) => parseInt(convertTime(b.meta.published))
                - parseInt(convertTime(a.meta.published)));
      	for (let post of responseAsJsonPublic.posts){
       		ul = createFeedPosts(post, ul, authToken, apiUrl); //create posts
       	}
    })
    return ul;
    
}

//given a user, grab all posts from their feed from API
function getFeedFromBack(apiUrl, p, n, param, ul, authToken){
  fetch(apiUrl + "/user/feed?p=" + p + "&n=" + n, param)
  .then(function(response) {
    if (!response.ok) throw Error(response.statusText);
    return response.json();
  })
  .then(function(responseAsJson) {
    //sort posts from latest first
    responseAsJson.posts.sort((a,b) => parseInt(convertTime(b.meta.published))
                - parseInt(convertTime(a.meta.published)));
    for (let post of responseAsJson.posts){
       ul = createFeedPosts(post, ul, authToken, apiUrl); //create posts
    }
    if (responseAsJson.posts.length == 0){ //if no more posts
      if (document.getElementById("end-of-post") != undefined){
        ul.removeChild(document.getElementById("end-of-post"));
      }
      const h5 = document.createElement("h5"); //display end of post message
      h5.className = "end-of-post";
      h5.id = "end-of-post";
      ul = endOfFeed(p, ul, h5, apiUrl, authToken); //end of post msg
      return ul;
    } else { //infinite scroll and append next page to current page
      infiniteScroll(ul, apiUrl, authToken, p, n);
    }
  })
  .catch(function(error) {
    console.log('Looks like there was a problem: \n', error);
  });
  return ul;
}


//decide end of post message 
function endOfFeed(p, ul, h5, apiUrl, authToken){
	if (p == "0"){ //no posts to show at all
    h5.textContent =
        "Follow more users to see more posts! Here are the 20 most popular posts"
    ul.appendChild(h5);
   	ul = appendPublic(ul, apiUrl, authToken);
	} else { //reached end of feed
	  	h5.textContent = "You have reached the end of your feed." 
	  	ul.appendChild(h5);
	}
	return ul;
}

//create posts to append to list of posts
function createFeedPosts(post, ul, authToken, apiUrl){
  let li = document.createElement("li");
  li.className = "post";
  li.setAttribute("data-id-post", "");
  let vote = createVote(post, authToken, apiUrl); //create vote div
  let content = createContent(post, authToken, apiUrl); //create content div
  li.appendChild(vote);
  li.appendChild(content);
  ul.appendChild(li);
  return ul;
}

//create vote div on side of post
function createVote(post, authToken, apiUrl){
  let vote = document.createElement("div"); //general div
  vote.className = "votepriv";
  vote.setAttribute("data-id-upvotes", "");
  //create text displaying num of upvotes
  let votepara = document.createElement("p");
  let up = document.createElement("i"); //button to upvote post
  votepara.className  = "votepara";
  votepara.textContent = post.meta.upvotes.length + " upvotes";
  up.className = "up";
  up.onclick = function() {votepara = //if clicked, upvote post
                           upvotePost(votepara,post,authToken,apiUrl)};
  let down = document.createElement("i");
  down.className = "down"; //button to remove upvote for post
  down.onclick = function() {votepara = //if clicked, remove upvote
                             downvotePost(votepara,post,authToken,apiUrl)};
  //create list of upvotes popup
  let form = createUpvotes(votepara, post, apiUrl, authToken);
  let hiddenDiv = document.getElementById("disableDiv");
  votepara.onclick = function() { hiddenDiv.style.display = "block";
  /*prevent clicking on background*/ form.style.display = "block"};
  vote.prepend(up); //add to general vote div
  vote.append(votepara);
  vote.appendChild(down);
  return vote;
}

//given post, send to API which post to upvote
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
		});
	return votepara;
}

//given post, grab info from API again for live update
function updateVote(votepara, post, authToken, apiUrl){
	const param = {
			method: 'GET',
			headers:{
				'Authorization': `Token ${authToken}`,
				'Content-Type': 'application/json',
			}
		}
	fetch(apiUrl + "/post/?id=" + post.id, param) //grab from API
	.then(function(response){
		if (!response.ok) throw Error(response.statusText);
		return response.json();
	})
	.then(function(responseAsJson){
		votepara.textContent = responseAsJson.meta.upvotes.length + " upvotes";
    //create a popup again with new information
		let form = createUpvotes(votepara, responseAsJson, apiUrl, authToken);
		let hiddenDiv = document.getElementById("disableDiv");
		votepara.onclick = function() { hiddenDiv.style.display = "block";
    /*prevent clicking on background*/form.style.display = "block"};
	})
		.catch(function(error) {
  	console.log('Looks like there was a problem: \n', error);
	});
	return votepara;
}

//given post, send to API which post to remove upvote for
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

//convert time given in API to readable format
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
