var allDs;
var classesJson;
var classesReady = false;
var panelId = 0;

var usedDs = []; // hash: {ds}

var panelDs = [];
var panelRoots = [];
var typeList = [];
var inputFields = [];

var semantifyUrl = "https://staging.semantify.it";

var copyBtn = {
    "name": "Copy",
    "onclick": function (jsonLd) {
        console.log("Copy");
        if (jsonLd)
            copyStr(JSON.stringify(jsonLd, null, 2));
    }
};
var saveBtn = {
    "name": "Save",
    "onclick": function (jsonLd) {
        console.log("save");
        if (jsonLd)
        postJson(jsonLd, "", "SJFmMV5T-", function(data){
        //postJson(jsonLd, "", "B1DtHSL6W", function(data){
            if(data){
                console.log('Saved annotation "' + data[0]["name"] + '" at: https://smtfy.it/' + data[0]["UID"]);
            }
            else{
                console.log("Failed to save annotation");
            }
        });
    }
};
var previewBtn = {
    "name": "Preview",
    "onclick": function (jsonLd) {
        if (jsonLd === null) {
            return;
        }
        console.log("preview");
        var dummy = document.createElement("div");
        document.body.appendChild(dummy);
        dummy.setAttribute("id", "preview_id");
        $('#preview_id').append(
            '<div class="modal fade" id="myModal" role="dialog">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
            '<h4 class="modal-title">Preview JSON-LD</h4>' +
            '</div>' +
            '<div class="modal-body">' +
            '<pre id="preview_textArea" style="max-height: 500px;"></pre>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'
        );
        $('#preview_textArea').html(syntaxHighlight(JSON.stringify(jsonLd, null, 2)));
        $('#myModal').modal();
    }
};

var defaultBtns = [copyBtn, previewBtn, saveBtn];

getClassesJson();

$('.IA_Box').each(function () {
    var dsId = $(this).data("dsid");
    var dsHash = $(this).data("dshash");
    var buttonsChoise = $(this).data("btns");
    var buttons;
    switch (buttonsChoise) {
        case "no" :
            buttons = [];
            break;
        case "default":
        case undefined:
        case null:
            buttons = defaultBtns;
    }
    $(this).append(
        '<div id="loading' + panelId + '" class="col-lg-3 col-md-4 col-sm-6 text-center" style="margin: 10px; padding: 10px; background: white; border-radius: 10px;">'+
        '<img src="'+semantifyUrl+'/images/loading.gif">'+
        '</div>'
    );

    (function(id, jqueryElement){
        if(dsHash !== null && dsHash !== undefined){
            call(semantifyUrl+"/api/domainSpecification/hash/"+dsHash, function(ds){
                addBox(jqueryElement, id, ds, buttons);
            });
        }
        else if (dsId !== null && dsId !== undefined){
            call(semantifyUrl+"/api/domainSpecification/"+dsId, function(ds){
                addBox(jqueryElement, id, ds, buttons);
            });
        }
    }(panelId, $(this)));

    panelId++;
});

function getClassesJson() {
    //call(semantifyUrl+"/assets/data/latest/classes.json", function (data) {
    call("https://semantify.it/assets/data/3.2/classes.json", function (data) {
        classesJson = data;
        classesReady = true;
    });
}

