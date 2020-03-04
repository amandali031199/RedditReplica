//export function to create popup when user wants to edit own posts
function createUpdateForm(allDiv, apiUrl, authToken, oldText, oldTitle, postId){
	const array = createPopup("updateForm", "Update your posts");
	const div = array[0];
	const content = array[1];
  let close = array[2];
  close.onclick = function() {closeEdit(allDiv,div)};
	const submit = createFormButton("submit", "btn", "Update Changes");
	//when clicked updates post and reloads page
	submit.onclick = function(event) {update(content, textTitle, textText,
                   image, output, apiUrl, authToken, oldText, oldTitle, postId)};
	const p = document.createElement("p"); //create warning
	p.textContent =
          "Leaving a field empty will result in no changes to that information";
	const labelTitle = createLabel("title", "New Title");
	const textTitle = createText("text","Enter New Title", "title");
	const labelText = createLabel("description", "New Description");
	const textText = createText("text","Enter New Description", "description");
	const labelImage = createLabel("image", "Upload New Image");
	let image = createImage("files1");
	let output = createOutput("list1");
	content.appendChild(p);
	content.appendChild(labelTitle);
	content.appendChild(textTitle);
	content.appendChild(labelText);
	content.appendChild(textText);
	content.appendChild(labelImage);
	content.appendChild(image);
	content.appendChild(output);
	content.appendChild(submit);
	return div;
}
export default createUpdateForm;

//close a form and open previous form
function closeEdit(div, editDiv){
	if (div != ""){
		div.style.display = "block";
	} else {
		//allow clicking on background again if no forms opened previously
		let hiddenDiv = document.getElementById("disableDiv");
		hiddenDiv.style.display = "none";
	}
	editDiv.style.display = "none";
}

//create a text to show user what image they have clicked
function createOutput(id){
	let output = document.createElement("output");
	output.id = id;
	return output;
}

//allow user to choose only images from own computer
function createImage(id){
	let image = document.createElement("input");
	image.type = "file";
	image.id = id;
	image.accept = "image/*";
	image.name = "file";
	return image;
}

//create a form button
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

//create a text field only accepting strings in valid email format
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

//create a text labelling text field
function createLabel(htmlFor, text){
	const label = document.createElement("label");
	label.htmlFor = htmlFor;
	const b = document.createElement("b");
	b.textContent = text;
	label.appendChild(b);
	return label;
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
	close.onclick = function() {closeForm(div,content)};
	content.appendChild(close);
	content.appendChild(h1);
	div.appendChild(content);
	const root = document.getElementById("root");
	root.appendChild(div); //append to root
	return [div, content, close];
}

//close a form
function closeForm(div, id){
	console.log(div);
	div.style.display = "none";
	const p = document.getElementById("failAuth");
	const form = document.getElementById(id);
	if (p != undefined) { //remove any error messages
		form.removeChild(p);
	}
	//allow clicking on background again
	const hiddenDiv = document.getElementById("disableDiv");
	if (hiddenDiv != undefined) hiddenDiv.style.display = "none";
}

//given new info, update a post
function update(content, textTitle, textText, image, output, apiUrl,
                authToken, oldText, oldTitle, postId){
	let file = document.getElementById("files1").files[0]; //grab image
	let reader = new FileReader();
	//if fields are empty use old info e.g. no update
	if (textText.value == "") textText.value = oldText;
	if (textTitle.value == "") textTitle.value = oldTitle;
	if (file){ //image has been included
		reader.onload = (function(theFile) {
			//read the image into base64 from local path
      return function(e) {
    	  let src = e.target.result.split(',')[1]; //base 64
				console.log(postId);
    		saveToBackend(textTitle, textText, src, apiUrl, authToken, postId);
				//send info to API
    	};
    })(file);
    reader.readAsDataURL(file);   // Read in the image file as a data URL.
  } else {
    saveToBackend(textTitle, textText, null, apiUrl, authToken, postId);
		//send info to API
  }
}

//send new info to API and save
function saveToBackend(title, text, src, apiUrl, authToken, postId){
	console.log(title);
	let inputs = {};
	if (src == null){
	   inputs = {
		         "title": title.value,
		         "text": text.value
		}
	} else {
	   inputs = {
		          "title": title.value,
		          "text": text.value,
		          "image": src
		          }
	}
	const param = {
		             method: 'PUT',
		             body: JSON.stringify(inputs),
		             headers:{
			                    'Authorization': `Token ${authToken}`,
			                    'Content-Type': 'application/json',
		                     }
	              }
	fetch(apiUrl + '/post/?id=' + postId, param) //send to API
	.then(function(response){
		if(response.ok) document.location.reload(true);
		//reload page to show new info
	})
	.catch(function(error) {
  		console.log('Looks like there was a problem: \n', error);
	});
}
