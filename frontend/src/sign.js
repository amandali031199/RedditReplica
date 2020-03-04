
//export function which creates a sign up form
function initSign(apiUrl){
  const authToken = localStorage.getItem('auth');
  const searchPosts = JSON.parse(localStorage.getItem('searchPosts'));
  const root = document.getElementById("root");
  const signForm = createSignForm(apiUrl);
  root.appendChild(signForm);
}
export default initSign;

//create a sign up form with fields
function createSignForm(apiUrl){
	const div = document.createElement("div");
	div.id = "signForm";
	div.className = "form-popup"; //general div
	let form = document.createElement("form");
	form.className = "form-container";
	form.id = "sign-form-container";  //content div
	const h1 = document.createElement("h1"); //title
	h1.textContent = "Sign Up";
	h1.style.textAlign = "center";
	const labelUsername = createLabel("username", "Username");
	const textUsername = createText("text","Enter Username", "username");
	const labelPass = createLabel("psw", "Password");
	const textPass = createText("password", "Enter Password", "psw");
	const labelEmail = createLabel("username", "Email");
	const textEmail = createEmail("email", "Enter Email", "email");
	const labelName = createLabel("username", "Name");
	const textName = createText("text", "Enter Name", "name");
	const submit = createFormButton("submit", "btn", "Sign Up");
  //when submit is clicked, check username is not taken with API
	submit.onclick = function(event) {form = signAuthenticate(form, "failAuth",
									  "Sorry, this username is taken", "signForm", textPass,
                    textUsername, apiUrl,textEmail, textName)};
	const close = createFormButton("button", "btn cancel", "Cancel"); //close form
	close.onclick = function() {closeForm(div, "sign-form-container")};
  //append all fields to form
  form = attachToForm(form, h1, labelUsername,textUsername, labelName, textName,
                      labelEmail, textEmail, labelPass, textPass, submit, close);
	div.appendChild(form);
	return div;
}

//append all fields to form
function attachToForm(form, h1, labelUsername, textUsername, labelName, textName,
                      labelEmail, textEmail, labelPass, textPass, submit, close){
  form.appendChild(h1);
  form.appendChild(labelUsername);
  form.appendChild(textUsername);
  form.appendChild(labelName);
  form.appendChild(textName);
  form.appendChild(labelEmail);
  form.appendChild(textEmail);
  form.appendChild(labelPass);
  form.appendChild(textPass);
  form.appendChild(submit);
  form.appendChild(close);
  return form;
}

//close a form
function closeForm(div, id){
	console.log(div);
	div.style.display = "none";
	const p = document.getElementById("failAuth");
	const form = document.getElementById(id);
	if (p != undefined) { //remove any error msgs
		form.removeChild(p);
	}
  //allow clicking on background again
	const hiddenDiv = document.getElementById("disableDiv");
	if (hiddenDiv != undefined) hiddenDiv.style.display = "none";
}

//create form popup buttons
function createFormButton(type, className, text){
	const button = document.createElement("button");
	button.type = type;
	button.className = className;
	button.textContent = text;
	return button;
}

//create a text field
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

//create text field acceping only strings following valid email format
function createEmail(type, placeholder, inputName){
	const text = document.createElement("input");
	text.type = type;
	text.placeholder = placeholder;
	text.name = inputName;
	text.required = true;
  //text must follow this pattern
	text.pattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$";
	console.log(text);
	text.className = "formbox";
	return text;
}

//create title labelling text field
function createLabel(htmlFor, text){
	const label = document.createElement("label");
	label.htmlFor = htmlFor;
	const b = document.createElement("b");
	b.textContent = text;
	label.appendChild(b);
	return label;
}

//using API to check username is not taken
function signAuthenticate(form, id, msg, div, pass, username, apiUrl, email,
                          name){
  //remove any error messages
	if (document.getElementById(id) != undefined){
		form.removeChild(document.getElementById(id));
	}
	if (document.getElementById("invalid-email") != undefined){
		form.removeChild(document.getElementById("invalid-email"));
	}
	if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/.test(email.value) == false){
  //if email is not valid
		form = invalidEmail(form); //create email error message
		return form;
	}
  const p = document.createElement("p");
  p.className = "failAuth";
	p.textContent = msg;
  p.id = id; //create username taken error message
  signToBackend(form, apiUrl, username, pass, p, email, name);
	if (username.value != "" && pass.value != "" && email.value != "" &&
      name.value != ""){
	event.preventDefault(); //if not all filled don't submit
	}
}

//send to API user inputs to validate if username is taken
function signToBackend(form, apiUrl, username, pass, p, email, name){
  const inputs = {
                  "username": username.value,
                  "password": pass.value,
                  "email": email.value,
                  "name": name.value
                  }
  const param	= {
                  method: 'POST',
                  body:JSON.stringify(inputs),
                  headers: {
                            'Content-Type': 'application/json'
                  }
  }
  fetch(apiUrl + '/auth/signup/', param) //send to API
  .then(function(response){
    console.log(response.statusText);
    if (response.statusText == "CONFLICT"){ //username taken
      if (username.value != "" && pass.value != "") form.appendChild(p);
      //display error message
    }
    return response.json();
  })
  .then(function(responseAsJson){ //otherwise all good
    localStorage.clear(); //clear prev tokens
    console.log(responseAsJson.token);
    localStorage.setItem('auth', responseAsJson.token); //set token
    localStorage.setItem('user', username.value); //set username
    if (responseAsJson.token != undefined){
      document.location.reload(true); //reload page to show user feed
    }
  })
}
