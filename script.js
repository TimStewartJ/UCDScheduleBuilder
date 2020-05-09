$(document).ready(function() {
  $("div#form").append(
    $("<form/>",{ //FORM creation
      action:'#',
      method:'#'
    }).append( $("<p/>").text("Enter the classes you wish to take, each seperated by a comma."), //INPUT for classes
      $("<input/>", {
        type: 'text',
        id: 'classInput',
        name: 'input',
        placeholder: 'MAT 021A,DICK 069,AAS 010' //example things
      }), $("<p/>").text("Desired Start Time"), //INPUT for minimum time
        $("<input/>", {
        type: 'time',
        id: 'startTime',
        name: 'startTime'
      }), $("<p/>").text("Desired End Time"), //input for maximum time
        $("<input/>", {
        type: 'time',
        id: 'endTime',
        name: 'endTime'
      }), $("<br/>"), $("<br/>"), $("<input/>", { //submit button
        type: 'submit',
        id: 'submit',
        value: 'Submit'
      }))
    )

  $('#form').on('submit', function(e) { //function for on submit
      e.preventDefault(); //prevents reloading of the page
      var classes = $("#form :input").serializeArray()[0].value.split(','); //gets an array of all desired classes
      var startTime = $("#form :input").serializeArray()[1].value; //gets a string of the start
      var endTime = $("#form :input").serializeArray()[2].value; //gets a string of the end time
      for (var i = 0; i < classes.length; i++) {
        classes[i] = classes[i].trim(); //trims all of the strings of the classes
      }
      //console logs for all inputs
      console.log(classes);
      console.log(startTime);
      console.log(endTime);

      scheduler(classes, startTime, endTime); //runs the scripts with all inputs
      
      $("div#form").append(
        $("<p/>").text(classes) //appends their input
      )
  });
});

function scheduler(classes)
{

}
