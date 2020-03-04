//export function to create feed for public page
function createPosts(ul, apiUrl, authToken, searchPosts){
	 fetch(apiUrl + "/post/public")
	.then(function(response) {
 		if (!response.ok) throw Error(response.statusText);
		return response.json();
	})
	.then(function(responseAsJson) {
		//sort posts from latest first
		responseAsJson.posts.sort((a,b) => parseInt(convertTime(b.meta.published))
								  - parseInt(convertTime(a.meta.published)));
		for (let post of responseAsJson.posts){ //foreach post
			//create general div (outlined) for each post
			let li = document.createElement("li");
			li.className = "post";
			li.setAttribute("data-id-post", "");
			let vote = document.createElement("div");
			vote.className = "vote";
			vote.setAttribute("data-id-upvotes", ""); //displays num of upvotes
      vote.textContent = post.meta.upvotes.length + " upvotes";
			let content = createContent(post, authToken, apiUrl); //create actual post
			li.appendChild(vote);
			li.appendChild(content);
			ul.appendChild(li);
		}
	})
	.catch(function(error) {
  	console.log('Looks like there was a problem: \n', error);
	});
	return ul;
}
export default createPosts;

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

//create each post information
function createContent(post, authToken, apiUrl){
	post.comments.sort((a,b) => parseInt(convertTime(b.published))
								  - parseInt(convertTime(a.published))); //sort comments
	let content = document.createElement("div");
	content.className = "content";
  content = appendToContent(content, post); //create subseddit, author and time
	//create title
	let title = document.createElement("h4");
	title.setAttribute("data-id-title", "");
	title.className = "post-title alt-text";
	title.textContent = post.title;
	content.appendChild(title);
	//create desc
	let desc = document.createElement("p");
	desc.className = "post-desc";
	desc.textContent = post.text;
	content.appendChild(desc);
	//create num of comments
	let comment = document.createElement("p");
  comment.textContent = post.comments.length + " comments";
	//create image if there is one
	if (post.image != null){
		let image = document.createElement("img");
		image.className = "post-image";
		image.src = "data:image/jpeg;base64," + post.image;
		content.appendChild(image);
	}
	content.appendChild(comment);
	comment.className = "post-comment";
	return content;
}

//creates subseddit author and time and appends it to content
function appendToContent(content, post){
	//create subseddit
  let subseddit = document.createElement("p");
  subseddit.className = "post-subseddit";
  subseddit.textContent = "/s/" + post.meta.subseddit;
	content.appendChild(subseddit);
	//create author
  let author = document.createElement("p");
  author.className = "post-author";
  author.setAttribute("data-id-author", "");
  let span = document.createElement("span");
	span.textContent = post.meta.author;
	author.textContent = " Posted by @";
	author.appendChild(span);
	content.appendChild(author);
	//create time
  let time = document.createElement("p");
  time.className = "post-time";
  time.textContent = " at " + convertTime(post.meta.published);
  content.appendChild(time);
  return content;
}
