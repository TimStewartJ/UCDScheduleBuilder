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
      }), $("<p/>").text("Other Minimum Class Time"), //alternate input for time
        $("<input type='text' id='startTime2' name='startTime2' data-format='HH:mm' data-template='HH : mm'>"
      ), $("<p/>").text("Other Maximum Class Time"), //alternate input for time
        $("<input type='text' id='endTime2' name='endTime2' data-format='HH:mm' data-template='HH : mm'>"
      ), $("<br/>"), $("<br/>"), $("<input/>", { //submit button
        type: 'submit',
        id: 'submit',
        value: 'Submit'
      }))
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

      console.log($("#form :input").serializeArray());

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

      console.log(times);

      var term = "Fall Quarter 2020";

      $("div#form").append(
        $("<p/>").text("Your inputted classes are: " + classes) //appends their inputted classes
      )

      scheduler(classes, times, term); //schedules classes for 1 term
  });
});

var courseCodeIndex = 11;
var cRNIndex = 0;
var startTimeIndex = 1;
var endTimeIndex = 10;

//function that handles scheduling for one term
function scheduler(classes, times, term)
{
  //starts a fetch for the data for the term
  fetch('data\\' + term + ' Classes.csv')
  .then(response => response.text())
  .then((data) => {
    //all of the data in the csv will be stored in a string called rawData
    var rawData = $.csv.toArrays(data);
    var classesArray = CRNSearcher(rawData, classes); //fills up the classes array

    //console.log(getCombinations(classesArray));

    var initPopSize = 50;
    var timeWeight = 1;
    var generations = 10;
    var listCount = 8;
    var finalScheduleList = scheduleListGenetics(classesArray,initPopSize,times,timeWeight,generations,listCount);
    scheduleDisplayer(finalScheduleList[0][0], classesArray,term);
    //console.log(finalScheduleList);
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
      uniqueCRNperClass[j] = classesArray[i][j][cRNIndex];
    }
    uniqueCRN[i] = [...new Set(uniqueCRNperClass)];
  }
  return uniqueCRN;
}

//returns all of the CRNs with their times and course codes from an array of CRNs
function getCRNsWithTime(cRNs, classesArray)
{
  var cRNsWithTime = new Array();
  var cRNsWithTimeCoutner = 0;

  for(let i = 0; i < classesArray.length; i++)
  {
    for(let j = 0; j < classesArray[i].length; j++)
    {
      for(let k = 0; k < cRNs.length; k++)
      {
        if(classesArray[i][j][cRNIndex] === cRNs[k])
        {
          cRNsWithTime[cRNsWithTimeCoutner] = classesArray[i][j];
          cRNsWithTimeCoutner++;
        }
      }
    }
  }
  return cRNsWithTime;
}

//returns a given's schedule's time fitness
function getTimeData(cRNsWithTime, times, timeWeight)
{
  var maxTimeFitness = 0;
  var timeFitness = 0;
  var timeData = new Array();
  timeDataCounter = 0;

  //just checks to see if any classes are above the max time or below the min time
  for(let i = 0; i < cRNsWithTime.length; i++)
  {
    for(let j = startTimeIndex; j <= endTimeIndex; j++)
    {
      if(cRNsWithTime[i][j] != 0)
      {
        if(cRNsWithTime[i][j] > times[1] || cRNsWithTime[i][j] < times[0])
        {
          timeFitness++;
          timeDataCounter++;
          timeData[timeDataCounter] = cRNsWithTime[i][cRNIndex];
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
function getConflictFitness(cRNsWithTime)
{
  var conflicts = new Array();
  var cRNsLength = new Array();
  var conflictCounter = 0;

  //makes an array of the lengths of the classes in CRNSwithTime
  for(let i = 0; i < cRNsWithTime.length; i++)
  {
    cRNsLength[i] = new Array();
    for(let j = startTimeIndex; j <= endTimeIndex; j+=2)
    {
      cRNsLength[i][j] = cRNsWithTime[i][j+1] - cRNsWithTime[i][j];
    }
  }

  //checks for conflicts
  for(let i = 0; i < cRNsWithTime.length; i++)
  {
    for(let j = 0; j < cRNsWithTime.length; j++)
    {
      if(cRNsWithTime[i][cRNIndex] !== cRNsWithTime[j][cRNIndex])
      {
        for(let k = startTimeIndex; k <= endTimeIndex; k+=2)
        {
          if((cRNsWithTime[i][k] - cRNsWithTime[j][k] < cRNsLength[j][k] && cRNsWithTime[i][k] - cRNsWithTime[j][k] >= 0) || (cRNsWithTime[j][k] - cRNsWithTime[i][k] < cRNsLength[i][k] && cRNsWithTime[j][k] - cRNsWithTime[i][k] >= 0))
          {
            conflicts[conflictCounter] = cRNsWithTime[i][cRNIndex];
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
function Schedule(classesArray, cRNs, times, timeWeight)
{
  var cRNsWithTime = getCRNsWithTime(cRNs, classesArray);
  var timeData = getTimeData(cRNsWithTime, times, timeWeight);
  var conflicts = getConflictFitness(cRNsWithTime)
  this.conflicts = conflicts;
  this.conflictCount = conflicts.length;
  this.timeFitness = timeData[0];
  this.timeData = timeData.splice(1);
  this.CRNs = cRNs;
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

function scheduleDisplayer(scheduleToDisplay,classesArray,term)
{
  var tableID = (Math.random() + "ID").split(".")[1];
  var cRNsWithTime = getCRNsWithTime(scheduleToDisplay.CRNs,classesArray);
  $("div#form").append($("<h2/>").text("Schedule for " + term + ":"));
  $("div#form").append($("<p/>").text("Debug info: time fitness: " + scheduleToDisplay.timeFitness + " conflicts: " + scheduleToDisplay.conflictCount));
  $("div#form").append($("<table id=\"" + tableID + "\"/>").append("<tr> <th>Course Code</th> <th>CRN</th> <th>M Start</th> <th>M End</th> <th>T Start</th> <th>T End</th> <th>W Start</th> <th>W End</th> <th>R Start</th> <th>R End</th> <th>F Start</th> <th>F End</th> </tr>"));

  for(let i = 0; i < cRNsWithTime.length; i++)
  {
    var trString = tableID + "DICK" + i + "row";
    $("table#" + tableID).append($("<tr class='" + trString + "'><td>" + cRNsWithTime[i][courseCodeIndex] + "</td><td>" + cRNsWithTime[i][cRNIndex] + "</td>"));
    for(let j = startTimeIndex; j <= endTimeIndex; j++)
    {
      var time;
      if(cRNsWithTime[i][j] === "") time = "";
      else if(cRNsWithTime[i][j]%60 == 0) time = Math.floor(cRNsWithTime[i][j]/60) + ":" + cRNsWithTime[i][j]%60 + "0";
      else time = Math.floor(cRNsWithTime[i][j]/60) + ":" + cRNsWithTime[i][j]%60;
      $("tr." + trString).append($("<td/>").text(time));
    }
    $("table#" + tableID).append("</tr>");
  }
}
