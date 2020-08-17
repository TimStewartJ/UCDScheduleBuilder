import React, { useState } from 'react';
import useFullTimeSelector from './TimeSelector';

const App = () => {
  const [courses, setCourses] = useState('');
  const [startTime, StartTimeSelector] = useFullTimeSelector();
  const [endTime, EndTimeSelector] = useFullTimeSelector();
  const [debugText, setDebugText] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(courses + " | " + startTime + " | " + endTime + " | " + debugText + " | ");
  }

	return (
    <form onSubmit={handleSubmit}>
      <p>Enter the course codes of the classes you wish to take, each seperated by a comma.</p>
      <input
        type='text'
        id='input'
        name='courses'
        placeholder='EX: MAT 021B, PHY 009A, CHE 002A'
        value={courses}
        onChange={event => setCourses(event.target.value)}
      />
      <p>Minimum Class Time</p>
      <StartTimeSelector />
      <p>Maximum Class Time</p>
      <EndTimeSelector />
      <p>Experimental Features</p>
      <label>
        <input
          type='checkbox'
          id='debugText'
          name='debugText'
          value={debugText}
          onChange={event => setDebugText(!debugText)}
        />Enable Debug Text
      </label>
      <br/>
      <input
        type='submit'
        value='Submit'
      />
    </form>
  );
}

export default App;