function addBox(jqueryElement, myPanelId, ds, buttons) {
    if (!(classesReady)) {
        setTimeout(function () {
            addBox(jqueryElement, myPanelId, ds, buttons);
        }, 100);
        return;
    }

    $('#loading'+myPanelId).hide();

    var title = jqueryElement.data("title");
    var curDs = ds["content"];
    var dsName = (title ? title : (curDs === undefined ? "DS not found" : curDs["schema:name"]));
    var dsType = curDs["dsv:class"][0]["schema:name"];

    var footer = (buttons && buttons.length > 0 ? '<div class="panel-footer text-center" id="panel-footer-' + myPanelId + '"></div>' : '');      //only display footer if there are some buttons
    jqueryElement.append(
        '<div class="panel panel-info col-lg-3 col-md-4 col-sm-6" id="panel-' + myPanelId + '" style="margin: 10px; padding: 10px;" >' +
        '<div class="panel-heading sti-red"> ' +
        '<h3>' + dsName + '</h3>' +
        '</div> ' +
        '<div class="panel-body" id="panel-body-' + myPanelId + '">' +
        '</div>' +
        footer +
        '</div>');
    panelDs.push(curDs["schema:name"]);
    panelRoots.push(curDs["dsv:class"][0]["schema:name"]);
    var dsProps = curDs["dsv:class"][0]["dsv:property"];
    var req_props = [];
    var opt_props = [];
    var props = getProps(dsProps, "", dsType, myPanelId,false);

    props.forEach(function (prop) {
        if (!prop["isOptional"] && !prop["rootIsOptional"]) {
            req_props.push(prop)
        }
        else {
            opt_props.push(prop)
        }
    });

    req_props.forEach(function (p) {
        insertInputField(myPanelId, p["name"], getDesc(p["fatherType"], p["simpleName"]), p["type"], p["enums"], "#panel-body-", p["isOptional"],p["rootIsOptional"])
    });

    if (opt_props.length > 0) {
        $('#' + 'panel-body-' + myPanelId)
            .append('<button type="button" class="btn btn-block btn-default text-left" id="panel-body-opt-btn-' + myPanelId + '" style="background-color: lightgrey;">Optional Fields <span class="caret"></button>')
            .append('<div id="panel-body-opt-' + myPanelId + '"> </div>');

        // this is because if you call onclick it would use the last recent panelId and not the current one
        (function (arg) {
            $('#' + 'panel-body-opt-btn-' + arg).click(function () {
                var optionalContainer = $('#panel-body-opt-' + arg);
                if (optionalContainer.css('display') === 'none') {
                    optionalContainer.slideDown(500);
                }
                else {
                    optionalContainer.slideUp(500);
                }
            });
        })(myPanelId);

        opt_props.forEach(function (p) {
            insertInputField(myPanelId, p["name"], getDesc(p["fatherType"], p["simpleName"]), p["type"], p["enums"], "#panel-body-opt-", p["isOptional"],p["rootIsOptional"])
        });

        $('#panel-body-opt-' + myPanelId).slideUp(0);

    }

    for (var j in buttons) {
        if (buttons.hasOwnProperty(j)) {
            (function (arg) {    // because the onclick changes with each loop all buttons would call the same function
                var name = buttons[j]["name"];
                var onclick = buttons[j]["onclick"];
                var additionalClasses = buttons[j]["additionalClasses"];

                $('#panel-footer-' + myPanelId)
                    .append('<button class="btn button-sti-red" id="panel-footer-btn-' + name + '-' + myPanelId + '" style="margin: 0 5px" ' + additionalClasses + '>' + name + '</button>');
                $('#panel-footer-btn-' + name + '-' + myPanelId)
                    .click(function () {
                        onclick(createJsonLd(arg));
                    });
            })(myPanelId);
        }
    }
}


