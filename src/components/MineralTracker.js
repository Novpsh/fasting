import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Checkbox,
  Divider,
  Chip,
  Grid,
  Button
} from '@mui/material';
import { AccessTime, Refresh } from '@mui/icons-material';

const MineralTracker = ({ currentDay, mineralData }) => {
  const [completedMinerals, setCompletedMinerals] = useState({
    morning: {},
    midday: {},
    evening: {},
    asNeeded: {}
  });
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(`mineralData-day${currentDay}`);
    if (savedData) {
      setCompletedMinerals(JSON.parse(savedData));
    } else {
      // Initialize with empty state
      setCompletedMinerals({
        morning: {},
        midday: {},
        evening: {},
        asNeeded: {}
      });
    }
  }, [currentDay]);
  
  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`mineralData-day${currentDay}`, JSON.stringify(completedMinerals));
  }, [completedMinerals, currentDay]);
  
  const handleToggleMineralItem = (timeOfDay, index) => {
    setCompletedMinerals(prev => ({
      ...prev,
      [timeOfDay]: {
        ...prev[timeOfDay],
        [index]: !prev[timeOfDay][index]
      }
    }));
  };
  
  const resetDailyMinerals = () => {
    if (window.confirm('Are you sure you want to reset your mineral tracking for today?')) {
      setCompletedMinerals({
        morning: {},
        midday: {},
        evening: {},
        asNeeded: {}
      });
    }
  };
  
  // Determine if a section should be highlighted based on current time
  const getCurrentTimeSection = () => {
    const now = new Date();
    const hours = now.getHours();
    
    if (hours >= 5 && hours < 11) {
      return 'morning';
    } else if (hours >= 11 && hours < 17) {
      return 'midday';
    } else if (hours >= 17 && hours < 22) {
      return 'evening';
    }
    return null;
  };
  
  const currentSection = getCurrentTimeSection();
  
  // Calculate completion percentage for each section
  const calculateSectionProgress = (section) => {
    const items = mineralData[section];
    if (!items) return 0;
    
    const totalItems = items.length;
    const completedItems = Object.values(completedMinerals[section]).filter(Boolean).length;
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };
  
  // Calculate overall progress
  const calculateOverallProgress = () => {
    // Only count morning, midday, and evening for overall progress
    const sections = ['morning', 'midday', 'evening'];
    let totalItems = 0;
    let completedItems = 0;
    
    sections.forEach(section => {
      const items = mineralData[section];
      if (items) {
        totalItems += items.length;
        completedItems += Object.values(completedMinerals[section]).filter(Boolean).length;
      }
    });
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };
  
  const renderMineralSection = (title, timeOfDay, items, isCurrentSection) => {
    const progress = calculateSectionProgress(timeOfDay);
    
    return (
      <Box 
        sx={{ 
          mb: 3,
          p: 2,
          border: isCurrentSection ? '1px solid #4caf50' : '1px solid transparent',
          borderRadius: 1,
          bgcolor: isCurrentSection ? 'rgba(76, 175, 80, 0.05)' : 'transparent'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isCurrentSection && <AccessTime color="primary" sx={{ mr: 1 }} />}
            <Typography variant="subtitle1" fontWeight={isCurrentSection ? 'bold' : 'normal'}>
              {title}
            </Typography>
          </Box>
          <Chip 
            label={`${progress}% Complete`} 
            color={progress === 100 ? "success" : "default"}
            size="small"
          />
        </Box>
        
        <List dense>
          {items.map((item, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <Checkbox 
                checked={!!completedMinerals[timeOfDay][index]} 
                onChange={() => handleToggleMineralItem(timeOfDay, index)}
                color="primary"
                size="small"
              />
              <ListItemText 
                primary={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      textDecoration: completedMinerals[timeOfDay][index] ? 'line-through' : 'none',
                    }}
                  >
                    {item}
                  </Typography>
                } 
              />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };
  
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Mineral Supplementation
        </Typography>
        <Button 
          startIcon={<Refresh />} 
          size="small" 
          onClick={resetDailyMinerals}
        >
          Reset
        </Button>
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ mr: 1 }}>
          Overall Progress:
        </Typography>
        <Chip 
          label={`${calculateOverallProgress()}%`} 
          color={calculateOverallProgress() === 100 ? "success" : "primary"}
          size="small"
        />
      </Box>
      
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {renderMineralSection('Morning Supplements', 'morning', mineralData.morning, currentSection === 'morning')}
        </Grid>
        
        <Grid item xs={12}>
          {renderMineralSection('Mid-day Supplements', 'midday', mineralData.midday, currentSection === 'midday')}
        </Grid>
        
        <Grid item xs={12}>
          {renderMineralSection('Evening Supplements', 'evening', mineralData.evening, currentSection === 'evening')}
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            As Needed (for headaches or fatigue)
          </Typography>
          <List dense>
            {mineralData.asNeeded.map((item, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <Checkbox 
                  checked={!!completedMinerals.asNeeded[index]} 
                  onChange={() => handleToggleMineralItem('asNeeded', index)}
                  color="primary"
                  size="small"
                />
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MineralTracker;
