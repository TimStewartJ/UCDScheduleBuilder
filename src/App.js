import React, { useState } from 'react';
import useFullTimeSelector from './TimeSelector';
import ScheduleGeneratorRunner from './ScheduleGeneratorRunner';

const App = () => {
  const [courses, setCourses] = useState('');
  const [courseWarning, setCourseWarning] = useState({});
  const [startTime, StartTimeSelector] = useFullTimeSelector();
  const [endTime, EndTimeSelector] = useFullTimeSelector();
  const [whitelist, setWhitelist] = useState('');
  const [blacklist, setBlacklist] = useState('');
  const [debugText, setDebugText] = useState(false);
  const [devBool, setDevBool] = useState(false); //the boolean of whether or not the dev string input should be revealed
  const [devString, setDevString] = useState(''); //the string for developer inputs

  const handleSubmit = (event) => {
    event.preventDefault();

    let tempDevString = '';

    if(devBool) tempDevString = devString;

    ScheduleGeneratorRunner(courses, startTime, endTime, whitelist, blacklist, debugText, tempDevString);
  }

  const courseChecker = (value) => {
    if(!(RegExp(/(\s*(\w{3}) \d{1,3}\w{0,2}\s*)(,\s*(\w{3})\s\d{1,3}\w{0,2}\s*)*/).test(value))) setCourseWarning({display: 'block'});
    else setCourseWarning({display: 'none'});
    setCourses(value);
  }

  const content = devBool
    ? <div>
      <input
        type='text'
        name='dev'
        placeholder=''
        value={devString}
        onChange={event => setDevString(event.target.value)}
      />
      </div>
    : null;

	return (
    <form onSubmit={handleSubmit} autocomplete="off">
      <p>Enter the course codes of the classes you wish to take, each separated by a comma.</p>
      <input
        type='text'
        id='input'
        name='courses'
        placeholder='EX: MAT 021B, PHY 009A, CHE 002A'
        value={courses}
        onChange={event => courseChecker(event.target.value)}
      />
      <div style={ courseWarning }><p>Warning! Input invalid.</p></div>
      <p>CRN Whitelist</p>
      <input
        type='text'
        id='input'
        name='whitelist'
        placeholder='EX: 38618'
        value={whitelist}
        onChange={event => setWhitelist(event.target.value)}
      />
      <p>CRN Blacklist</p>
      <input
        type='text'
        id='input'
        name='blacklist'
        placeholder='EX: 38618'
        value={blacklist}
        onChange={event => setBlacklist(event.target.value)}
      />
      <p>Minimum Class Time</p>
      <StartTimeSelector />
      <p>Maximum Class Time</p>
      <EndTimeSelector />
      <br/>
      <p>Experimental Features</p>
      <label className='checkmarkContainer'>
        <input
          type='checkbox'
          id='debugText'
          name='debugText'
          value={debugText}
          onChange={event => setDebugText(!debugText)}
        />Enable Debug Text
        <span className='checkmark'></span>
      </label>
      <label className='checkmarkContainer'>
        <input
          type='checkbox'
          id='devBool'
          name='devBool'
          value={debugText}
          onChange={event => setDevBool(!devBool)}
        />Enable Dev Input
        <span className='checkmark'></span>
      </label>
      { content }
      <br/>
      <input
        type='submit'
        value='Submit'
      />
    </form>
  );
}

export default App;
