var data = { selectedList: "", lists: [] };
const settings = {
  endpoint: "http://shopping-lists-api.herokuapp.com",
  username: "",
  password: ""
};


function init() {
  let button = document.getElementById("DropDownPfeil1");
  let list = document.getElementById("listBuy");
  let div = document.getElementById("EintragHinzufügen");

  list.style.display = "none";
  div.style.display = "none";
  button.addEventListener("click", (event) => {

    if (list.style.display == "none" && div.style.display == "none") {
      list.style.display = "block";
      div.style.display = "block";
    } else {
      list.style.display = "none";
      div.style.display = "none"

    }
  });
}

var switchListe = (id) => {
  if (data.selectedList) {
    let oldNode = document.querySelector("#li" + data.selectedList);
    oldNode.classList.remove("liActive");
  }
  data.selectedList = id;
  document.querySelector("#li" + id).classList.add("liActive");

  refreshItems();
}

var removeListe = (id) => {
  data.lists = data.lists.filter((val) => val._id != id);
  let node = document.querySelector("#li" + id);
  node.parentElement.removeChild(node);

  if (data.lists.length < 0) {
    if (id == data.selectedList)
      switchListe(data.lists[data.lists.length - 1]._id);

  } else {
    data.selectedList = "";
    refreshItems();
  }

}


function getListe() {
  var txt;
  var person = prompt("Wie ist die ID deiner Einkaufsliste?", "");

  if (!person)
    return;

  var request = new XMLHttpRequest();
  request.open('GET', settings.endpoint + "/api/v1/lists/" + person, true);

  request.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      //// BACKEND LISTE
      var resData = JSON.parse(this.response);
      data.lists.push(resData);

      //// FRONTEND LISTE
      let div = document.getElementById("listBuy");
      let liElement = document.createElement("li");
      liElement.setAttribute("onclick", "switchListe('" + person + "')");
      liElement.id = "li" + person;
      let btnElement = document.createElement("button");
      btnElement.setAttribute("onclick", "removeListe('" + person + "')");
      btnElement.addEventListener('click', function (event) {
        event.stopPropagation();

      });
      let imgElement = document.createElement("img");
      imgElement.className = "MülleimerBild"
      imgElement.src = "Bilder/Müll.png";
      let aElement = document.createElement("a");
      aElement.href = "#" + person;
      liElement.className = "Einkaufsliste";
      btnElement.className = "Listeneintrag";
      aElement.className = "EinkaufslisteStyle";

      if (person == null || person == "") {
        //txt = "NoNameList";
      } else {
        txt = "" + resData.name + "";
        div.append(liElement);
      }

      aElement.innerHTML = txt;
      btnElement.append(imgElement);
      liElement.append(btnElement);
      liElement.append(aElement);
      switchListe(person);

    } else {
      console.error("Error: " + this.status);
      console.error(this.response);
    }
  }

  request.onerror = function () {
    console.error("Connection Error");
  }

  console.log("Loading list..");
  request.send();
}


function refreshItems() {
  document.getElementById("ListeEinerEinkaufsliste").innerHTML = "";
  if (data.selectedList) {
    var selList;
    for (list of data.lists) {
      if (list._id == data.selectedList) {
        selList = this.list;
        break;
      }
    }
    if (!selList)
      return; // HILFE keine Liste :/
    for (item of selList.items) {
      addItem(item.name, item._id, item.bought);
    }
  }
}


/*function addListe() {
    var idListe = document.getElementById("listBuy");
    var newElement = document.createElement("li");
    newElement.textContent = "Dynamisch Erzeugt";
    newElement.className = "Einkaufsliste";
    idListe.appendChild(newElement);
}*/

function addItem(name, id, checked) {
  let ulListe = document.getElementById("ListeEinerEinkaufsliste");
  let liElem = document.createElement("li");
  let checkbox = document.createElement("input")
  var labelinhalt = name;
  liElem.className = "ItemEinerEinkaufsliste";
  liElem.innerHTML = labelinhalt;
  liElem.id = "it" + id;
  ulListe.append(liElem);
  checkbox.type = "checkbox";
  checkbox.className = "checkBox";

  //Checkbox Attribut gesetzt auf checked 
  checkbox.checked = checked;
  checkbox.setAttribute('onchange', "changeState('" + id + "', this.checked)");

  liElem.append(checkbox);

  checkbox.addEventListener('click', function (event) {
    event.stopPropagation();
  });

  liElem.addEventListener('click', function () {
    deleteItem(id);
  });
}

//neu hinzugefügt 
function changeState(id, checked) {
  var request = new XMLHttpRequest();
  request.open('PUT', settings.endpoint + "/api/v1/lists/" + data.selectedList + "/items/" + id, true);
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  request.send(JSON.stringify({ bought: checked }));

  request.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      var resData = JSON.parse(this.response);
      for (var i = 0; i < data.lists.length; i++) {
        if (data.selectedList == data.lists[i]._id) {
          data.lists[i] = resData;
          break;
        }
      }
      refreshItems();
    } else {
      console.log("Error: " + this.status);
    }
  }
  request.onerror = function () {
    console.error("Connection Error");
  };
}



function createItem() {
  if (!data.selectedList)
    return;

  var name = document.getElementById("Eingabe").value;

  var request = new XMLHttpRequest();
  request.open('POST', settings.endpoint + "/api/v1/lists/" + data.selectedList + "/items", true);
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  request.send(JSON.stringify({ name: name }));

  request.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      var resData = JSON.parse(this.response);
      for (var i = 0; i < data.lists.length; i++) {
        if (data.selectedList == data.lists[i]._id) {
          data.lists[i] = resData;
          break;
        }
      }
      refreshItems();
    } else {
      console.log("Error: " + this.status);
    }
  }
  request.onerror = function () {
    console.error("Connection Error");
  };
}


function deleteItem(id) {
  var item = document.querySelector("#it" + id);
  item.parentElement.removeChild(item);

  var request = new XMLHttpRequest();
  request.open('DELETE', settings.endpoint + "/api/v1/lists/" + data.selectedList + "/items/" + id, true);
  request.send();

  request.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      var resData = JSON.parse(this.response);
      for (var i = 0; i < data.lists.length; i++) {
        if (data.selectedList == data.lists[i]._id) {
          data.lists[i] = resData;
          break;
        }
      }
    } else {
      console.log("Error: " + this.status);
    }
  }
  request.onerror = function () {
    console.error("Connection Error");
  };
}




console.info("Script loaded..");
init();