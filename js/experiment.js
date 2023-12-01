/*
The MIT License (MIT)

Copyright (c) 2023 NVIDIA CORPORATION & AFFILIATES

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict"

// States that the experiment progresses through
const states = ["sensitivity", "latency", "measurement"]
var stateIdx = -1;
var state = "sensitivity";           // Start out in sensitivity adjustment 
var inMeas = false;                  // Measurement state flag

var timeRemainingS = MEAS_DUR_S;
var timeOnTarget = 0;

const sensitivitySlider = document.getElementById("sensSlider");
const sensitivityDiv = document.getElementById("sensSliderDiv");
sensitivitySlider.oninput = function() {
  config.player.mouseSensitivity = parseFloat(this.value);
}

const invertYCheckbox = document.getElementById("invertYCheckbox");
invertYCheckbox.oninput = function() {
  config.player.invertY = this.checked;
  // console.log(config.player.invertY);
}

var set_latency = function(lat) {
  config.render.frameDelay = lat;
  rawInputState.frameDelay = lat;
  console.log('Set latency to ' + lat + ' frames');
}

const latencySlider = document.getElementById("latSlider");
const latencyDiv = document.getElementById("latSliderDiv");
latencySlider.oninput = function() {
  set_latency(parseInt(this.value));
}

// Frame timing information
const numFrameTimes = 100;        // Number of frame times to store
var frameTimeValid = false;       // Has the frame time converged?
var frameTimes = [];              // Recent frame times

const timerDiv = document.getElementById('timerDiv');
var nextState = function(){
  // Advance state index
  stateIdx += 1;
  clickShot = false; // Stop firing
  if(stateIdx >= states.length) stateIdx = states.length - 1;
  state = states[stateIdx];
  // Apply state-based changes
  if(state == "sensitivity") {
    if(useFixedSensitivity) { // Use fixed sensitivity, skip this state
      state = 'latency';
      stateIdx += 1;
    }
    else {
      sensitivityDiv.style.visibility = 'visible';
      latencyDiv.style.visibility = 'hidden';
      timerDiv.style.visibility = 'hidden';
    }
  }
  if(state == "latency") { // Moving into latency adjustment state
    console.log(`Using a sensitivity value of ${config.player.mouseSensitivity}`)
    if(useFixedFrameDelays) { // Use fixed delays, skip this state
      state = 'measurement';
      stateIdx += 1;
    }
    else {
      sensitivityDiv.style.visibility = 'hidden';
      latencyDiv.style.visibility = 'visible';
      // Set reasonable start latency
      var avgFrameTime = frameTimes.avg();
      console.log('Average frame time of ' + avgFrameTime + ' ms')

      var delay_frames 
      if (INITIAL_LATENCY_FRAMES > 0) delay_frames = INITIAL_LATENCY_FRAMES;
      else delay_frames = Math.round(INITIAL_LATENCY_MS / frameTimes.avg());
      latencySlider.value = delay_frames
      latencySlider.oninput()
      // set_latency(latencySlider.min); // Set the minimum latency
    }
  }
  if(state == "measurement") {
    // Build up our latency conditions based on the JND latency here
    if (!useFixedFrameDelays){
      var jnd_lat = config.render.frameDelay;
      if(jnd_lat == 0 || jnd_lat == 1) frameDelays = [0,1,2]; // Case where user specifies 0 JND
      else if(jnd_lat > 1) {
        frameDelays.push(Math.round(jnd_lat / 2));
        frameDelays.push(jnd_lat);
      }
      frameDelays = frameDelays.sort(function(a,b) {return b-a;})
      console.log('Selected JND of ' +  jnd_lat)
    }
    else frameDelays = fixedFrameDelays; // Use fixed frame delays

    // Optionally randomize the condition order
    if(RANDOM_ORDER) frameDelays.sort(() => Math.random() - 0.5);
    console.log('Testing conditions: ' + frameDelays);
    // Set the first latency
    set_latency(frameDelays[0]);
    // Update header/instructions
    measHeader.innerText = `Measurement Phase ${frameDelayIndex+1}/${frameDelays.length}`
    sensitivityDiv.style.visibility = 'hidden';
    latencyDiv.style.visibility = 'hidden';
    timerDiv.style.visibility = 'visible';
  }
  
  makeScene();
  updateInstructions();
}

var frameDelays = [0];
var frameDelayIndex = 0;

var condComplete = false;
var totResults = {};        // Storage for time on target results
var measLatencies = {};     // Storage for latency measured in each condition

const measHeader = document.getElementById("measHeader");
const timeIndicator = document.getElementById("time_indicator");

var nextMeasCondition = function(){
  inMeas = false; // Reset this flag
  totResults[frameDelays[frameDelayIndex]] = timeOnTarget; // Save result
  measLatencies[frameDelays[frameDelayIndex]] = frameDelays[frameDelayIndex] * frameTimes.avg();
  timeOnTarget = 0; // Reset tracking variable
  frameDelayIndex += 1;  // Increment to next measurement
  if(frameDelayIndex < frameDelays.length) {
    set_latency(frameDelays[frameDelayIndex]) // Set the new latency
    measHeader.innerText = `Measurement Phase ${frameDelayIndex+1}/${frameDelays.length}`
    timeRemainingS = MEAS_DUR_S;
    timeIndicator.innerText = timeRemainingS.toFixed(2) + "s";
    makeScene();
    clickShot = false; // Toggle off click (require new click to start)
    pointerlockchange();
    condComplete = false;
    // document.exitPointerLock();
  }
  else {
    // End of measurement, display results
    measHeader.innerText = 'Measurement Complete!';
    timeIndicator.style.display = 'none';
    showResults();
  }
}

// State update for reference target destroyed
function expRefTargetDestroyed(){
  if(state == 'measurement') {
    inMeas = true;
    timeRemainingS = MEAS_DUR_S;
  }
}

function expLogTimeOnTarget(dt) {
  if(inMeas){
    timeOnTarget += dt; // Track time spent on target
  }
}

function expAnimate(dt) {
  // Update time remaining indicator
  if(inMeas && timeRemainingS > 0){
    timeRemainingS -= dt;
    timeIndicator.innerText = timeRemainingS.toFixed(2) + "s";
    // console.log(timeRemainingS)
  }
  else if(state == 'measurement' && !condComplete && timeRemainingS <= 0){
    condComplete = true;
    nextMeasCondition();
  }
}

const results = document.getElementById('results');
const lowlatresult = document.getElementById("lowlatresult");
const midlatresult = document.getElementById("midlatresult");
const highlatresult = document.getElementById("highlatresult");
const middiffresult = document.getElementById("middiffresult");
const highdiffresult = document.getElementById("highdiffresult");
const resultsTable = document.getElementById("results_table");
var resultsDisplayed = false;

var showResults = function(){
  const sortedConds = frameDelays.sort(function(a,b) {return a-b});    // This should sort low latency, mid latency, high latency
  if(!useFixedFrameDelays) { 
    // No provided frame delays, this is a JND-style result, show colorized results
    const lowLat = sortedConds[0]; const midLat = sortedConds[1]; const highLat = sortedConds[2];
    const lowLatTot = totResults[lowLat]; const midLatTot = totResults[midLat]; const highLatTot = totResults[highLat];
    const lowLatAcc = 100 * lowLatTot / MEAS_DUR_S; const midLatAcc = 100 * midLatTot / MEAS_DUR_S; const highLatAcc = 100 * highLatTot / MEAS_DUR_S;

    const midLatDiff = measLatencies[midLat];
    const highLatDiff = measLatencies[highLat];
    lowlatresult.innerHTML = `<h1>Minimum Latency</h1><p>0 Frames Delayed</p><br><h2>Time on Target: ${lowLatTot.toFixed(3)} s</h2><p>Accuracy: ${lowLatAcc.toFixed(1)}%</p>`;
    midlatresult.innerHTML = `<h1>+ ${midLatDiff.toFixed(1)} ms Latency</h1><p>${midLat} Frames Delayed</p><br><h2>Time on Target: ${midLatTot.toFixed(3)} s</h2><p>Accuracy: ${midLatAcc.toFixed(1)}%</p>`;
    highlatresult.innerHTML = `<h1>+ ${highLatDiff.toFixed(1)} ms Latency</h1><p>${highLat} Frames Delayed</p><br><h2>Time on Target: ${highLatTot.toFixed(3)} s</h2><p>Accuracy: ${highLatAcc.toFixed(1)}%</p>`;
    
    const mid_lat_dt = (lowLatTot - midLatTot); const mid_lat_dAcc = lowLatAcc - midLatAcc;
    middiffresult.innerHTML = `<h2>${1e3*mid_lat_dt.toFixed(1)} ms decrease in time on target</h2><p>${mid_lat_dAcc.toFixed(1)}% reduction in accuracy</p>`;
    
    const high_lat_dt = (lowLatTot - highLatTot); const high_lat_dAcc = lowLatAcc - highLatAcc;
    highdiffresult.innerHTML = `<h2>${1e3*high_lat_dt.toFixed(1)} ms decrease in time on target</h2><p>${high_lat_dAcc.toFixed(1)}% reduction in accuracy</p>`;

    document.getElementById("midLatFrames").innerText = midLat;
    document.getElementById("midLatMs").innerText = midLatDiff.toFixed(1);
    document.getElementById("highLatFrames").innerText = highLat;
    document.getElementById("highLatMs").innerText = highLatDiff.toFixed(1);
    document.getElementById("lowTime").innerText = lowLatTot.toFixed(3);
    document.getElementById("midTime").innerText = midLatTot.toFixed(3);
    document.getElementById("highTime").innerText = highLatTot.toFixed(3);
  }
  else { // This is a fixed condition experiment, just display the results table
    lowlatresult.style.display = 'none';
    midlatresult.style.display = 'none';
    highlatresult.style.display = 'none';
    middiffresult.style.display = 'none';
    highdiffresult.style.display = 'none';

    document.getElementById('resultsActions').style.top = '5%';
    document.getElementById('copyRowBtn').innerText = 'Copy Rows';
    document.getElementById('dlRowBtn').innerText = 'CSV Rows';
    
    // Build up HTML results table
    var tableHTML = `<thead>\n\t<tr>`;
    if (USERNAME != '') tableHTML += '<th>User</th>';
    tableHTML += '<th>Frame Delay</th><th>Added Latency [ms]</th><th>Time on Target</th><th>Accuracy</th></tr>\n';
    tableHTML += '</thead>\n<tbody>\n';
    for(var i = 0; i < sortedConds.length; i++) {
      var fd = sortedConds[i];
      tableHTML += '\t<tr>'
      if (USERNAME != '') tableHTML += `<td>${USERNAME}</td>`;
      tableHTML += `<td>${fd}</td><td>${(measLatencies[fd]).toFixed(1)}</td><td>${totResults[fd].toFixed(3)}</td><td>${(100*totResults[fd]/MEAS_DUR_S).toFixed(2)}%</td></tr>\n`;
    }
    tableHTML += '</tbody>';
    resultsTable.innerHTML = tableHTML; // Add the table
    // Make visible
    toggleResultsTableVisible();
  }

  results.style.visibility = 'visible';
  if (fpsControls.enabled) {
    rawInputState.enable(false);
  }
  fpsControls.enabled = false;
  resultsDisplayed = true;
  document.exitPointerLock();
  measurementInstructions.style.display = 'none';
}

// Copies the table to the clipboard as a tab-separated value format (TSV)
function copyTableTSV(includeHeaders) {
  var rows = resultsTable.rows;
  var tsvContent = "";
  var startRow = includeHeaders ? 0 : 1; // Start from 0 to include headers, 1 to exclude

  for (var i = startRow; i < rows.length; i++) {
      var row = [], cols = rows[i].querySelectorAll("td, th");

      for (var j = 0; j < cols.length; j++) {
          // Replace any tab characters in the cell text with spaces to avoid misformatting
          var cellText = cols[j].innerText.replace(/\t/g, " ");
          row.push(cellText);
      }

      tsvContent += row.join("\t") + "\n"; // Join cells with tabs
  }

  navigator.clipboard.writeText(tsvContent).then(function() {
      console.log('Table ' + (includeHeaders ? 'with headers' : 'data only') + ' copied to clipboard as TSV');
  }).catch(function(err) {
      console.error('Could not copy text: ', err);
  });
}

function downloadCSV(csvContent, filename) {
  var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  var link = document.createElement("a");
  var url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadTableAsCSV(includeHeaders) {
  var rows = resultsTable.rows;
  var csvContent = "";

  var startRow = includeHeaders ? 0 : 1; // Start from 1 to exclude headers

  for (var i = startRow; i < rows.length; i++) {
      var row = [], cols = rows[i].querySelectorAll("td, th");

      for (var j = 0; j < cols.length; j++) {
          row.push(cols[j].innerText);
      }

      csvContent += row.join(",") + "\n";
  }

  downloadCSV(csvContent, includeHeaders ? 'full_table.csv' : 'data_only.csv');
}

function toggleResultsTableVisible() {
  const toggleBtn = document.getElementById('toggleResultsVis');
  if(resultsTable.style.display == 'none'){
    resultsTable.style.display = 'table';
    toggleBtn.innerText = 'Hide Table';
  }
  else {
    resultsTable.style.display = 'none'; 
    toggleBtn.innerText = 'Show Table';
  }
}
toggleResultsTableVisible();

// Parse constant frame delays (if provided)
var fixedFrameDelays = [];
if (useFixedFrameDelays) {
  const fd_fields = FRAME_DELAYS_STR.split(',')
  // Parse integer frame delays from CSV string
  for(var i = 0; i < fd_fields.length; i++) {
    fixedFrameDelays.push(parseInt(fd_fields[i].trim().replace(/['"]+/g, '')));
  }
}
sensitivitySlider.value = config.player.mouseSensitivity; // Initialize sensitivity slider from player mouse sensitivity

const sensitivityInstructions = document.getElementById("sensInstructions");
const latencyInstructions = document.getElementById("latInstructions");
const measurementInstructions = document.getElementById("measInstructions");
var instructions = sensitivityInstructions;

function updateInstructions() {
  sensitivityInstructions.style.display = 'none';
  latencyInstructions.style.display = 'none';
  measurementInstructions.style.display = 'none';
  
  if (state == "sensitivity"){
    instructions = sensitivityInstructions;
  }
  else if (state == "latency"){
    instructions = latencyInstructions;
  }
  else if (state == "measurement"){
    instructions = measurementInstructions;
  }

  // Go back to pointer mode
  document.exitPointerLock();
  pointerlockchange();
}
