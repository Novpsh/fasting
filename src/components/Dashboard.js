import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Grid, Button } from '@mui/material';
import { format } from 'date-fns';
import DailySchedule from './DailySchedule';
import HydrationTracker from './HydrationTracker';
import MineralTracker from './MineralTracker';
import PhysicalActivityTracker from './PhysicalActivityTracker';
import ProgressTracker from './ProgressTracker';
import { fastingPlanData } from '../data/fastingPlanData';

const Dashboard = () => {
  const [currentDay, setCurrentDay] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  useEffect(() => {
    // Load start date from localStorage if exists
    const savedStartDate = localStorage.getItem('fastingStartDate');
    if (savedStartDate) {
      setStartDate(new Date(savedStartDate));
      
      // Calculate current day based on start date
      const start = new Date(savedStartDate);
      const today = new Date();
      const diffTime = Math.abs(today - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Ensure day is between 1 and 5
      if (diffDays >= 1 && diffDays <= 5) {
        setCurrentDay(diffDays);
      }
    }
    
    // Update current date every minute
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleStartFasting = () => {
    const today = new Date();
    setStartDate(today);
    setCurrentDay(1);
    localStorage.setItem('fastingStartDate', today.toISOString());
  };
  
  const handleDayChange = (day) => {
    setCurrentDay(day);
  };
  
  const resetFasting = () => {
    if (window.confirm('Are you sure you want to reset your fasting plan? This will delete all your progress.')) {
      localStorage.removeItem('fastingStartDate');
      localStorage.removeItem('hydrationData');
      localStorage.removeItem('mineralData');
      localStorage.removeItem('activityData');
      setStartDate(null);
      setCurrentDay(1);
    }
  };
  
  const dayData = fastingPlanData.days[currentDay - 1];
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {fastingPlanData.title}
        </Typography>
        <Typography variant="h6">
          {format(currentDate, 'EEEE, MMMM d, yyyy h:mm a')}
        </Typography>
      </Box>
      
      {!startDate ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Welcome to Your Fasting Journey
          </Typography>
          <Typography paragraph>
            {fastingPlanData.description}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            onClick={handleStartFasting}
            sx={{ mt: 2 }}
          >
            Start Your 5-Day Fasting Journey
          </Button>
        </Paper>
      ) : (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5">
                Day {currentDay}: {dayData.name}
              </Typography>
              <Typography variant="subtitle1">
                Started on: {format(new Date(startDate), 'MMMM d, yyyy')}
              </Typography>
            </Box>
            <Box>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={resetFasting}
                sx={{ ml: 2 }}
              >
                Reset Plan
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            {fastingPlanData.days.map((day, index) => (
              <Button
                key={day.day}
                variant={currentDay === day.day ? "contained" : "outlined"}
                color="primary"
                onClick={() => handleDayChange(day.day)}
                sx={{ mx: 1 }}
              >
                Day {day.day}
              </Button>
            ))}
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <DailySchedule dayData={dayData} />
            </Grid>
            <Grid item xs={12} md={4}>
              <ProgressTracker currentDay={currentDay} startDate={startDate} />
            </Grid>
            <Grid item xs={12} md={6}>
              <HydrationTracker 
                currentDay={currentDay} 
                hydrationGuidelines={fastingPlanData.hydrationGuidelines} 
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MineralTracker 
                currentDay={currentDay} 
                mineralData={fastingPlanData.mineralSupplementation} 
              />
            </Grid>
            <Grid item xs={12}>
              <PhysicalActivityTracker 
                currentDay={currentDay} 
                activityData={dayData.physicalActivity}
                yogaPoses={fastingPlanData.yogaPoses}
              />
            </Grid>
            {currentDay === 5 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Breaking Fast Guidelines - Day 5
                  </Typography>
                  {dayData.breakingFast.map((meal, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {meal.mealTime}
                      </Typography>
                      <ul>
                        {meal.foods.map((food, idx) => (
                          <li key={idx}>
                            <Typography>{food}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  ))}
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    Remember to eat slowly, chew thoroughly, and maintain mindfulness throughout the reintroduction process. 
                    This gradual approach helps reawaken the digestive system safely while maximizing the benefits of your fasting experience.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
