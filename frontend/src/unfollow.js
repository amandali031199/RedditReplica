//export function to send to API who to unfollow
function sendUnfollow(content, apiUrl, authToken, username){
	const param	= {
			          method: 'PUT',
			          headers:{
				                 'Authorization': `Token ${authToken}`,
				                 'Content-Type': 'application/json',
			                  }
	              }
	fetch(apiUrl + '/user/unfollow/?username=' + username, param)
	.then(function(response) {
 		if (response.statusText == "BAD REQUEST"){
			//tried to unfollow self
 			if (document.getElementById('follow-error') != undefined) {
        content.removeChild(document.getElementById('follow-error'));
				//remove prev error message
      }
 			const msg = document.createElement("p");
 			msg.textContent = "You can't unfollow yourself";
 			msg.style.textAlign = "center";
 			msg.id = "follow-error";
 			content.appendChild(msg); //display error message
 		} else {
 			document.location.reload(true); //reload to show new information 
 		}
	})
	.catch(function(error) {
  	console.log('Looks like there was a problem: \n', error);
	});
}
export default sendUnfollow;
