import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent,
  LinearProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  WaterDrop, 
  Spa, 
  Restaurant, 
  CheckCircle, 
  AccessTime,
  EmojiEvents
} from '@mui/icons-material';
import { format, addDays, isAfter, isToday } from 'date-fns';

const ProgressTracker = ({ currentDay, startDate }) => {
  const [overallProgress, setOverallProgress] = useState(0);
  const [dayProgress, setDayProgress] = useState([0, 0, 0, 0, 0]);
  
  useEffect(() => {
    // Calculate progress based on localStorage data
    const calculateDayProgress = (day) => {
      // Check if we have data for this day
      const scheduleData = localStorage.getItem(`completedActivities-day${day}`);
      const hydrationData = localStorage.getItem(`hydrationData-day${day}`);
      const mineralData = localStorage.getItem(`mineralData-day${day}`);
      const activityData = localStorage.getItem(`activityData-day${day}`);
      
      if (!scheduleData && !hydrationData && !mineralData && !activityData) {
        return 0;
      }
      
      let totalScore = 0;
      let possibleScore = 0;
      
      // Schedule progress (40% weight)
      if (scheduleData) {
        const parsedData = JSON.parse(scheduleData);
        const completed = Object.values(parsedData).filter(Boolean).length;
        const total = Object.keys(parsedData).length || 1;
        totalScore += (completed / total) * 40;
        possibleScore += 40;
      }
      
      // Hydration progress (20% weight)
      if (hydrationData) {
        const parsedData = JSON.parse(hydrationData);
        if (parsedData.targetOz && parsedData.currentOz) {
          const percent = Math.min(100, (parsedData.currentOz / parsedData.targetOz) * 100);
          totalScore += (percent / 100) * 20;
          possibleScore += 20;
        }
      }
      
      // Mineral progress (20% weight)
      if (mineralData) {
        const parsedData = JSON.parse(mineralData);
        let completed = 0;
        let total = 0;
        
        ['morning', 'midday', 'evening'].forEach(timeOfDay => {
          if (parsedData[timeOfDay]) {
            completed += Object.values(parsedData[timeOfDay]).filter(Boolean).length;
            total += Object.keys(parsedData[timeOfDay]).length;
          }
        });
        
        if (total > 0) {
          totalScore += (completed / total) * 20;
          possibleScore += 20;
        }
      }
      
      // Activity progress (20% weight)
      if (activityData) {
        const parsedData = JSON.parse(activityData);
        if (parsedData.completedActivities) {
          const completed = Object.values(parsedData.completedActivities).filter(Boolean).length;
          const total = Object.keys(parsedData.completedActivities).length;
          totalScore += (completed / total) * 20;
          possibleScore += 20;
        }
      }
      
      return possibleScore > 0 ? Math.round(totalScore / possibleScore * 100) : 0;
    };
    
    // Calculate progress for each day
    const newDayProgress = [1, 2, 3, 4, 5].map(day => calculateDayProgress(day));
    setDayProgress(newDayProgress);
    
    // Calculate overall progress
    const completedDays = newDayProgress.filter(progress => progress >= 80).length;
    const inProgressDays = newDayProgress.filter(progress => progress > 0 && progress < 80).length;
    
    // Weight completed days fully, in-progress days partially
    const overallPercent = ((completedDays * 100) + (inProgressDays * 50)) / 500 * 100;
    setOverallProgress(Math.round(overallPercent));
    
  }, [currentDay]); // Recalculate when current day changes
  
  const getDayStatus = (day, progress) => {
    if (!startDate) return 'future';
    
    const dayDate = addDays(new Date(startDate), day - 1);
    const today = new Date();
    
    if (isAfter(dayDate, today)) {
      return 'future';
    } else if (isToday(dayDate)) {
      return 'current';
    } else {
      return progress >= 80 ? 'completed' : 'incomplete';
    }
  };
  
  const getStatusIcon = (day, progress) => {
    const status = getDayStatus(day, progress);
    
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'current':
        return <AccessTime color="primary" />;
      case 'incomplete':
        return <CheckCircle color="action" />;
      case 'future':
        return <AccessTime color="disabled" />;
      default:
        return null;
    }
  };
  
  const getDayLabel = (day) => {
    switch (day) {
      case 1:
        return 'Transition Day';
      case 2:
      case 3:
      case 4:
        return `Core Fasting Day ${day - 1}`;
      case 5:
        return 'Reintroduction Day';
      default:
        return `Day ${day}`;
    }
  };
  
  const getDayIcon = (day) => {
    switch (day) {
      case 1:
        return <WaterDrop />;
      case 2:
      case 3:
      case 4:
        return <Spa />;
      case 5:
        return <Restaurant />;
      default:
        return null;
    }
  };
  
  const getDateLabel = (day) => {
    if (!startDate) return '';
    
    const dayDate = addDays(new Date(startDate), day - 1);
    return format(dayDate, 'MMM d');
  };
  
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 40) return 'primary';
    if (progress > 0) return 'warning';
    return 'inherit';
  };
  
  const getFastingBenefits = (day) => {
    switch(day) {
      case 1:
        return [
          'Insulin levels begin to drop',
          'Cellular cleanup processes begin',
          'Mental clarity starts to increase'
        ];
      case 2:
        return [
          'Fat burning increases',
          'Autophagy begins',
          'Inflammation reduction starts'
        ];
      case 3:
        return [
          'Ketone production increases',
          'Autophagy intensifies',
          'Growth hormone increases'
        ];
      case 4:
        return [
          'Immune system regeneration',
          'Stem cell production increases',
          'Significant fat adaptation'
        ];
      case 5:
        return [
          'Digestive system reset',
          'Enhanced nutrient absorption',
          'Continued metabolic benefits'
        ];
      default:
        return [];
    }
  };
  
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Fasting Progress
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2">
            Overall Progress
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {overallProgress}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={overallProgress} 
          sx={{ height: 10, borderRadius: 5 }}
          color="primary"
        />
      </Box>
      
      <Stepper orientation="vertical" nonLinear activeStep={currentDay - 1}>
        {[1, 2, 3, 4, 5].map((day) => (
          <Step key={day} completed={getDayStatus(day, dayProgress[day - 1]) === 'completed'}>
            <StepLabel 
              StepIconComponent={() => getStatusIcon(day, dayProgress[day - 1])}
              optional={
                <Typography variant="caption">
                  {getDateLabel(day)}
                </Typography>
              }
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 1 }}>
                  {getDayIcon(day)}
                </Box>
                <Typography variant="body2">
                  {getDayLabel(day)}
                </Typography>
              </Box>
            </StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption">
                    Day Progress
                  </Typography>
                  <Chip 
                    label={`${dayProgress[day - 1]}%`} 
                    size="small" 
                    color={getProgressColor(dayProgress[day - 1])}
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={dayProgress[day - 1]} 
                  sx={{ height: 6, borderRadius: 3 }}
                  color={getProgressColor(dayProgress[day - 1])}
                />
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmojiEvents fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                Fasting Benefits
              </Typography>
              
              <List dense sx={{ py: 0 }}>
                {getFastingBenefits(day).map((benefit, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemText 
                      primary={
                        <Typography variant="caption">
                          {benefit}
                        </Typography>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
};

export default ProgressTracker;
