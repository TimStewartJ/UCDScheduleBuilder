import scheduler from './ScheduleGenerator';

//for the display
import React from 'react';
import ReactDOM from 'react-dom';
import './scheduledisplay.css'

const ScheduleGeneratorRunner = (courses, startTime, endTime, whitelist, blacklist, debugText, devString) => {
    //turns the inputted time strings into the ints that the schedule generator uses
    var times = [
      startTime.split(':')[0] * 60 + startTime.split(':')[1], 
      endTime.split(':')[0] * 60 + endTime.split(':')[1]
    ];

    //splits the courses inputted to get a useable array
    let classes = courses.split(',');

    //input formatting for whitelist and blacklist
    whitelist = whitelist.split(',');
    blacklist = blacklist.split(',');
    whitelist = whitelist.map(s => s.trim());
    blacklist = blacklist.map(s => s.trim());

    //runs the schedule generator in a wrapper async function to wait for the promise
    const scheduleWrapper = async () => {
        let tempDevString = '';
        if(devString !== '') tempDevString = devString;
        let schedule = await scheduler(classes, times, 202010, whitelist, blacklist, false, debugText, tempDevString);
        //console.log(schedule);
        ReactDOM.render(
            <DisplaySchedule schedule={schedule} />,
            document.getElementById('output')
        );
    }

    scheduleWrapper();
}

const DisplaySchedule = (schedule) => {

    let crnString = '';
    schedule.schedule.CRNs.forEach(element => {
        crnString += element + ", ";
    });

    if(schedule.schedule.debugText) crnString += " Conflicts: " + schedule.schedule.conflictCount + " Time Fitness: " + schedule.schedule.timeFitness;

    const colorArray = [
        "Aquamarine",
        "Beige",
        "LightBlue",
        "LightCyan",
        "Cornsilk",
        "LightSkyBlue"
    ];

    const daysOfTheWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
    ];

    const hourBorderStyle = '1px solid black';
    const halfHourBorderStyle = '1px dotted black';

    const backgroundColor = "#212121";
    const headerColor = "#3d3d3d";
    const courseFontColor = "#1a1a1a";

    const rowHeightNumber = 18;
    const rowHeight = rowHeightNumber + "px";

    let colorDict = {};

    for(let i = 0; i < schedule.schedule.CRNs.length; i++) {
        colorDict[schedule.schedule.CRNs[i]] = colorArray[i];
    }

    //the column for time
    let timeColumn = [];
    timeColumn.push(
        <div style={{backgroundColor: headerColor}}>
            Time
        </div>
    )
    for(let i = 300; i <= 1410; i += 30) {
        let timeRightSide = (i - Math.floor(i/60)*60)/10;
        let timeString = Math.floor(i/60) + ":" + timeRightSide + "0";

        let borderTopString = '';
        let borderBottomString = '';

        if(timeRightSide === 0) 
        {
            borderTopString = hourBorderStyle;
            borderBottomString = halfHourBorderStyle;
        }
        else timeString = '';

        timeColumn.push(
            <div style={{height: rowHeight, textAlign: "right", borderTop: borderTopString, borderBottom: borderBottomString, position: "relative", paddingRight: "2%"}}> { timeString } </div>
        );
    }

    //the columns for the days of the week
    let dayColumns = [];
    for(let j = 0; j < 5; j++) {
        let tempColumn = [];

        tempColumn.push(
            <div style={{backgroundColor: headerColor}}>
                { daysOfTheWeek[j] }
            </div>
        )
        
        for(let i = 300; i <= 1410; i += 30) {
            let timeRightSide = (i - Math.floor(i/60)*60)/10;
            //let timeString = Math.floor(i/60) + ":" + timeRightSide + "0";

            let borderTopString = '';
            let borderBottomString = '';
            if(timeRightSide === 0) 
            {
            borderTopString = hourBorderStyle;
            borderBottomString = halfHourBorderStyle;
            }

            let courseBox = '';

            schedule.schedule.crnsWithTime.forEach(crnWithTime => {
                let courseStartTime = crnWithTime[1 + (j * 2)];
                if (courseStartTime - i >= 0 && courseStartTime - i < 30) {
                    let courseTimeRightSide = (courseStartTime - Math.floor(courseStartTime/60)*60)/10;
                    let topOffset = '';
                    if(timeRightSide === 3) topOffset = ((courseTimeRightSide - 3) * rowHeightNumber / 3) + "px";
                    else topOffset = (courseTimeRightSide * rowHeightNumber / 3) + "px";
                    let boxHeight = ((crnWithTime[2 + (j * 2)] - courseStartTime) / 30 * rowHeightNumber);

                    let boxContent = crnWithTime[11] + " - " + crnWithTime[0];
                    if (boxHeight < rowHeightNumber) boxContent = '';

                    courseBox = (
                        <div style={{position: "absolute", backgroundColor: colorDict[crnWithTime[0]], top: topOffset, zIndex: "10", border: "1px solid black", height: boxHeight + "px", width: "85%", paddingLeft: "2.5%", paddingRight: "2.5%"}}>
                            { boxContent }
                        </div>
                    );
                }
            });

            tempColumn.push(
                <div style={{height: rowHeight, borderTop: borderTopString, borderBottom: borderBottomString, position: "relative", paddingLeft: "5%", paddingRight: "5%", color: courseFontColor}}> 
                    { courseBox }
                </div>
            );
        }

        dayColumns.push(
            <div id={daysOfTheWeek[j] + "-column" } className="display-column" style={{width: "17.8%"}}>
                { tempColumn }
            </div>
        );
    }

    return (
        <>
        <p>CRNs: { crnString }</p>
        <div id="week-display-container" style={{width: "70%", backgroundColor: backgroundColor, overflow: "auto", height: "600px"}}>
            <div id="time-column" className="display-column" style={{width: "9%"}}>
                { timeColumn }
            </div>
            { dayColumns }
        </div>
        </>
    );
}

export default ScheduleGeneratorRunner;