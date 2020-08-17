import React, { useState } from 'react';

const useFullTimeSelector = () => {
  const [hour, HourSelector] = useTimeSelector('hour', 5, 23);
  const [minute, MinuteSelector] = useTimeSelector('minute', 0, 60);

  const FullTimeSelectorMaker = () => (
    <div>
    <HourSelector />
    <label> : </label>
    <MinuteSelector />
    </div>
  );

  return [hour + ':' + minute, FullTimeSelectorMaker];
}

const useTimeSelector = (defaultText, minTime, maxTime) => {
  const [time, setTime] = useState('');

  const options = [];

  for(var i = minTime; i < maxTime; i++) {
    options.push(<option value={i} key={i}>{i}</option>);
  }

  const TimeSelectorMaker = () => (
    <select value={time} onChange={event => setTime(event.target.value)}>
      <option defaultValue="">{defaultText}</option>
      {options}
    </select>
  );

  return [time, TimeSelectorMaker];
}

export default useFullTimeSelector;