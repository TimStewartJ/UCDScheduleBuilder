$(document).ready(function() {
  $("div#form").append(
    $("<form/>",{ //FORM creation
      action:'#',
      method:'#'
    }).append( $("<p/>").text("Enter the course codes of the classes you wish to take, each seperated by a comma."), //INPUT for classes
      $("<input/>", {
        type: 'text',
        id: 'input',
        name: 'input',
        placeholder: 'EX: MAT 021B, PHY 009A, CHE 002A' //example things
      // OLD time inputs
      // }), $("<p/>").text("Minimum Class Time"), //INPUT for minimum time
      //   $("<input/>", {
      //   type: 'time',
      //   id: 'startTime',
      //   name: 'startTime'
      // }), $("<p/>").text("Maximum Class Time"), //input for maximum time
      //   $("<input/>", {
      //   type: 'time',
      //   id: 'endTime',
      //   name: 'endTime'
      }),
        $("<p/>").text("Other Minimum Class Time"), //alternate input for time
        $("<input type='text' id='startTime2' name='startTime2' data-format='HH:mm' data-template='HH : mm'>"),
        $("<p/>").text("Other Maximum Class Time"), //alternate input for time
        $("<input type='text' id='endTime2' name='endTime2' data-format='HH:mm' data-template='HH : mm'>"),

        $("<p/>").text("Experimental Features!"), //alternate input for time

        $("<input type='checkbox' id='pullAvailability' name='pullAvailability'>"),
        $("<label for='pullAvailability'>Pull Class Availability</label>"),
        $("<input type='checkbox' id='debugText' name='debugText'>"),
        $("<label for='debugText'>Enable Debug Text</label>"),

        //$("<input type='checkbox' id='pullAvailability' name='pullAvailability'>"),
        //$("<label for='pullAvailability'>Pull Class Availability</label>"),

        $("<br/>"), $("<br/>"),
        $("<input/>", { //submit button
        type: 'submit',
        id: 'submit',
        value: 'Submit'
      })
    )
  );

  $('#startTime2').combodate({
    firstItem: 'name',
    minuteStep: 1
  });
  $('#endTime2').combodate({
    firstItem: 'name',
    minuteStep: 1
  });

  $('#form').on('submit', function(e) { //function for on submit
      e.preventDefault(); //prevents reloading of the page

      var classes = $("#form :input").serializeArray()[0].value.split(','); //gets an array of all desired classes
      //OLD time input
      //var startTime = $("#form :input").serializeArray()[1].value.split(':'); //gets a string of the start
      //var endTime = $("#form :input").serializeArray()[2].value.split(':'); //gets a string of the end time
      var startTime2 = $("#form :input").serializeArray()[1].value.split(':');
      var endTime2 = $("#form :input").serializeArray()[2].value.split(':');
      startTime = (60*parseInt(startTime2[0])) + parseInt(startTime2[1]);
      endTime = (60*parseInt(endTime2[0])) + parseInt(endTime2[1]);
      var times = [startTime, endTime]; //makes an array of the start and end times
      for (var i = 0; i < classes.length; i++) {
        classes[i] = classes[i].trim(); //trims all of the strings of the classes
      }
      var pullAvailability = $("#pullAvailability")[0].checked;
      var debugText = $("#debugText")[0].checked;
      var term = 0;

      $("div#form").append(
        $("<p/>").text("Your inputted classes are: " + classes) //appends their inputted classes
      )

      scheduler(classes, times, term, pullAvailability, debugText); //schedules classes for 1 term
  });
});

var courseCodeIndex = 11;
var crnIndex = 0;
var startTimeIndex = 1;
var endTimeIndex = 10;
var terms = [
  [202010,"Fall Quarter 2020"],
  [202003,"Spring Quarter 2020"],
  [202001,"Winter Quarter 2020"]
]

//function that handles scheduling for one term
function scheduler(classes, times, term, pullAvailability, debugText)
{
  //starts a fetch for the data for the term
  fetch('data\\' + terms[term][1] + ' Classes.csv')
  .then(response => response.text())
  .then((data) => {
    //all of the data in the csv will be stored in a string called rawData
    var rawData = $.csv.toArrays(data);
    var classesArray = CRNSearcher(rawData, classes); //fills up the classes array

    var initPopSize = 50;
    var timeWeight = 1;
    var generations = 10;
    var listCount = 8;
    var finalScheduleList = scheduleListGenetics(classesArray,initPopSize,times,timeWeight,generations,listCount);
    scheduleDisplayer(finalScheduleList[0][0],classesArray,term,pullAvailability,debugText);
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
      $("div#form").append($("<br/>"),$("<p/>").text("No Classes found for: " + course));
    }
    else classesArray[i] = outputData;
  }
  return classesArray;
}

