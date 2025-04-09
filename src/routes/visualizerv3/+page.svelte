import React, { useState, useEffect } from 'react';

const DayTimeVisualizer = ({ 
  initialWorkHoursNeeded = 8, 
  initialBreakTimeWanted = 2, 
  initialSleepHours = 8, 
  initialBedTime = "23:00", 
  initialWakeTime = "07:00" 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workHoursNeeded, setWorkHoursNeeded] = useState(initialWorkHoursNeeded);
  const [breakTimeWanted, setBreakTimeWanted] = useState(initialBreakTimeWanted);
  const [sleepHours, setSleepHours] = useState(initialSleepHours);
  const [bedTime, setBedTime] = useState(initialBedTime);
  const [wakeTime, setWakeTime] = useState(initialWakeTime);
  
  // States for visualization
  const [segments, setSegments] = useState([]);
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [workMarkers, setWorkMarkers] = useState([]);
  const [hoursLeft, setHoursLeft] = useState(0);
  
  // Parse time string (HH:MM) to date object
  const parseTimeToDate = (timeString, date = new Date()) => {
    if (!timeString) return null;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  };
  
  // Determine if a time is between two other times (handles overnight periods)
  const isTimeBetween = (time, start, end) => {
    if (!start || !end) return false;
    
    if (end < start) { // Overnight period
      return time >= start || time < end;
    }
    return time >= start && time < end;
  };
  
  // Format hours to hours and minutes
  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };
  
  // Calculate angle for the arc based on hours (180 degrees = 12 hours)
  const calculateAngle = (hours) => {
    return (hours / 12) * 180;
  };
  
  // Convert polar coordinates to cartesian
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };
  
  // Generate SVG path for an arc
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };
  
  // Generate circular markers
  const generateMarkers = (count, radius) => {
    const markers = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 360;
      const coords = polarToCartesian(250, 250, radius, angle);
      markers.push({
        x: coords.x,
        y: coords.y,
        active: i < Math.ceil(workHoursNeeded)
      });
    }
    
    return markers;
  };
  
  // Auto-sync sleep hours when bed/wake times change
  useEffect(() => {
    // Only run if both times are provided
    if (bedTime && wakeTime) {
      const bedTimeObj = parseTimeToDate(bedTime);
      const wakeTimeObj = parseTimeToDate(wakeTime);
      
      if (bedTimeObj && wakeTimeObj) {
        let calculatedSleepHours;
        
        if (wakeTimeObj > bedTimeObj) {
          // Normal schedule
          calculatedSleepHours = (wakeTimeObj - bedTimeObj) / (1000 * 60 * 60);
        } else {
          // Overnight schedule
          calculatedSleepHours = (24 - (bedTimeObj - wakeTimeObj) / (1000 * 60 * 60));
        }
        
        // Round to nearest 0.5
        calculatedSleepHours = Math.round(calculatedSleepHours * 2) / 2;
        
        // Update sleep hours if it differs
        if (Math.abs(calculatedSleepHours - sleepHours) > 0.1) {
          setSleepHours(calculatedSleepHours);
        }
      }
    }
  }, [bedTime, wakeTime]);
  
  // Auto-sync wake/bed times when sleep hours change
  useEffect(() => {
    // Only adjust if we have a bed time but no wake time
    if (bedTime && !wakeTime && sleepHours) {
      const bedTimeObj = parseTimeToDate(bedTime);
      
      if (bedTimeObj) {
        const newWakeTime = new Date(bedTimeObj);
        newWakeTime.setHours(newWakeTime.getHours() + sleepHours);
        
        const hours = newWakeTime.getHours().toString().padStart(2, '0');
        const minutes = newWakeTime.getMinutes().toString().padStart(2, '0');
        setWakeTime(`${hours}:${minutes}`);
      }
    }
    // Only adjust if we have a wake time but no bed time
    else if (!bedTime && wakeTime && sleepHours) {
      const wakeTimeObj = parseTimeToDate(wakeTime);
      
      if (wakeTimeObj) {
        const newBedTime = new Date(wakeTimeObj);
        newBedTime.setHours(newBedTime.getHours() - sleepHours);
        
        const hours = newBedTime.getHours().toString().padStart(2, '0');
        const minutes = newBedTime.getMinutes().toString().padStart(2, '0');
        setBedTime(`${hours}:${minutes}`);
      }
    }
  }, [sleepHours, bedTime, wakeTime]);
  
  // Update visualization
  const updateTimeVisualization = () => {
    const now = currentTime;
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Calculate hours passed in the day
    const hoursPassed = (now - startOfDay) / (1000 * 60 * 60);
    
    // Calculate hours left in the day
    const newHoursLeft = 24 - hoursPassed;
    setHoursLeft(newHoursLeft);
    
    // Determine bed and wake times
    let bedTimeToday = null;
    let wakeTimeToday = null;
    
    if (bedTime) {
      bedTimeToday = parseTimeToDate(bedTime);
    }
    
    if (wakeTime) {
      wakeTimeToday = parseTimeToDate(wakeTime);
    }
    
    // Calculate time left before bed
    let hoursBeforeBed = null;
    if (bedTimeToday) {
      if (now < bedTimeToday) {
        hoursBeforeBed = (bedTimeToday - now) / (1000 * 60 * 60);
      } else {
        // Already past bedtime
        hoursBeforeBed = 0;
      }
    }
    
    // Calculate if we're in sleep time
    const inSleepTime = bedTimeToday && wakeTimeToday && isTimeBetween(now, bedTimeToday, wakeTimeToday);
    
    // Calculate remaining work and break time
    const remainingActiveHours = hoursBeforeBed !== null ? Math.max(0, hoursBeforeBed) : newHoursLeft;
    const workAndBreakNeeded = workHoursNeeded + breakTimeWanted;
    
    // Determine if there's enough time for all planned activities
    const timeDeficit = Math.max(0, workAndBreakNeeded - remainingActiveHours);
    
    // Adjust work and break time proportionally if there's a deficit
    let adjustedWorkHours = workHoursNeeded;
    let adjustedBreakHours = breakTimeWanted;
    
    if (timeDeficit > 0 && workAndBreakNeeded > 0) {
      const reductionFactor = remainingActiveHours / workAndBreakNeeded;
      adjustedWorkHours = workHoursNeeded * reductionFactor;
      adjustedBreakHours = breakTimeWanted * reductionFactor;
    }
    
    // Create segments for day visualization
    const newSegments = [
      { 
        type: 'past', 
        hours: hoursPassed, 
        color: '#D3D3D3', 
        label: 'Past', 
        startAngle: 0, 
        endAngle: calculateAngle(hoursPassed > 12 ? 12 : hoursPassed) 
      }
    ];
    
    // Add night segment if we're in the second half of the day
    if (hoursPassed > 12) {
      newSegments.push({
        type: 'past-night',
        hours: hoursPassed - 12,
        color: '#BEBEBE',
        label: 'Past (Night)',
        startAngle: 180,
        endAngle: 180 + calculateAngle(hoursPassed - 12)
      });
    }
    
    setSegments(newSegments);
    
    // Create time blocks for planning
    const newTimeBlocks = [];
    
    // Current status block
    newTimeBlocks.push({
      type: inSleepTime ? 'sleeping' : 'awake',
      label: inSleepTime ? 'Currently Sleeping' : 'Currently Awake',
      color: inSleepTime ? '#9370DB' : '#4682B4',
      hours: 0, // Current state, not hours
      urgent: false
    });
    
    // Remaining tasks blocks
    if (!inSleepTime) {
      if (timeDeficit > 0) {
        newTimeBlocks.push({
          type: 'warning',
          label: `Time Deficit`,
          color: '#FF6347',
          hours: timeDeficit,
          formatted: formatHours(timeDeficit),
          urgent: true
        });
      }
      
      newTimeBlocks.push({
        type: 'work',
        label: 'Work Time Available',
        color: '#4682B4',
        hours: adjustedWorkHours,
        formatted: formatHours(adjustedWorkHours),
        urgent: false
      });
      
      newTimeBlocks.push({
        type: 'break',
        label: 'Break Time Available',
        color: '#90EE90', 
        hours: adjustedBreakHours,
        formatted: formatHours(adjustedBreakHours),
        urgent: false
      });
      
      if (hoursBeforeBed !== null) {
        newTimeBlocks.push({
          type: 'until-bed',
          label: 'Time Until Bed',
          color: '#FFD700',
          hours: hoursBeforeBed,
          formatted: formatHours(hoursBeforeBed),
          urgent: hoursBeforeBed < 1
        });
      }
    }
    
    // Sleep block
    if (sleepHours > 0) {
      newTimeBlocks.push({
        type: 'sleep',
        label: 'Sleep Time',
        color: '#9370DB',
        hours: sleepHours,
        formatted: formatHours(sleepHours),
        urgent: false
      });
    }
    
    setTimeBlocks(newTimeBlocks);
    
    // Update work markers
    setWorkMarkers(generateMarkers(Math.ceil(workHoursNeeded + breakTimeWanted), 160));
  };
  
  // Update visualization when inputs change
  useEffect(() => {
    updateTimeVisualization();
  }, [currentTime, workHoursNeeded, breakTimeWanted, sleepHours, bedTime, wakeTime]);
  
  // Auto-update current time
  useEffect(() => {
    updateTimeVisualization();
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Generate hour markers
  const hourMarkers = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    angle: (i / 24) * 360,
    label: i.toString().padStart(2, '0') + ':00'
  }));
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Your Day Visualization</h2>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
        <p className="text-xl font-medium text-gray-700">{currentTime.toLocaleTimeString()}</p>
        <p className="text-gray-600">Hours left in day: {hoursLeft.toFixed(1)} hours</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="work-hours" className="block text-sm font-medium text-gray-700 mb-1">
              Work hours needed: {workHoursNeeded}
            </label>
            <input 
              id="work-hours" 
              type="range" 
              min="0" 
              max="16" 
              step="0.5" 
              value={workHoursNeeded}
              onChange={(e) => setWorkHoursNeeded(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div>
            <label htmlFor="break-time" className="block text-sm font-medium text-gray-700 mb-1">
              Break time wanted: {breakTimeWanted}
            </label>
            <input 
              id="break-time" 
              type="range" 
              min="0" 
              max="8" 
              step="0.5" 
              value={breakTimeWanted}
              onChange={(e) => setBreakTimeWanted(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="sleep-hours" className="block text-sm font-medium text-gray-700 mb-1">
              Sleep hours: {sleepHours}
            </label>
            <input 
              id="sleep-hours" 
              type="range" 
              min="4" 
              max="12" 
              step="0.5" 
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bed-time" className="block text-sm font-medium text-gray-700 mb-1">
                Bedtime:
              </label>
              <input 
                id="bed-time" 
                type="time" 
                value={bedTime}
                onChange={(e) => setBedTime(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="wake-time" className="block text-sm font-medium text-gray-700 mb-1">
                Wake time:
              </label>
              <input 
                id="wake-time" 
                type="time" 
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="relative">
          <svg viewBox="0 0 500 500" className="w-full h-auto">
            {/* Day arc (top semicircle) */}
            <path 
              d="M 50 250 A 200 200 0 0 1 450 250" 
              fill="none" 
              stroke="#E0E0E0" 
              strokeWidth="30"
            />
            
            {/* Night arc (bottom semicircle) */}
            <path 
              d="M 450 250 A 200 200 0 0 1 50 250" 
              fill="none" 
              stroke="#D0D0D0" 
              strokeWidth="30"
            />
            
            {/* Time segments */}
            {segments.map((segment, index) => (
              <path 
                key={index}
                d={describeArc(250, 250, 200, segment.startAngle, segment.endAngle)} 
                fill="none" 
                stroke={segment.color} 
                strokeWidth="30"
              />
            ))}
            
            {/* Work/Break unit circles */}
            {workMarkers.map((marker, i) => (
              <circle 
                key={i}
                cx={marker.x} 
                cy={marker.y} 
                r="10" 
                fill={marker.active ? (i < Math.ceil(workHoursNeeded) ? "#4682B4" : "#90EE90") : "#E0E0E0"}
                stroke="#FFF"
                strokeWidth="2"
              />
            ))}
            
            {/* Hour markers */}
            {hourMarkers.map((marker, index) => (
              <g key={index} transform={`rotate(${marker.angle} 250 250)`}>
                <line 
                  x1="250" 
                  y1="50" 
                  x2="250" 
                  y2="70" 
                  stroke="#333" 
                  strokeWidth="2"
                />
                <text 
                  x="250" 
                  y="45" 
                  textAnchor="middle" 
                  fontSize="12"
                  transform={`rotate(${-marker.angle} 250 45)`}
                >
                  {marker.label}
                </text>
              </g>
            ))}
            
            {/* Center text */}
            <text x="250" y="240" textAnchor="middle" fontSize="16" fontWeight="bold">
              {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </text>
            <text x="250" y="265" textAnchor="middle" fontSize="14">
              {currentTime.toLocaleDateString()}
            </text>
          </svg>
        </div>
        
        <div className="space-y-3">
          {timeBlocks.map((block, index) => (
            <div 
              key={index} 
              className={`flex items-center p-3 rounded-lg transition-all ${
                block.urgent 
                  ? 'bg-red-50 border-l-4 border-red-400' 
                  : 'bg-gray-50 hover:shadow-md hover:-translate-y-1'
              }`}
            >
              <div 
                className="w-5 h-5 rounded-full mr-4"
                style={{ backgroundColor: block.color }}
              ></div>
              <div className="flex-1">
                <div className="font-medium text-gray-800">{block.label}</div>
                {block.hours > 0 && (
                  <div className="text-sm text-gray-600">{block.formatted}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DayTimeVisualizer;