function insertInputField(panelId, name, desc, type, enumerations, panel, optional,rootIsOptional) {
    var id = panelId + "_" + type + "_" + name + "_" + optional + "_" + rootIsOptional;
    id = id.replace(/:/g, "-").replace(/ /g, '');
    var temp=false;
    if(rootIsOptional && !optional){
      temp=true;
      var p=name.split(":");
      p.pop();
      var t= "THIS IS A REQUIRED FIELD FOR THE PATH "+p.concat()+" \n\n"+desc;
      desc=t;
    }
    switch (type) {
        case "Text":
        case "URL":
            if(temp){
              $(panel + panelId).append('<input type="text" class="form-control input-myBackgroundRootOptional" id="' + id + '" placeholder="' + name + '" title="' + desc + '">');
            }else{
              $(panel + panelId).append('<input type="text" class="form-control input-myBackground" id="' + id + '" placeholder="' + name + '" title="' + desc + '">');
            }
            break;
        case "Integer":
        case "Number":
        case "Float":
          if(temp){
            $(panel + panelId).append('<input type="number" class="form-control input-myBackgroundRootOptional" id="' + id + '" placeholder="' + name + '" title="' + desc + '">');
          }else{
            $(panel + panelId).append('<input type="number" class="form-control input-myBackground" id="' + id + '" placeholder="' + name + '" title="' + desc + '">');
          }
          break;
        case "Boolean":
          if(temp){
            $(panel + panelId).append('<input type="checkbox" class="form-control input-myBackgroundRootOptional" id="' + id + '" placeholder="' + name + '" title="' + desc + '"><label for=' + id + '>' + name + '</label>');
          }else{
            $(panel + panelId).append('<input type="checkbox" class="form-control input-myBackground" id="' + id + '" placeholder="' + name + '" title="' + desc + '"><label for=' + id + '>' + name + '</label>');
          }
            break;
        case "Date":
          if(temp){
            $(panel + panelId).append('<input type="text" class="form-control input-myBackgroundRootOptional" id="' + id + '" placeholder="' + name + '" title="' + desc + '">');
          }else{
            $(panel + panelId).append('<input type="text" class="form-control input-myBackground" id="' + id + '" placeholder="' + name + '" title="' + desc + '">');
          }
            $('#' + id).datetimepicker({
                format: 'L'
            });
            break;
        case "DateTime":
          if(temp){
            $(panel + panelId).append('<input type="text" class="form-control input-myBackgroundRootOptional" id="' + id + '" placeholder="' + name + '" title="' + desc + '">');
          }else{
            $(panel + panelId).append('<input type="text" class="form-control input-myBackground" id="' + id + '" placeholder="' + name + '" title="' + desc + '">');
          }
            $('#' + id).datetimepicker();
            break;
        case "Time":
          if(temp){
            $(panel + panelId).append('<input type="text" class="form-control input-myBackgroundRootOptional" id="' + id + '" placeholder="' + name + '" title="' + desc + '">');
          }else{
            $(panel + panelId).append('<input type="text" class="form-control input-myBackground" id="' + id + '" placeholder="' + name + '" title="' + desc + '">');
          }
            $('#' + id).datetimepicker({
                format: 'LT'
            });
            break;
        case "Enumeration":
          if(temp){
            $(panel + panelId).append('<select name="select" class="form-control input-myBackgroundRootOptional" id="' + id + '" title=" ' + desc + '">');
          }else{
            $(panel + panelId).append('<select name="select" class="form-control input-myBackground" id="' + id + '" title=" ' + desc + '">');
          }
            var enumField = $('#' + id);
            enumField.append('<option value="" disabled selected>Select: ' + name + '</option>');
            enumerations.forEach(function (e) {
                enumField.append('<option value="' + e + '">' + e + '</option>');
            });
            enumField.append('</select>');
            break;
    }
    inputFields.push(id);
}

function getDesc(className, propertyName) {
    for (var i = 0; i < classesJson[className]["properties"].length; i++) {
        if (propertyName === classesJson[className]["properties"][i]["name"]) {
            return strip(classesJson[className]["properties"][i]["description"]);
        }
    }
}

