//when user enters in search bar, grab all the posts which contain query
function searchQuery(value, authToken, apiUrl){
	localStorage.removeItem('searchPosts'); //remove previous search
	let array = [];
	const param = {
			           method: 'GET',
			           headers:{
				                  'Authorization': `Token ${authToken}`,
				                  'Content-Type': 'application/json',
			                   }
		            }
	fetch(apiUrl + "/user/feed?p=0&n=10000", param) //get all posts
	.then(function(response){
		if (!response.ok) throw Error(response.statusText);
		return response.json();
	})
	.then(function(responseAsJson){
		for (let posts of responseAsJson.posts){
			//if post title, subseddit or post desc contains query words
			if (posts.title.toLowerCase().includes(value.toLowerCase()) == true ||
          posts.text.toLowerCase().includes(value.toLowerCase()) == true ||
          posts.meta.subseddit.toLowerCase().includes(value.toLowerCase())
          == true){
				array.push(posts.id); //save their id
			}
		}
		localStorage.setItem("searchPosts", JSON.stringify(array)); //store results
		document.location.reload(true); //reload page to get search results
	})
	.catch(function(error) {
  	console.log('Looks like there was a problem: \n', error);
	});
}
export default searchQuery;
