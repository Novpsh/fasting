import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Checkbox, 
  FormControlLabel,
  Divider,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import { 
  ExpandMore, 
  WbSunny, 
  WbTwilight, 
  Nightlight,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

const PhysicalActivityTracker = ({ currentDay, activityData, yogaPoses }) => {
  const [completedActivities, setCompletedActivities] = useState({
    morning: false,
    afternoon: false,
    evening: false
  });
  
  const [notes, setNotes] = useState('');
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(`activityData-day${currentDay}`);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setCompletedActivities(parsedData.completedActivities || {
        morning: false,
        afternoon: false,
        evening: false
      });
      setNotes(parsedData.notes || '');
    } else {
      // Initialize with default values
      setCompletedActivities({
        morning: false,
        afternoon: false,
        evening: false
      });
      setNotes('');
    }
  }, [currentDay]);
  
  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`activityData-day${currentDay}`, JSON.stringify({
      completedActivities,
      notes
    }));
  }, [completedActivities, notes, currentDay]);
  
  const handleToggleActivity = (timeOfDay) => {
    setCompletedActivities(prev => ({
      ...prev,
      [timeOfDay]: !prev[timeOfDay]
    }));
  };
  
  const resetActivities = () => {
    if (window.confirm('Are you sure you want to reset your physical activity tracking for today?')) {
      setCompletedActivities({
        morning: false,
        afternoon: false,
        evening: false
      });
    }
  };
  
  // Determine current time of day
  const getCurrentTimeOfDay = () => {
    const now = new Date();
    const hours = now.getHours();
    
    if (hours >= 5 && hours < 12) {
      return 'morning';
    } else if (hours >= 12 && hours < 17) {
      return 'afternoon';
    } else {
      return 'evening';
    }
  };
  
  const currentTimeOfDay = getCurrentTimeOfDay();
  
  // Calculate overall progress
  const calculateProgress = () => {
    const total = 3; // morning, afternoon, evening
    const completed = Object.values(completedActivities).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };
  
  const getTimeIcon = (timeOfDay) => {
    switch(timeOfDay) {
      case 'morning':
        return <WbSunny color="warning" />;
      case 'afternoon':
        return <WbTwilight color="primary" />;
      case 'evening':
        return <Nightlight color="action" />;
      default:
        return null;
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Physical Activity Tracker
        </Typography>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={resetActivities}
        >
          Reset
        </Button>
      </Box>
      
      <Typography variant="body2" gutterBottom>
        Day {currentDay} Progress: {calculateProgress()}% Complete
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {['morning', 'afternoon', 'evening'].map((timeOfDay) => (
          <Grid item xs={12} md={4} key={timeOfDay}>
            <Card 
              sx={{ 
                height: '100%',
                border: currentTimeOfDay === timeOfDay ? '2px solid #4caf50' : 'none',
              }}
              elevation={currentTimeOfDay === timeOfDay ? 3 : 1}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getTimeIcon(timeOfDay)}
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      ml: 1,
                      textTransform: 'capitalize',
                      fontWeight: currentTimeOfDay === timeOfDay ? 'bold' : 'normal'
                    }}
                  >
                    {timeOfDay}
                  </Typography>
                  {currentTimeOfDay === timeOfDay && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        ml: 1,
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1
                      }}
                    >
                      Now
                    </Typography>
                  )}
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2, minHeight: 60 }}>
                  {activityData[timeOfDay]}
                </Typography>
                
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={completedActivities[timeOfDay]} 
                      onChange={() => handleToggleActivity(timeOfDay)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {completedActivities[timeOfDay] ? "Completed" : "Mark as completed"}
                    </Typography>
                  }
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Divider sx={{ my: 2 }} />
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">Yoga Pose Guidelines</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Recommended Poses
              </Typography>
              <List dense>
                {yogaPoses.recommended.map((pose, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircle fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={pose} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="error" gutterBottom>
                Poses to Avoid
              </Typography>
              <List dense>
                {yogaPoses.avoid.map((pose, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Cancel fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary={pose} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default PhysicalActivityTracker;
