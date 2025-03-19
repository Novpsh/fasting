import React, { useState, useEffect, useCallback } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Slider, 
  Button, 
  TextField, 
  List, 
  ListItem, 
  ListItemText,
  Grid,
  InputAdornment
} from '@mui/material';
import { LocalDrink, Add } from '@mui/icons-material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const HydrationTracker = ({ currentDay, hydrationGuidelines }) => {
  const [weight, setWeight] = useState(150);
  const [targetOz, setTargetOz] = useState(75);
  const [currentOz, setCurrentOz] = useState(0);
  const [physicalActivity, setPhysicalActivity] = useState(0);
  const [temperature, setTemperature] = useState(70);
  const [isHighAltitude, setIsHighAltitude] = useState(false);
  const [waterLog, setWaterLog] = useState([]);
  
  // Define calculateTargetOz with useCallback to avoid infinite loops
  const calculateTargetOz = useCallback((weight, activity, temp, altitude) => {
    // Base calculation: 0.5 oz per pound of body weight
    let target = weight * 0.5;
    
    // Add for physical activity (16 oz per 30 min)
    target += (activity / 30) * 16;
    
    // Add for high temperature (8 oz per 5°F above 80°F)
    if (temp > 80) {
      target += Math.floor((temp - 80) / 5) * 8;
    }
    
    // Add for high altitude
    if (altitude) {
      target += 16;
    }
    
    setTargetOz(Math.round(target));
  }, [setTargetOz]);
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(`hydrationData-day${currentDay}`);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setWeight(parsedData.weight || 150);
      setTargetOz(parsedData.targetOz || 75);
      setCurrentOz(parsedData.currentOz || 0);
      setPhysicalActivity(parsedData.physicalActivity || 0);
      setTemperature(parsedData.temperature || 70);
      setIsHighAltitude(parsedData.isHighAltitude || false);
      setWaterLog(parsedData.waterLog || []);
    } else {
      // Initialize with default values
      calculateTargetOz(weight, physicalActivity, temperature, isHighAltitude);
    }
  }, [currentDay, weight, physicalActivity, temperature, isHighAltitude, calculateTargetOz]);
  
  // Save data to localStorage whenever relevant state changes
  useEffect(() => {
    localStorage.setItem(`hydrationData-day${currentDay}`, JSON.stringify({
      weight,
      targetOz,
      currentOz,
      physicalActivity,
      temperature,
      isHighAltitude,
      waterLog
    }));
  }, [weight, targetOz, currentOz, physicalActivity, temperature, isHighAltitude, waterLog, currentDay]);
  
  const handleWeightChange = (event) => {
    const newWeight = parseInt(event.target.value);
    setWeight(newWeight);
    calculateTargetOz(newWeight, physicalActivity, temperature, isHighAltitude);
  };
  
  const handleActivityChange = (event, newValue) => {
    setPhysicalActivity(newValue);
    calculateTargetOz(weight, newValue, temperature, isHighAltitude);
  };
  
  const handleTemperatureChange = (event, newValue) => {
    setTemperature(newValue);
    calculateTargetOz(weight, physicalActivity, newValue, isHighAltitude);
  };
  
  const handleAltitudeChange = () => {
    const newAltitude = !isHighAltitude;
    setIsHighAltitude(newAltitude);
    calculateTargetOz(weight, physicalActivity, temperature, newAltitude);
  };
  
  const addWater = (amount) => {
    const newTotal = currentOz + amount;
    setCurrentOz(newTotal);
    
    // Add to log
    const now = new Date();
    setWaterLog([
      ...waterLog,
      {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: amount
      }
    ]);
  };
  
  const resetWater = () => {
    if (window.confirm('Are you sure you want to reset your water intake for today?')) {
      setCurrentOz(0);
      setWaterLog([]);
    }
  };
  
  // Prepare chart data
  const chartData = {
    labels: ['Consumed', 'Remaining'],
    datasets: [
      {
        data: [currentOz, Math.max(0, targetOz - currentOz)],
        backgroundColor: ['#4caf50', '#e0e0e0'],
        hoverBackgroundColor: ['#388e3c', '#bdbdbd'],
        borderWidth: 0,
      },
    ],
  };
  
  const chartOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value} oz`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };
  
  const percentComplete = Math.min(100, Math.round((currentOz / targetOz) * 100));
  
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Hydration Tracker
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 200, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Doughnut data={chartData} options={chartOptions} />
            <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h4" color="primary">
                {percentComplete}%
              </Typography>
              <Typography variant="body2">
                {currentOz} / {targetOz} oz
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<Add />} 
              onClick={() => addWater(8)}
            >
              8 oz
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Add />} 
              onClick={() => addWater(16)}
            >
              16 oz
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={resetWater}
            >
              Reset
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Personalize Your Water Needs
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Your Weight (lbs)"
              type="number"
              value={weight}
              onChange={handleWeightChange}
              InputProps={{
                endAdornment: <InputAdornment position="end">lbs</InputAdornment>,
              }}
              size="small"
              fullWidth
            />
          </Box>
          
          <Typography variant="body2" gutterBottom>
            Physical Activity (minutes)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Slider
              value={physicalActivity}
              onChange={handleActivityChange}
              step={10}
              marks
              min={0}
              max={120}
              valueLabelDisplay="auto"
            />
          </Box>
          
          <Typography variant="body2" gutterBottom>
            Temperature (°F)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Slider
              value={temperature}
              onChange={handleTemperatureChange}
              step={5}
              marks
              min={60}
              max={100}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}°F`}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Button
              variant={isHighAltitude ? "contained" : "outlined"}
              color={isHighAltitude ? "primary" : "inherit"}
              onClick={handleAltitudeChange}
              size="small"
            >
              {isHighAltitude ? "At High Altitude (>5000 ft)" : "Not At High Altitude"}
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Hydration Guidelines
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary={hydrationGuidelines.baseRecommendation} 
                secondary={hydrationGuidelines.example}
              />
            </ListItem>
            {hydrationGuidelines.adjustmentFactors.map((factor, index) => (
              <ListItem key={index}>
                <ListItemText primary={factor} />
              </ListItem>
            ))}
          </List>
        </Grid>
        
        {waterLog.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Today's Water Log
            </Typography>
            <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
              {waterLog.map((entry, index) => (
                <ListItem key={index} sx={{ py: 0 }}>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalDrink fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2">
                          {entry.time} - {entry.amount} oz
                        </Typography>
                      </Box>
                    } 
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default HydrationTracker;
