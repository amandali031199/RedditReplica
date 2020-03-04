//given a post to delete, send this info to API
function sendDelete(apiUrl, authToken, id){
	const param = {
					      method: 'DELETE',
								headers:{
									      'Authorization': `Token ${authToken}`,
												'Content-Type': 'application/json',
											  }
								}
	fetch(apiUrl + '/post/?id=' + id, param) //send to API
	.then(function(response){
		if (response.ok) document.location.reload(true); //reload the page
	})
}
export default sendDelete;
