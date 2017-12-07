![semantify.it](https://semantify.it/images/logo.png)

# Instant Annotation for Semantify.it

# Description
The instant-annotator is a leightweight editor from [semantify.it](www.semantify.it) to annotate things like Event, Recipe, Article .. with the [google recommended](https://developers.google.com/search/docs/guides/) fields.

# Add The Instant-Annotator To Your Website
```html
<div class="IA_Box" data-dshash="HASH" data-sub="SUBCLASSES" data-btns="BTNS" data-title="TITLE"></div>
```
**HASH**: The hash of the type (see below)<br />
**SUBCLASSES**:Either "true" or "false". If this is set to "true", an optional dropdown with all sub classes will appear (For example: for the type Event a dropdown with Festival, FoodEvent,..)<br />
**BTNS**: The buttons (see below)<br />
**TITLE**: The title of the box<br />

#### Dependencies
```html
**javascript:**
https://code.jquery.com/jquery-3.2.1.slim.min.js
https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js
https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/js/bootstrap.min.js
https://code.jquery.com/jquery-3.2.1.min.js
https://cdnjs.cloudflare.com/ajax/libs/arrive/2.4.1/arrive.min.js
https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js
https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/0.5.9/js/ripples.js
https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/0.5.9/js/material.min.js
https://cdnjs.cloudflare.com/ajax/libs/snackbarjs/1.1.0/snackbar.min.js
https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.7.1/clipboard.min.js
https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js
https://cdn.rawgit.com/ax5ui/ax5core/master/dist/ax5core.min.js
https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.47/js/bootstrap-datetimepicker.min.js

**css:**
https://fonts.googleapis.com/css?family=Roboto:300,400,500,700
https://fonts.googleapis.com/icon?family=Material+Icons
https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css
https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/0.5.9/css/ripples.min.css
https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/0.5.9/css/bootstrap-material-design.min.css
https://cdnjs.cloudflare.com/ajax/libs/snackbarjs/1.1.0/snackbar.min.css
https://semantify.it/dashboard/assets/style.css
https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.47/css/bootstrap-datetimepicker.min.css
```
# Hashes 
- [Article](https://developers.google.com/search/docs/data-types/articles)
:H1TlMn-4M1f

- [Event](https://developers.google.com/search/docs/data-types/events)
:SyqlG3b4Mkf

- [JobPosting](https://developers.google.com/search/docs/data-types/job-postings)
:rkhlM3-EGyM

- [LocalBusiness](https://developers.google.com/search/docs/data-types/local-businesses)
:Byigf2ZEfJf

- [Recipe](https://developers.google.com/search/docs/data-types/recipes)
:ry0lz3ZVf1G

# Buttons
- **clear**: Clears the all input fields.
- **copy**: Copies the resulting jsonLd to the clipboard.
- **preview**: Creates a preview of the resulting jsonLd.
- **save**: Saves the resulting jsonLd on semantify, shows a preview of the resulting jsonLd and a short link to the saved annotation on the server. It also gives you the option to save the result on your semantify account (login required). <br /> <br />
**multiple buttons can be added by seperating them with "+"**<br />
Example:
```html
data-btns="preview+clear+save+copy"
```
or
```html
data-btns="preview+clear"
```
### Default Buttons:
The default buttons are clear and save.
```html
data-btns="default"
```
### Creating Own Buttons:
You can also create your own buttons. Therefore you need: <br />
- The button element:<br />
```html
<div class="IA_Btn" data-name="NAME" data-icon="ICON" data-createjsonld="CREATE" data-onclick=yourFunction></div>
```
Where NAME is the name of your button, ICON is the icon of your button (use the name of [material icons](https://material.io/icons/)), CREATE is "true" or "false" (if set to true, a jsonLd result is created) and  yourFunction is your function.
- The javascript code:<br />
```html
<script>
function yourFunction(response){
                    console.log(response);
                    console.log(response["panelId"]);
                    console.log(response["jsonLd"]);
                }
<script>
```
The response contains the id of the box and the jsonLD if data-createJsonLD is set to "true". <br />
**Example:**<br />
```html
<div class="IA_Box" data-dshash="Z1wBPe7" data-sub="true">
                <script>
                function downloadClick(response){
                    console.log("Download");
                    console.log(response);
                }
                function closeClick(response){
                    console.log("Close panel");
                    $("#panel-"+response["panelId"]).hide( "slow");
                }
                </script>
                <div class="IA_Btn" data-name="Download" data-icon="file_download" data-createjsonld="true" data-onclick=downloadClick></div>
                <div class="IA_Btn" data-name="Close" data-icon="close" data-createjsonld="false" data-onclick=closeClick></div>
</div>
```
# [Example Web Page](https://semantifyit.github.io/ia)