//takes the classesArray and returns a 2D array of each class and all unique CRN's of each course
function getUniqueCRN(classesArray)
{
  var uniqueCRN = new Array();

  for(var i = 0; i < classesArray.length; i++)
  {
    var uniqueCRNperClass = new Array();
    for(var j = 0; j < classesArray[i].length; j++)
    {
      uniqueCRNperClass[j] = classesArray[i][j][crnIndex];
    }
    uniqueCRN[i] = [...new Set(uniqueCRNperClass)];
  }
  return uniqueCRN;
}

//returns all of the CRNs with their times and course codes from an array of CRNs
function getCRNsWithTime(crns, classesArray)
{
  var crnsWithTime = new Array();
  var crnsWithTimeCoutner = 0;

  for(let i = 0; i < classesArray.length; i++)
  {
    for(let j = 0; j < classesArray[i].length; j++)
    {
      for(let k = 0; k < crns.length; k++)
      {
        if(classesArray[i][j][crnIndex] === crns[k])
        {
          crnsWithTime[crnsWithTimeCoutner] = classesArray[i][j];
          crnsWithTimeCoutner++;
        }
      }
    }
  }
  return crnsWithTime;
}

//returns a given's schedule's time fitness
function getTimeData(crnsWithTime, times, timeWeight)
{
  var maxTimeFitness = 0;
  var timeFitness = 0;
  var timeData = new Array();
  timeDataCounter = 0;

  //just checks to see if any classes are above the max time or below the min time
  for(let i = 0; i < crnsWithTime.length; i++)
  {
    for(let j = startTimeIndex; j <= endTimeIndex; j++)
    {
      if(crnsWithTime[i][j] != 0)
      {
        if(crnsWithTime[i][j] > times[1] || crnsWithTime[i][j] < times[0])
        {
          timeFitness++;
          timeDataCounter++;
          timeData[timeDataCounter] = crnsWithTime[i][crnIndex];
        }
        maxTimeFitness++;
      }
    }
  }

  timeData[0] = (timeFitness / maxTimeFitness) * timeWeight;
  timeData = [...new Set(timeData)];
  return timeData;
}

//returns the number of conflicts in CRNS with time
function getConflictFitness(crnsWithTime)
{
  var conflicts = new Array();
  var crnsLength = new Array();
  var conflictCounter = 0;

  //makes an array of the lengths of the classes in CRNSwithTime
  for(let i = 0; i < crnsWithTime.length; i++)
  {
    crnsLength[i] = new Array();
    for(let j = startTimeIndex; j <= endTimeIndex; j+=2)
    {
      crnsLength[i][j] = crnsWithTime[i][j+1] - crnsWithTime[i][j];
    }
  }

  //checks for conflicts
  for(let i = 0; i < crnsWithTime.length; i++)
  {
    for(let j = 0; j < crnsWithTime.length; j++)
    {
      if(crnsWithTime[i][crnIndex] !== crnsWithTime[j][crnIndex])
      {
        for(let k = startTimeIndex; k <= endTimeIndex; k+=2)
        {
          if((crnsWithTime[i][k] - crnsWithTime[j][k] < crnsLength[j][k] && crnsWithTime[i][k] - crnsWithTime[j][k] >= 0) || (crnsWithTime[j][k] - crnsWithTime[i][k] < crnsLength[i][k] && crnsWithTime[j][k] - crnsWithTime[i][k] >= 0))
          {
            conflicts[conflictCounter] = crnsWithTime[i][crnIndex];
            conflictCounter++;
          }
        }
      }
    }
  }
  return conflicts;
}

function sortForFitness(currentPop)
{
  currentPop.sort((a, b) => parseFloat(a.timeFitness) - parseFloat(b.timeFitness));
  currentPop.sort((a, b) => parseFloat(a.conflictCount) - parseFloat(b.conflictCount));
}