function strip(html) {
    var tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

function getProps(props, level, fatherType, myPanelId,fatherIsOptional) {
    var propList = [];
    for (var p in props) {
        if (!props.hasOwnProperty(p)) continue;
        var prop = props[p];
        if (prop['dsv:expectedType'][0]['@type'] !== "dsv:RestrictedClass") {
            var simpleProp = {
                "simpleName": prop["schema:name"],
                "name": (level === "" ? "" : level + ": ") + prop["schema:name"],
                "type": prop["dsv:expectedType"][0]["schema:name"],
                "fatherType": fatherType,
                "isOptional": prop["dsv:isOptional"],
                "rootIsOptional" : fatherIsOptional
            };

            if (prop['dsv:expectedType'][0]['@type'] === 'dsv:RestrictedEnumeration') {
                simpleProp["type"] = "Enumeration";
                var enums = [];
                prop['dsv:expectedType'][0]['dsv:expectedEnumerationValue'].forEach(function (ele) {
                    enums.push(ele["schema:name"]);
                });
                simpleProp["enums"] = enums;
            }

            propList.push(simpleProp);
        }
        else {
            var myLevel = level === "" ? prop["schema:name"] : level + "." + prop["schema:name"];
            var path = myLevel + ".@type";
            var pathType = {
                "name": prop['dsv:expectedType'][0]['schema:name'],
                "path": path,
                "panelId": myPanelId
            };
            typeList.push(pathType);
            fIsOptional=false;
            if(fatherIsOptional===true || prop['dsv:isOptional']===true){
              fIsOptional=true;
            }
            propList = propList.concat(getProps(prop['dsv:expectedType'][0]["dsv:property"], (level === "" ? prop["schema:name"] : level + ": " + prop["schema:name"]), prop['dsv:expectedType'][0]["schema:name"], myPanelId,fIsOptional));
        }
    }
    return propList;
}

function createJsonLd(id) {
    var dsName = panelDs[id];
    var schemaName = panelRoots[id];
    var jsonDs;
    var validPaths = [];
    var allPaths = [];
    var resultJson = {
        "@context": "http://schema.org/",
        "@type": schemaName
    };
    for (var i in allDs) {
        if (allDs.hasOwnProperty(i))
            if (allDs[i]["content"]["schema:name"] === dsName) {
                jsonDs = allDs[i]["content"];
                break;
            }
    }
    var allRequired = true; //variable gets false if an required field is empty
    var allInputs = $(":input");

    inputFields.forEach(function (a) {
        var compareId = a.slice(0, a.indexOf("_"));
        if (compareId === id.toString()) { //only inputs from same panel
            var value = $("#" + a).val();
            var fullPath = a;
            fullPath = fullPath.replace(/\-/g, ".");
            fullPath = fullPath.replace(/ /g, "");
            var path = fullPath.split('_');
            var optional = path[3];
            var rootOptional=path[4]
            path = path[2];
            if ((value === undefined || value === null || value === "") && (optional === "false" && rootOptional==="false")) {
                allRequired = false;

            }
            typeList.forEach(function (t) {
                if (t["panelId"] === id) {
                    var typePath = {
                        "name": t["name"],
                        "path": t["path"]
                    };
                    allPaths.push(typePath)
                }
            });
            if (!(value === undefined || value === null || value === "")) {

                var temp = path.split(".");
                while (temp.length > 1) {
                    temp.pop();
                    var x = temp.join(".") + ".@type";
                    validPaths.push(x);
                }

                allPaths.forEach(function (a) {
                    validPaths.forEach(function (v) {
                        if (v === a["path"]) {
                            resultJson = set(resultJson, a["path"], a["name"])
                        }
                    });
                });

                resultJson = set(resultJson, path, value)
            }
        }

    });
    if (allRequired) {
        //console.log(allPaths.length);
        //console.log(validPaths.length);

        var result = (JSON.stringify(resultJson));
        //console.log(result);
        return resultJson;
    } else {
        send_snackbarMSG("Please fill in all required fields", 3000);
        return null;
    }
}



function copyStr(str) {
    var dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute("id", "dummy_id");
    dummy.setAttribute('value', str);
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    send_snackbarMSG("Annotation copied into your clipboard", 3000);
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function send_snackbarMSG(message, duration) {
    var options = {
        content: '<table class="snackbar-table"><td><i class="material-icons snackbar-icon">info</i><span>  ' + message + '</span></td></table>', // text of the snackbar
        style: "toast",
        timeout: duration,
        htmlAllowed: true,
        onClose: function () {
        }
    };
    $.snackbar(options);
}

function call(url, callback) {
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function (data) {
            callback(data);
        },
        error: function () {
            console.log('error');
        }
    });
}

function postJson(json, dsId, apiKey, callback) {
    var url = semantifyUrl+"/api/annotation/";
    //url = "http://localhost:8081/api/annotation/";

    var options = {
        htmlAllowed: true,
        style: 'toast',
        timeout: 3000
    };

    var bulk = [];
    var toSend = {};
    toSend["content"] = json;
    //toSend["domainSpecification"] = dsId;
    bulk.push(toSend);

    $.ajax({
        type: "POST",
        contentType: 'application/json',
        url: url + apiKey,
        data: JSON.stringify(bulk),
        success: function (data) {
            options['content'] = 'Saved annotation in semantify';
            callback(data);
            $.snackbar(options);
        },
        error: function () {
            options['content'] = 'Failed to save Annotation in semantify';
            callback();
            $.snackbar(options);
        }
    });
}

function set(obj, path, value) {
    var schema = obj;
    var pList = path.split('.');
    var len = pList.length;
    for (var i = 0; i < len - 1; i++) {
        var elem = pList[i];
        if (!schema[elem]) schema[elem] = {};
        schema = schema[elem];
    }
    schema[pList[len - 1]] = value;
    return obj;
}
