import dataPath from './data/202010.csv';

const courseCodeIndex = 11;
const crnIndex = 0;
const startTimeIndex = 1;
const endTimeIndex = 10;
const terms = [
  [202010,"Fall Quarter 2020"],
  [202001,"Winter Quarter 2020"],
  [202003,"Spring Quarter 2020"]
]

//function that handles scheduling for one term
const scheduler = (classes, times, term, whitelist, blacklist, pullAvailability, debugText, devString) =>
{
  const request = async () => {
    const response = await fetch(dataPath);
    const rawData = await response.text();

    let classesArray = getClassesArray(rawData, classes, whitelist, blacklist);

    var initPopSize = 50;
    var timeWeight = 1;
    var generations = 10;
    var listCount = 8; //try to keep list count even

    if(devString !== '') {
      let devStringSplit = devString.split(',');
      initPopSize = devStringSplit[0].trim();
      timeWeight = devStringSplit[1].trim();
      generations = devStringSplit[2].trim();
      listCount = devStringSplit[3].trim();
    }

    var finalScheduleList = scheduleListGenetics(classesArray,initPopSize,times,timeWeight,generations,listCount);
    return await finalScheduleList[0];
  }

  return request();
}

//takes in the raw data and the requested courses, then returns an array of 2D arrays of all possible classes of a course
function getClassesArray(rawData, classes, whitelist, blacklist)
{
  var classesArray = [];
  var whitelistCourseIndexes = [];
  rawData = rawData.split('\n');
  for(var i = 0; i < classes.length; i++)
  {
    var course = classes[i].trim();
    var outputData = [];

    for(var j = 0; j < rawData.length; j++)
    {
      let lineString = rawData[j].split(',');
      if(lineString[courseCodeIndex] !== undefined && lineString[courseCodeIndex].trim() === course.trim() && blacklist.indexOf(lineString[0]) < 0)
      {
        whitelist.forEach(whitelistedCRN => {
          if(whitelistedCRN === lineString[crnIndex]) whitelistCourseIndexes.push(i);
        });
        outputData.push(lineString);
      }
    }
    if(outputData.length === 0)
    {
      //something for when no classes are found
    }
    else classesArray[i] = outputData;
  }

  whitelistCourseIndexes.forEach(whitelistCourseIndex => {
    var tempArray = [];
    classesArray[whitelistCourseIndex].forEach(classArray => {
      if(!(whitelist.indexOf(classArray[0]) < 0)) tempArray.push(classArray);
    });
    classesArray[whitelistCourseIndex] = tempArray;
  });

  return classesArray;
}

//takes the classesArray and returns a 2D array of each class and all unique CRN's of each course
function getUniqueCRN(classesArray)
{
  var uniqueCRN = [];

  for(var i = 0; i < classesArray.length; i++)
  {
    var uniqueCRNperClass = [];
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
  var crnsWithTime = [];
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
  var timeData = [];
  let timeDataCounter = 0;

  //just checks to see if any classes are above the max time or below the min time
  for(let i = 0; i < crnsWithTime.length; i++)
  {
    for(let j = startTimeIndex; j <= endTimeIndex; j++)
    {
      if(crnsWithTime[i][j] !== 0)
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
  var conflicts = [];
  var crnsLength = [];
  var conflictCounter = 0;

  //makes an array of the lengths of the classes in CRNSwithTime
  for(let i = 0; i < crnsWithTime.length; i++)
  {
    crnsLength[i] = [];
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
  this.crnsWithTime = crnsWithTime;
}

//breeds two schedules, not used as of now, may have to be scrapped
function scheduleBreed(schedule1, schedule2)
{
  var schedule1Array = [];
  for(let i = 0; i < schedule1.CRNs.length; i++)
  {
    schedule1Array[i] = [];
    schedule1Array[i][0] = schedule1.CRNs[i];
    schedule1Array[i][1] = schedule1.conflicts.indexOf(schedule1.CRNs[i]);
    schedule1Array[i][2] = schedule1.timeData.indexOf(schedule1.CRNs[i]);
  }
  var schedule2Array = [];
  for(let i = 0; i < schedule2.CRNs.length; i++)
  {
    schedule2Array[i] = [];
    schedule2Array[i][0] = schedule2.CRNs[i];
    schedule2Array[i][1] = schedule2.conflicts.indexOf(schedule1.CRNs[i]);
    schedule2Array[i][2] = schedule2.timeData.indexOf(schedule1.CRNs[i]);
  }

  var finalCRNs = [];
  for(let i = 0; i < schedule1.CRNs.length; i++)
  {
    let whichScheduleForConflicts = -1;
    let whichScheduleForTime = -1;
    if(schedule1Array[i][1] === schedule2Array[i][1] && schedule2Array[i][1] === -1){} //no conficts
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

    if(schedule1Array[i][2] === schedule2Array[i][2] && schedule2Array[i][2] === -1){} //no time things
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

    if(whichScheduleForConflicts !== whichScheduleForTime)
    {
      if(whichScheduleForConflicts === 0) finalCRNs[i] = schedule1Array[i][0];
      else finalCRNs[i] = schedule2Array[i][0];
    }
    else
    {
      if(whichScheduleForConflicts === 0) finalCRNs[i] = schedule1Array[i][0];
      else finalCRNs[i] = schedule2Array[i][0];
    }
  }
  return finalCRNs;
}

//runs a genetic algorithm for the schedules, returns an array of size initPopSize of theoretically good schedules after going through a bunch of generations
function scheduleGenetics(classesArray, initPopSize, times, timeWeight, generations)
{
  var initPopulation = [];
  var uniqueCRN = getUniqueCRN(classesArray);

  //population initialization
  for(let i = 0; i < initPopSize; i++)
  {
    let tempCRN = [];
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
    while(leastConflictIndex < currentPop.length && currentPop[leastConflictIndex].conflictCount === leastConflicts)
    {
      leastConflictIndex++;
    }
    for(let j = leastConflictIndex; j < currentPop.length; j++)
    {
      let tempCRN = [];
      for(let k = 0; k < uniqueCRN.length; k++)
      {
        tempCRN[k] = uniqueCRN[k][Math.random()*uniqueCRN[k].length | 0];
      }
      currentPop[j] = new Schedule(classesArray, tempCRN, times, timeWeight);
    }
    //[...new Map(currentPop.map(item => [item['CRNs'], item])).values()] //get rid of dupes i think
    sortForFitness(currentPop);
  }
  //console.log(currentPop);
  return currentPop;
}

//takes two schedule arrays and returns one that takes the best of both
function scheduleListBreeder(scheduleList1, scheduleList2)
{
  var outputList = [];
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

//handles making schedule lists, returns a final good one
function scheduleListGenetics(classesArray, initPopSize, times, timeWeight, generations, listCount)
{
  var listArray = [];
  for(let i = 0; i < listCount; i++)
  {
    listArray[i] = scheduleGenetics(classesArray, initPopSize, times, timeWeight, generations);
  }
  while(listArray.length > 1)
  {
    let tempArray = [];
    for(let i = 0; i < listArray.length; i+=2)
    {
      tempArray.push(scheduleListBreeder(listArray[i],listArray[i+1]));
    }
    listArray = tempArray;
  }
  return listArray[0];
}

export default scheduler;