//the schedule object, takes in classesArray, CRNs, times, to make a schedule object
function Schedule(classesArray, crns, times, timeWeight)
{
  var crnsWithTime = getCRNsWithTime(crns, classesArray);
  var timeData = getTimeData(crnsWithTime, times, timeWeight);
  var conflicts = getConflictFitness(crnsWithTime)
  this.conflicts = conflicts;
  this.conflictCount = conflicts.length;
  this.timeFitness = timeData[0];
  this.timeData = timeData.splice(1);
  this.CRNs = crns;
}

function scheduleBreed(schedule1, schedule2)
{
  var schedule1Array = new Array();
  for(let i = 0; i < schedule1.CRNs.length; i++)
  {
    schedule1Array[i] = new Array();
    schedule1Array[i][0] = schedule1.CRNs[i];
    schedule1Array[i][1] = schedule1.conflicts.indexOf(schedule1.CRNs[i]);
    schedule1Array[i][2] = schedule1.timeData.indexOf(schedule1.CRNs[i]);
  }
  var schedule2Array = new Array();
  for(let i = 0; i < schedule2.CRNs.length; i++)
  {
    schedule2Array[i] = new Array();
    schedule2Array[i][0] = schedule2.CRNs[i];
    schedule2Array[i][1] = schedule2.conflicts.indexOf(schedule1.CRNs[i]);
    schedule2Array[i][2] = schedule2.timeData.indexOf(schedule1.CRNs[i]);
  }

  var finalCRNs = new Array();
  for(let i = 0; i < schedule1.CRNs.length; i++)
  {
    let whichScheduleForConflicts = -1;
    let whichScheduleForTime = -1;
    if(schedule1Array[i][1] == schedule2Array[i][1] && schedule2Array[i][1] == -1){} //no conficts
    else
    {
      if(schedule1Array[i][1] < schedule2Array[i][1])
      {
        whichScheduleForConflicts = 0;
      }
      else
      {
        whichScheduleForConflicts = 1;
      }
    }

    if(schedule1Array[i][2] == schedule2Array[i][2] && schedule2Array[i][2] == -1){} //no time things
    else
    {
      if(schedule1Array[i][2] < schedule2Array[i][2])
      {
        whichScheduleForTime = 0;
      }
      else
      {
        whichScheduleForTime = 1;
      }
    }

    if(whichScheduleForConflicts != whichScheduleForTime)
    {
      if(whichScheduleForConflicts == 0) finalCRNs[i] = schedule1Array[i][0];
      else finalCRNs[i] = schedule2Array[i][0];
    }
    else
    {
      if(whichScheduleForConflicts == 0) finalCRNs[i] = schedule1Array[i][0];
      else finalCRNs[i] = schedule2Array[i][0];
    }
  }
  return finalCRNs;
}

//runs a genetic algorithm for the schedules (hopefully)
function scheduleGenetics(classesArray, initPopSize, times, timeWeight, generations)
{
  var initPopulation = new Array();
  var uniqueCRN = getUniqueCRN(classesArray);

  //population initialization
  for(let i = 0; i < initPopSize; i++)
  {
    let tempCRN = new Array();
    for(let j = 0; j < uniqueCRN.length; j++)
    {
      tempCRN[j] = uniqueCRN[j][Math.random()*uniqueCRN[j].length | 0];
    }
    initPopulation[i] = new Schedule(classesArray,tempCRN,times,timeWeight);
  }

  sortForFitness(initPopulation);
  var currentPop = initPopulation;

  for(let i = 0; i < generations; i++)
  {
    let leastConflictIndex = 0;
    let leastConflicts = currentPop[0].conflictCount;
    while(leastConflictIndex < currentPop.length && currentPop[leastConflictIndex].conflictCount == leastConflicts)
    {
      leastConflictIndex++;
    }
    for(let j = leastConflictIndex; j < currentPop.length; j++)
    {
      let tempCRN = new Array();
      for(let k = 0; k < uniqueCRN.length; k++)
      {
        tempCRN[k] = uniqueCRN[k][Math.random()*uniqueCRN[k].length | 0];
      }
      currentPop[j] = new Schedule(classesArray, tempCRN, times, timeWeight);
    }
    [...new Map(currentPop.map(item => [item['CRNs'], item])).values()] //get rid of dupes i think
    sortForFitness(currentPop);
  }
  //console.log(currentPop);
  return currentPop;
}

