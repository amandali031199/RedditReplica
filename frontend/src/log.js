//export function to create a login form
function initLog(apiUrl){
  const authToken = localStorage.getItem('auth');
  const searchPosts = JSON.parse(localStorage.getItem('searchPosts'));
  const root = document.getElementById("root");
  const loginForm = createLoginForm(apiUrl);
  root.appendChild(loginForm);
}
export default initLog;

//create a login form and its fields
function createLoginForm(apiUrl){
	const div = document.createElement("div"); //general div
	div.id = "loginForm";
	div.className = "form-popup";
	let form = document.createElement("form"); //content div
	form.className = "form-container";
	form.id = "log-form-container";
	const h1 = document.createElement("h1"); //title
	h1.textContent = "Login";
	h1.style.textAlign = "center";
	const labelUsername = createLabel("username", "Username"); //username title
	const textUsername = createText("text","Enter Username", "username"); //textbox
	const labelPass = createLabel("psw", "Password"); //password title
  //password textbox should not show what user is typing
	const textPass = createText("password", "Enter Password", "psw");
	const submit = createFormButton("submit", "btn", "Login"); //enter button
  //when clicked send to API to check if is a user
	submit.onclick = function(event) {authenticate(form, "failAuth",
									  "Sorry, your username or password is wrong.",
									  "loginForm", textPass, textUsername, apiUrl)};
	const close = createFormButton("button", "btn cancel", "Close"); //close
  //close popup when clicked
	close.onclick = function() {closeForm(div, "log-form-container")};
  //append to form
  form = appendForm(h1, labelUsername, textUsername, labelPass, textPass, submit,
                    close, form);
  div.appendChild(form);
	return div;
}

//given a form, append titles and fields
function appendForm(h1, labelUsername, textUsername, labelPass, textPass, submit,
                    close, form){
  form.appendChild(h1);
  form.appendChild(labelUsername);
  form.appendChild(textUsername);
  form.appendChild(labelPass);
  form.appendChild(textPass);
  form.appendChild(submit);
  form.appendChild(close);
  return form;
}

//with API check if logged in details are from a user
function authenticate(form, id, msg, div, pass, username, apiUrl){
	if (document.getElementById(id) != undefined){
    //if error already showing, remove
		form.removeChild(document.getElementById(id));
	}
	const p = document.createElement("p"); //create error message
	p.textContent = msg
  p.className = "failAuth"
	p.id = id;
	const inputs = {
 				         "username": username.value,
 	 			         "password": pass.value
				         }
	const param	= {
				        method: 'POST',
				        body:JSON.stringify(inputs),
				        headers: {
				  			         'Content-Type': 'application/json'
				                 }
	              }
  logToBackend(apiUrl, param, username, pass, form, p); //fetch API
	if (username.value != "" && pass.value != ""){
    //if not all filled, don't submit
	  event.preventDefault();
	}
}

//send to API to check details
function logToBackend(apiUrl, param, username, pass, form, p){
  fetch(apiUrl + '/auth/login/', param)
  .then(function(response){
    console.log(response.statusText);
    if (response.statusText == "FORBIDDEN"){ //invalid password/username
      //show error message
      if (username.value != "" && pass.value != "") form.appendChild(p);
      console.log("yes");
    }
    return response.json();
  })
  .then(function(responseAsJson){ //otherwise details are right
    localStorage.clear(); //clear past token
    localStorage.setItem('auth', responseAsJson.token); //set token
    localStorage.setItem('user', username.value); //set username
    if (responseAsJson.token != undefined){
      document.location.reload(true); //reload the page to show user feed
    }
  })
}

//close a form
function closeForm(div, id){
	div.style.display = "none"; //turn invisible
	const p = document.getElementById("failAuth"); // any error messages
	const form = document.getElementById(id);
	if (p != undefined) {
		form.removeChild(p); //delete any error messages
	}
  //allow clicking on background again
	const hiddenDiv = document.getElementById("disableDiv");
	if (hiddenDiv != undefined) hiddenDiv.style.display = "none";
}

//create a form/popup button
function createFormButton(type, className, text){
	const button = document.createElement("button");
	button.type = type;
	button.className = className;
	button.textContent = text;
	return button;
}

//create a textfield for input
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

//create an email field for input, checks if string is valid email format
function createEmail(type, placeholder, inputName){
	const text = document.createElement("input");
	text.type = type;
	text.placeholder = placeholder;
	text.name = inputName;
	text.required = true;
  //emails must match this pattern to allow
	text.pattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$";
	console.log(text);
	text.className = "formbox";
	return text;
}

//create a title labelling each text field
function createLabel(htmlFor, text){
	const label = document.createElement("label");
	label.htmlFor = htmlFor;
	const b = document.createElement("b");
	b.textContent = text;
	label.appendChild(b);
	return label;
}
