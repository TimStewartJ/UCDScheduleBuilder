$(document).ready(function() {
  $("div#form").append(
    $("<form/>",{
      action:'#',
      method:'#'
    }).append( $("<p/>").text("Enter the classes you wish to take, each seperated by a comma."),
      $("<input/>", {
        type: 'text',
        id: 'classInput',
        name: 'input',
        placeholder: 'MAT 021A,DICK 069,AAS 010'
      }), $("<p/>").text("Desired Start Time"),
        $("<input/>", {
        type: 'time',
        id: 'startTime',
        name: 'startTime'
      }), $("<p/>").text("Desired End Time"),
        $("<input/>", {
        type: 'time',
        id: 'endTime',
        name: 'endTime'
      }), $("<br/>"), $("<br/>"), $("<input/>", {
        type: 'submit',
        id: 'submit',
        value: 'Submit'
      }))
    )
  $('#form').on('submit', function(e) {
      e.preventDefault();
      var classes = $("#form :input").serializeArray()[0].value.split(',');
      var startTime = $("#form :input").serializeArray()[1].value;
      var endTime = $("#form :input").serializeArray()[2].value;
      for(var i = 0; i < classes.length; i++) {
        classes[i] = classes[i].trim();
      }
      console.log(classes);
      console.log(startTime);
      console.log(endTime);
      scheduler(classes)
      $("div#form").append(
        $("<p/>").text(classes)
      )
  });
});

function scheduler(classes)
{

}
