import React, { useState, useEffect } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Checkbox, Box, LinearProgress } from '@mui/material';
import { format, parse, isAfter, isBefore } from 'date-fns';

const DailySchedule = ({ dayData }) => {
  const [completedActivities, setCompletedActivities] = useState({});
  
  useEffect(() => {
    // Load completed activities from localStorage
    const savedActivities = localStorage.getItem(`completedActivities-day${dayData.day}`);
    if (savedActivities) {
      setCompletedActivities(JSON.parse(savedActivities));
    } else {
      // Initialize empty object for new day
      setCompletedActivities({});
    }
    
    // Update UI every minute to refresh current activity highlighting
    const interval = setInterval(() => {
      // Force a re-render
      setCompletedActivities(prev => ({...prev}));
    }, 60000);
    
    return () => clearInterval(interval);
  }, [dayData.day]);
  
  useEffect(() => {
    // Save to localStorage whenever completedActivities changes
    localStorage.setItem(
      `completedActivities-day${dayData.day}`, 
      JSON.stringify(completedActivities)
    );
  }, [completedActivities, dayData.day]);
  
  const handleToggleActivity = (time) => {
    setCompletedActivities(prev => ({
      ...prev,
      [time]: !prev[time]
    }));
  };
  
  const parseTimeString = (timeStr) => {
    // Handle time ranges like "6:00-6:45 AM"
    if (timeStr.includes('-')) {
      return timeStr.split('-')[0].trim();
    }
    return timeStr;
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    const totalActivities = dayData.schedule.length;
    const completed = Object.values(completedActivities).filter(Boolean).length;
    return (completed / totalActivities) * 100;
  };
  
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Daily Schedule - Day {dayData.day}
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Daily Progress: {Math.round(calculateProgress())}%
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={calculateProgress()} 
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>
      
      <List>
        {dayData.schedule.map((item, index) => {
          const now = new Date();
          const today = format(now, 'MM/dd/yyyy');
          
          const isCurrentActivity = (timeStr) => {
            try {
              // Parse the start time
              const parsedTime = parse(
                parseTimeString(timeStr), 
                'h:mm a', 
                new Date()
              );
              
              // For end time, either use the end of a range or add 1 hour to single time
              let endTime;
              if (timeStr.includes('-')) {
                const endTimeStr = timeStr.split('-')[1].trim();
                endTime = parse(`${today} ${endTimeStr}`, 'MM/dd/yyyy h:mm a', new Date());
              } else {
                endTime = new Date(parsedTime);
                endTime.setHours(endTime.getHours() + 1);
              }
              
              // Check if current time is between start and end
              return !isBefore(now, parsedTime) && !isAfter(now, endTime);
            } catch (error) {
              console.error("Error parsing time:", error);
              return false;
            }
          };
          
          const isActive = isCurrentActivity(item.time);
          
          return (
            <ListItem 
              key={index} 
              sx={{ 
                borderLeft: isActive ? '4px solid #4caf50' : 'none',
                bgcolor: isActive ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                borderRadius: 1,
                mb: 1
              }}
            >
              <Checkbox 
                checked={!!completedActivities[item.time]} 
                onChange={() => handleToggleActivity(item.time)}
                color="primary"
              />
              <ListItemText 
                primary={
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      textDecoration: completedActivities[item.time] ? 'line-through' : 'none',
                      fontWeight: isActive ? 'bold' : 'normal'
                    }}
                  >
                    {item.time}
                  </Typography>
                } 
                secondary={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      textDecoration: completedActivities[item.time] ? 'line-through' : 'none',
                      color: isActive ? 'text.primary' : 'text.secondary'
                    }}
                  >
                    {item.activity}
                  </Typography>
                } 
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};

export default DailySchedule;
