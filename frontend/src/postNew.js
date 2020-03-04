//export function which creates a new post popup
function createPostForm(apiUrl, authToken){
	const array = createPopup("postForm", "Post New Content");
	const div = array[0]; //general div
	let content = array[1]; //holding content
	const submit = createFormButton("submit", "btn", "Post"); //submit button
	//when clicked, create a new post
	submit.onclick = function(event) {post(content, textTitle, textText,
                   textSubseddit, image, output, apiUrl, authToken)};
	const labelTitle = createLabel("title", "Title"); //title
	const textTitle = createText("text","Enter Title", "title"); //title textbox
	const labelText = createLabel("description", "Description"); //desc
	const textText = createText("text","Enter Description", "description");
	const labelSubseddit = createLabel("subseddit", "Subseddit(optional)");
	const textSubseddit = createText("text","Enter Subseddit (optional)",
                                   "subseddit");
	textSubseddit.removeAttribute("required"); //subseddit is optional
	const labelImage = createLabel("image", "Upload Image(optional)");
	let image = createImage("files0"); //lets user choose from own files
	let output = createOutput("list0"); //displays which file they picked
  content = contentAppend(content, labelTitle, textTitle, labelText, textText,
            labelSubseddit, textSubseddit, labelImage, image, output, submit);
	return div;

}
export default createPostForm;

//append all the fields to the new post form
function contentAppend(content, labelTitle, textTitle, labelText, textText,
          labelSubseddit, textSubseddit, labelImage, image, output, submit){
  content.appendChild(labelTitle);
  content.appendChild(textTitle);
  content.appendChild(labelText);
  content.appendChild(textText);
  content.appendChild(labelSubseddit);
  content.appendChild(textSubseddit);
  content.appendChild(labelImage);
  content.appendChild(image);
  content.appendChild(output);
  content.appendChild(submit);
  return content;
}

//create a textbox
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

//create text box where only strings following email format are accepted
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

//create a title labelling a textbox
function createLabel(htmlFor, text){
	const label = document.createElement("label");
	label.htmlFor = htmlFor;
	const b = document.createElement("b");
	b.textContent = text;
	label.appendChild(b);
	return label;
}

//send to API the new post information
function post(content, textTitle, textText, textSubseddit, image, output,
              apiUrl, authToken){
	if (document.getElementById("error-msg") != undefined) { //remove error msgs
    content.removeChild(document.getElementById("error-msg"))
  }
	let file = document.getElementById("files0").files[0]; //grab image
   if (textTitle.value == "" || textText.value == ""){
		 //error message if title and desc is empty
   		let msg = document.createElement("p");
   		msg.style.fontSize = "small";
   		msg.id = "error-msg";
   		msg.textContent = "Please supply both a title and description";
   		content.appendChild(msg);
   		event.preventDefault(); //don't submit if these fields are empty
	}
	if (file){ //if an image has been attached, turn into base64
    readFile(file, textTitle, textText, apiUrl, authToken, textSubseddit);
   } else {
   		if (!textSubseddit){ //if subseddit not supplied, leave general
    		sendToBackend(textTitle.value, textText.value, "general", null,
                      apiUrl, authToken);
   		} else { //also include subseddit when sending info to API
   			sendToBackend(textTitle.value, textText.value, textSubseddit.value,
                      null, apiUrl, authToken);
   	  }
   }
}

//given a local file path, turn into base64
function readFile(file, textTitle, textText, apiUrl, authToken, textSubseddit){
  let reader = new FileReader();
  reader.onload = (function(theFile) {
       return function(e) { //render picture
          let src = e.target.result.split(',')[1]; //base64
          if (!textSubseddit){ //if no subseddit included, make general
          sendToBackend(textTitle.value, textText.value, "general", src,
                        apiUrl, authToken); //send to API
         } else { //send subseddit too to API
             sendToBackend(textTitle.value, textText.value, textSubseddit.value,
                           src, apiUrl, authToken); //send to API
         }
      };
  })(file);
  reader.readAsDataURL(file); //turn into base64
}

//send to API and create a new post
function sendToBackend(title, text, subseddit, img, apiUrl, authToken){
	console.log(authToken);
	const inputs = {
		             "title": title,
		             "text": text,
		             "subseddit": subseddit,
		             "image": img
	               }
	const param = {
		             method: 'POST',
		             body: JSON.stringify(inputs),
		             headers:{
			                    'Authorization': `Token ${authToken}`,
			                    'Content-Type': 'application/json',
		                     }
	              }
	fetch(apiUrl + '/post/', param) //send to API
	.then(function(response){
		if (!response.ok) throw Error(response.statusText);
		console.log(response.statusText);
		return response.json();
	})
	.then(function(responseAsJson) {
		document.location.reload(true); //reload page to display new data
	})
	.catch(function(error) {
  	console.log('Looks like there was a problem: \n', error);
	});
}

//create a field displaying which image user has selected
function createOutput(id){
	let output = document.createElement("output");
	output.id = id;
	return output;
}

//create form popup buttons
function createFormButton(type, className, text){
	const button = document.createElement("button");
	button.type = type;
	button.className = className;
	button.textContent = text;
	return button;
}

//create a button so user can click which file they want from computer
//only allows them to pick images png or jpg
function createImage(id){
	let image = document.createElement("input");
	image.type = "file";
	image.id = id;
	image.accept = "image/*";
	image.name = "file";
	return image;
}

//create a popup
function createPopup(id, text){
	const div = document.createElement("div"); //general div
	div.id = id;
	div.setAttribute("ss-container", "");
	div.className = "form-popup";

	const content = document.createElement("div"); //content div
	content.className = "form-container";
	content.setAttribute("ss-container", "");

	const h1 = document.createElement("h1"); //title
	h1.textContent = text;
	h1.style.textAlign = "center";

	const close = document.createElement("a"); //close button
	close.href = "#" + div.id;
	close.className = "close";
	//when clicked opens previous form
	close.onclick = function() {closeForm(div,content)};
	content.appendChild(close);
	content.appendChild(h1);
	div.appendChild(content);
	const root = document.getElementById("root");
	root.appendChild(div); //append this to root
	return [div, content, close];
}

//close a form
function closeForm(div, id){
	console.log(div);
	div.style.display = "none";
	const p = document.getElementById("failAuth"); //get error msg
	const form = document.getElementById(id);
	if (p != undefined) { //remove error msg
		form.removeChild(p);
	}
	//allow clicking on background again
	const hiddenDiv = document.getElementById("disableDiv");
	if (hiddenDiv != undefined) hiddenDiv.style.display = "none";
}
