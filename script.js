$(document).ready(function() {
  $("div#form").append(
    $("<h3/>").text("this is test text"), $("<p/>").text("More test tesxt"), $("<form/>",{
      action:'#',
      method:'#'
    }).append(
      $("<input/>", {
        type: 'text',
        id: 'inputID',
        name: 'input',
        placeholder: 'MAT 021A,DICK 069'
      }), $("<br/>"), $("<input/>", {
        type: 'submit',
        id: 'submit',
        value: 'Submit'
      }))
    )
});
