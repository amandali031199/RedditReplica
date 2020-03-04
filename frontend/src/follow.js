//send to API the current user and who to follow
function sendFollow(content, apiUrl, authToken, username){
	const param	= {
			          method: 'PUT',
			          headers:{
				                 'Authorization': `Token ${authToken}`,
				                 'Content-Type': 'application/json',
			          }
	}
	fetch(apiUrl + '/user/follow/?username=' + username, param) //send to API
	.then(function(response) {
 		if (response.statusText == "BAD REQUEST"){ //tried to follow self
 			console.log("yes");
 			if (document.getElementById('follow-error') != undefined) { //remove error
        content.removeChild(document.getElementById('follow-error'));
      }
 			const msg = document.createElement("p"); //create an error message
 			msg.id = "follow-error";
 			msg.textContent = "You can't follow yourself";
 			msg.style.textAlign = "center";
 			content.appendChild(msg); //display error message
 		} else {
			//else worked, reload page to display new info
 			document.location.reload(true);
 		}
	})
	.catch(function(error) {
  	console.log('Looks like there was a problem: \n', error);
	});
}
export default sendFollow;
