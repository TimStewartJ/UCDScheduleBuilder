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
      var startTime = $("#form :input").serializeArray()[1].value.split(':'); //gets a string of the start
      var endTime = $("#form :input").serializeArray()[2].value.split(':'); //gets a string of the end time
      startTime = (60*parseInt(startTime[0])) + parseInt(startTime[1]);
      endTime = (60*parseInt(endTime[0])) + parseInt(endTime[1]);
      var times = [startTime, endTime]; //makes an array of the start and end times
      for (var i = 0; i < classes.length; i++) {
        classes[i] = classes[i].trim(); //trims all of the strings of the classes
      }

      var term = "Fall Quarter 2020";

      $("div#form").append(
        $("<p/>").text("Your inputted classes are: " + classes) //appends their inputted classes
      )

      scheduler(classes, times, term); //schedules classes for 1 term
  });
});

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
    scheduleGenetics(classesArray,initPopSize,times,timeWeight);
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
      $("div#form").append($("<br/>"),$("<p/>").text("No Classes found for: " + course));
    }
    else classesArray[i] = outputData;
  }
  return classesArray;
}

//takes the classesArray (which is the array of 2d arrays of all classes) and returns the maximum number of unique schedules possible (KINDA USELESS btw)
function getCombinations(classesArray)
{
  var uniqueCRN = getUniqueCRN(classesArray);
  console.log(uniqueCRN);
  var leastClasses = getLeastClasses(uniqueCRN);

  var combinations = 0;
  for(var i = 0; i < leastClasses; i++)
  {
    var tempCombinations = 1;
    for(var j = 0; j < uniqueCRN.length; j++)
    {
      tempCombinations *= uniqueCRN[j].length - i;
    }
    combinations += tempCombinations;
  }
  return combinations;
}

//takes the uniqueCRN array and returns the number of CRNs that the course with the least has
function getLeastClasses(uniqueCRN)
{
  var leastClasses = 9999;
  for(var i = 0; i < uniqueCRN.length; i++)
  {
    if (uniqueCRN[i].length < leastClasses) leastClasses = uniqueCRN[i].length;
  }
  return leastClasses;
}

//takes the classesArray and returns a 2D array of each class and all unique CRN's of each course
function getUniqueCRN(classesArray)
{
  var uniqueCRN = new Array();
  var cRNIndex = 0;
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
  var cRNIndex = 0;
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
function getTimeFitness(cRNsWithTime, times, timeWeight)
{
  var startTimeIndex = 1;
  var endTimeIndex = 10;
  var cRNIndex = 0;

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
  var startTimeIndex = 1;
  var endTimeIndex = 10;
  var cRNIndex = 0;

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
  return currentPop;
}

//the schedule object, takes in classesArray, CRNs, times, to make a schedule object
function Schedule(classesArray, cRNs, times, timeWeight)
{
  var cRNsWithTime = getCRNsWithTime(cRNs, classesArray);
  var timeData = getTimeFitness(cRNsWithTime, times, timeWeight);
  var conflicts = getConflictFitness(cRNsWithTime)
  this.conflicts = conflicts;
  this.conflictCount = conflicts.length;
  this.timeFitness = timeData[0];
  this.timeData = timeData.splice(1);
  this.CRNs = cRNs;
}

//runs a genetic algorithm for the schedules (hopefully)
function scheduleGenetics(classesArray, initPopSize, times, timeWeight)
{
  var initPopulation = new Array();
  var uniqueCRN = getUniqueCRN(classesArray);

  //population initialization
  for(let i = 0; i < initPopSize; i++)
  {
    initPopulation[i] = new Array();
    var tempCRN = new Array();
    for(let j = 0; j < uniqueCRN.length; j++)
    {
      tempCRN[j] = uniqueCRN[j][Math.random()*uniqueCRN[j].length | 0];
    }
    initPopulation[i] = new Schedule(classesArray,tempCRN,times,timeWeight);
  }

  var popCount = initPopulation.length;
  var currentPop = initPopulation;
  //while(popCount > 1)
  //{
    currentPop = sortForFitness(currentPop);
    var tempPop = new Array();
    for(let i = 0; i < popCount/2; i++)
    {
      tempPop[i] = currentPop[i];
    }
    for(let i = 0; i < popCount/4; i++)
    {

    }
    popCount = currentPop.length;
  //}
  console.log(currentPop);
  return initPopulation;
}
