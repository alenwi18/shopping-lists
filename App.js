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

  if (localStorage.getItem("data")) {
    data = JSON.parse(localStorage.getItem("data"));
    if (data.lists) {
      for (var liste of data.lists) {
        addListe(liste._id);
      }
      switchListe(data.selectedList);
    }
  }
}

var switchListe = (id) => {
  if (data.selectedList) {
    let oldNode = document.querySelector("#li" + data.selectedList);
    oldNode.classList.remove("liActive");
  }
  data.selectedList = id;
  document.querySelector("#li" + id).classList.add("liActive");

  refreshItems();

  localStorage.setItem("data", JSON.stringify(data));
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

  localStorage.setItem("data", JSON.stringify(data));
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
      addListe(resData._id);

      switchListe(person);

      localStorage.setItem("data", JSON.stringify(data));
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

function addListe(id) {
  var curList;
  for (let i = 0; i < data.lists.length; i++) {
    if (data.lists[i]._id == id) {
      curList = data.lists[i];
      break;
    }
  }
  let div = document.getElementById("listBuy");
  let liElement = document.createElement("li");
  liElement.setAttribute("onclick", "switchListe('" + curList._id + "')");
  liElement.id = "li" + curList._id;
  let btnElement = document.createElement("button");
  btnElement.setAttribute("onclick", "removeListe('" + curList._id + "')");
  btnElement.addEventListener('click', function (event) {
    event.stopPropagation();
  });
  let imgElement = document.createElement("img");
  imgElement.className = "MülleimerBild"
  imgElement.src = "Bilder/Müll.png";
  let aElement = document.createElement("a");
  aElement.href = "#" + curList._id;
  liElement.className = "Einkaufsliste";
  btnElement.className = "Listeneintrag";
  aElement.className = "EinkaufslisteStyle";

  var txt = "hilfe";
  if (curList._id == null || curList._id == "") {
    //txt = "NoNameList";
  } else {
    txt = "" + curList.name + "";
    div.append(liElement);
  }

  aElement.innerHTML = txt;

  btnElement.append(imgElement);

  liElement.append(btnElement);
  liElement.append(aElement);
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
      localStorage.setItem("data", JSON.stringify(data));
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
      localStorage.setItem("data", JSON.stringify(data));
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
      localStorage.setItem("data", JSON.stringify(data));
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


$(document).ready(function () {
  $("#mobile_listen_auf").click(function () {
    $("#EinkaufslistenDropDown").css("visibility", "visible");
    $(".main").css("visibility", "visible");
    $("#EintragHinzufügen").css("visibility", "visible");
    $("#mobile_listen_auf").css("visibility", "hidden");
    $("#leftbar").show();
    $("#EinkaufslistenDropDown").show();
    $("body").css("position", "fixed");
    $("body").animate({ left: "200px" });
    $("body").animate({ right: "-200px" });
  });
  $("button#Xen").click(function () {
    $("#EinkaufslistenDropDown").css("visibility", "hidden");
    $(".main").css("visibility", "hidden");
    $("#EintragHinzufügen").css("visibility", "hidden");
    $("#mobile_listen_auf").css("visibility", "visible");
    $("#leftbar").hide();
    $("body").css("position", "unset");
    $("body").css("left", "unset");
    $("body").css("right", "unset");
  });
  $("#theme").click(function () {
    $("li#Impressum, li#Agb, li#Kontakt, li#Hilfe").css("color", "blue");
    $("li.leftborder").css("color", "blue");
    $("li#Impressum:hover, li#Agb:hover, li#Kontakt:hover, li#Hilfe:hover").css("color", "yellow");
    $("div#EinkaufslistenDropDown").css("border", "1px solid blue");
    $("div#EinkaufslistenDropDown").css("background-color", "lightblue");
    $("button#DropDownPfeil1").css("background-color", "blue");
    $("button#DropDownPfeil1").css("border", "1px solid lightblue");
    $("ul#listBuy li.Einkaufsliste a:hover").css("border", "1px solid blue");
    $("ul#listBuy").css("border", "1px solid blue");
    $("ul#listBuy").css("border-top", "unset");
    $("ul#listBuy").css("background-color", "aliceblue");
    $("div#EintragHinzufügen").css("border", "1px solid blue");
    $("div#EintragHinzufügen").css("border-top", "unset");
    $("li.Einkaufsliste").css("color", "blue");
    $("li.Einkaufsliste.liActive").css("background", "#93b9ff");
    $("p#neueListe").css("color", "blue");
    $("a.EinkaufslisteStyle").css("color", "blue");
    $("input#Eingabe").css("color", "darkblue");
    $("input#Eingabe").css("border", "1px solid blue");
    $("input#Eingabe").css("background-color", "lightblue");
    $("li.ItemEinerEinkaufsliste").css("border", "1px solid blue");
    $("li.ItemEinerEinkaufsliste").css("background", "aliceblue");
    $("div.ListeEinerEinkaufsliste").css("border", "1px solid blue");
    $(".main").css("background-color", "#e1e1ff");
    $(".checkBox").css("border", "1px solid darkblue");
    $("#fontplus").css("display", "block");
    $("#plusimg").css("display", "none");
    $("#mobile_listen_auf").css("color", "blue");
    $("#leftbar").css("background", "rgba(167, 176, 236, 0.805)");
    $("#Xen").css("border", "2px solid blue");
    $("#Xen").css("border-right", "unset");
    $("#theme").css("display", "none");
    $("#theme2").css("display", "block");
    $("li.Einkaufsliste.liActive").css("background-color", "#d9dcf9");
  });

  $("#theme2").click(function () {
    location.reload();
  });

  $(window).resize(checkSize);

});

var smallerBefore = false;

function checkSize() {
  if ($(".jqueryTrigger").css("float") == "none" && smallerBefore == true) {
    location.reload();
  } else if ($(".jqueryTrigger").css("float") == "left") {
    smallerBefore = true;
  }
}