function scheduleListBreeder(scheduleList1, scheduleList2)
{
  outputList = new Array();
  for(let i = 0; i < scheduleList1.length/2; i++)
  {
    outputList.push(scheduleList1[i]);
  }
  for(let i = 0; i < scheduleList2.length/2; i++)
  {
    outputList.push(scheduleList2[i]);
  }
  sortForFitness(outputList);
  return outputList;
}

function scheduleListGenetics(classesArray, initPopSize, times, timeWeight, generations, listCount)
{
  var listArray = new Array();
  for(let i = 0; i < listCount; i++)
  {
    listArray[i] = scheduleGenetics(classesArray, initPopSize, times, timeWeight, generations);
  }
  while(listArray.length > 1)
  {
    let tempArray = new Array();
    for(let i = 0; i < listArray.length; i+=2)
    {
      tempArray.push(scheduleListBreeder(listArray[i],listArray[i+1]));
    }
    listArray = tempArray;
  }
  return listArray;
}

function scheduleDisplayer(scheduleToDisplay,classesArray,term,pullAvailability,debugText)
{
  var tableID = (Math.random() + "ID").split(".")[1];
  var crnsWithTime = getCRNsWithTime(scheduleToDisplay.CRNs,classesArray);
  var crnBlacklist = new Array();
  var debugInfo = "";
  if (debugText)
  {
    debugInfo = "Debug info: time fitness: " + scheduleToDisplay.timeFitness + " conflicts: " + scheduleToDisplay.conflictCount;
  }
  $("div#form").append($("<h2/>").text("Schedule for " + terms[0][1] + ":"));
  $("div#form").append($("<p/>").text(debugInfo));
  $("div#form").append($("<table id=\"" + tableID + "\"/>").append("<tr> <th>Course Code</th> <th>CRN</th> <th>M Start</th> <th>M End</th> <th>T Start</th> <th>T End</th> <th>W Start</th> <th>W End</th> <th>R Start</th> <th>R End</th> <th>F Start</th> <th>F End</th> <th>Available Seats</th> </tr>"));

  for(let i = 0; i < crnsWithTime.length; i++)
  {
    var trID = tableID + "SUB" + i + "row";
    $("table#" + tableID).append($("<tr class='" + trID + "'><td>" + crnsWithTime[i][courseCodeIndex] + "</td><td>" + crnsWithTime[i][crnIndex] + "</td>"));
    for(let j = startTimeIndex; j <= endTimeIndex; j++)
    {
      var time;
      if(crnsWithTime[i][j] === "") time = "";
      else if(crnsWithTime[i][j]%60 == 0) time = Math.floor(crnsWithTime[i][j]/60) + ":" + crnsWithTime[i][j]%60 + "0";
      else time = Math.floor(crnsWithTime[i][j]/60) + ":" + crnsWithTime[i][j]%60;
      $("tr." + trID).append($("<td/>").text(time));
    }

    if(crnBlacklist.indexOf(crnsWithTime[i][crnIndex]) < 0)
    {
      if(pullAvailability) getAndPrintAvailabilityData(crnsWithTime[i][crnIndex],term,trID);
      crnBlacklist.push(crnsWithTime[i][crnIndex]);
    }

    $("table#" + tableID).append("</tr>");
  }
}

function getAndPrintAvailabilityData(crn,term,trID)
{
  var termCode = terms[term][0];
  var url = "https://cors-anywhere.herokuapp.com/https://registrar-apps.ucdavis.edu/courses/search/course.cfm?";
  var crnUrl = "crn=" + crn;
  var termCodeUrl = "&termCode=" + termCode;
  var output = new Array();
  fetch(url + crnUrl + termCodeUrl)
    .then(res => res.text())
    .then(data => {
      var tempAvailableSeats = data.slice(data.indexOf("Available Seats"), data.indexOf("Maximum Enrollment"));
      var availableSeats = tempAvailableSeats.slice(tempAvailableSeats.indexOf("ong>") + 4, tempAvailableSeats.indexOf("</td>")).trim();
      output[0] = parseInt(availableSeats);

      var tempMaxSeats = data.slice(data.indexOf("Maximum Enrollment"), data.indexOf("Meeting Times"));
      var maximumSeats = tempMaxSeats.slice(tempMaxSeats.indexOf("ong>") + 4, tempMaxSeats.indexOf("</td>")).trim();
      output[1] = parseInt(maximumSeats);

      $("tr." + trID).append($("<td/>").text(output[0]));
      return output;
    });
}
