$(document).ready(function() {
  $("div#form").append(
    $("<form/>",{ //FORM creation
      action:'#',
      method:'#'
    }).append( $("<p/>").text("Enter the classes you wish to take, each seperated by a comma."), //INPUT for classes
      $("<input/>", {
        type: 'text',
        id: 'input',
        name: 'input',
        placeholder: 'MAT 021A, DICK 069, AAS 010' //example things
      }), $("<p/>").text("Minimum Class Time"), //INPUT for minimum time
        $("<input/>", {
        type: 'time',
        id: 'startTime',
        name: 'startTime'
      }), $("<p/>").text("Maximum Class Time"), //input for maximum time
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
      // console logs for all inputs
      // console.log(classes);
      // console.log(startTime);
      // console.log(endTime);
      var term = "Fall Quarter 2020";

      scheduler(classes, startTime, endTime, term); //schedules classes for 1 term

      $("div#form").append(
        $("<p/>").text("Your inputted classes are: " + classes) //appends their inputted classes
      )
  });
});

function scheduler(classes, startTime, endTime, term)
{
  //starts a fetch for the data for the term
  fetch('data\\' + term + ' Classes.csv')
  .then(response => response.text())
  .then((data) => {
    //all of the data in the csv will be stored in a string called rawData
    var rawData = $.csv.toArrays(data);
    var classesArray = CRNSearcher(rawData, classes); //fills up the classes array


  })
}

//takes in the raw data and the requested courses, then returns an array of 2D arrays of all possible classes of a course
function CRNSearcher(rawData, classes)
{
  var classesArray = new Array();
  for(var i = 0; i < classes.length; i++)
  {
    var course = classes[i];
    var outputData = new Array();
    var outputCounter = 0;
    var courseCodeIndex = 11; //the index of the csv that holds the course code
    for(var j = 0; j < rawData.length; j++)
    {
      if(rawData[j][courseCodeIndex] === course)
      {
        outputData[outputCounter] = rawData[j];
        outputCounter++;
      }
    }
    if(outputData.length == 0)
    {
      classesArray[i] = "No Classes found for: " + course;
      $("div#form").append($("<br/>"),$("<p/>").text(classesArray[i]));
    }
    else classesArray[i] = outputData;
  }
  return classesArray;
}
