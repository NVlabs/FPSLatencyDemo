// Method to get from URL params (if present)
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
function getURLParamIfPresent(name, defaultValue){
  var value = defaultValue;
  if(urlParams.has(name)) {
    // Special case for handling boolean strings
    if (typeof defaultValue == "boolean"){     
        value = (urlParams.get(name).toLowerCase() == 'true');
        // Warning message for other strings as booleans
        if(!value && urlParams.get(name).toLowerCase() != 'false') {
          console.warn('Value "%s" (specified for boolean URL parameter "%s") is not "true" or "false" but should be, interpreting as "false"!', urlParams.get(name), name);
        }
    }
    else { // Default case for type conversion from default value
      value = defaultValue.constructor(urlParams.get(name));
    }
    console.log(name, value);   // Log settings to the console
  }
  return value;
}

// Get URL parameters for building this page
// Get measurement duration
const measDur = getURLParamIfPresent("measurementDuration", 60);
// Get latency conditions
const midLatFrames = getURLParamIfPresent("midLatFrames", 2);
const midLatMs = getURLParamIfPresent("midLatMs", 1000 * midLatFrames / 60);
const highLatFrames = getURLParamIfPresent("highLatFrames", 4);
const highLatMs = getURLParamIfPresent("highLatMs", 1000 * highLatFrames / 60);
// Get time on target results
const lowLatTot = getURLParamIfPresent("lowResult", 30);
const midLatTot = getURLParamIfPresent("midResult", 20);
const highLatTot = getURLParamIfPresent("highResult", 10);

// Get accuracy from time on target and meas dur
const lowLatAcc = 100 * lowLatTot / measDur;
const midLatAcc = 100 * midLatTot / measDur;
const highLatAcc = 100 * highLatTot / measDur;

// Get differences as time on target and acc
const midDiffTot = lowLatTot - midLatTot;
const midDiffAcc = lowLatAcc - midLatAcc;
const highDiffTot = lowLatTot - highLatTot;
const highDiffAcc = lowLatAcc - highLatAcc;
const avgTot = (lowLatTot + midLatTot + highLatTot) / 3;    // Get overall average time on target

// Produce simple fit
const midLatSlope = -midDiffTot / midLatMs;
const highLatSlope = -highDiffTot / highLatMs;
const avgSlope = (midLatSlope + highLatSlope) / 2;

// Apply fit to mid/high points (low will fit perfectly due to intercept value)
const midFit = avgSlope * midLatMs + lowLatTot;
const highFit = avgSlope * highLatMs + lowLatTot;

// Get R2 value for this fit
const estErr = (midLatTot - midFit)**2 + (highLatTot - highFit)**2;
const avgErr = (lowLatTot - avgTot)**2 + (midLatTot - avgTot)**2 + (highLatTot - avgTot)**2;
const r2 = 1 - (estErr / avgErr);
console.log(`Fit: y = ${avgSlope}x + ${lowLatTot} (r² = ${r2})`);

// Get elements to update
const lowLatResult = document.getElementById("lowresult");
const midLatResult = document.getElementById("midresult");
const midDiffResult = document.getElementById("middiff");
const highLatResult = document.getElementById("highresult");
const highDiffResult = document.getElementById("highdiff");
const midlat = document.getElementById("midlat");
const highlat = document.getElementById("highlat");
const midExp = document.getElementById("midexp");
const highExp = document.getElementById("highexp");
const fitExp = document.getElementById("fitexp");

// Update results fields
midlat.innerText = `${midLatMs.toFixed(0)} ms / ${midLatFrames} frames`;
highlat.innerText = `${highLatMs.toFixed(0)} ms / ${highLatFrames} frames`;
lowLatResult.innerHTML = `<h1>${lowLatTot.toFixed(3)}s (${lowLatAcc.toFixed(2)}%)</h1>`;
midLatResult.innerHTML = `<h1>${midLatTot.toFixed(3)}s (${midLatAcc.toFixed(2)}%)</h1>`;
midDiffResult.innerHTML = `${midDiffTot.toFixed(3)}s (${midDiffAcc.toFixed(2)}%)`
highLatResult.innerHTML = `<h1>${highLatTot.toFixed(3)}s (${highLatAcc.toFixed(2)}%)</h1>`;
highDiffResult.innerHTML = `${highDiffTot.toFixed(3)}s (${highDiffAcc.toFixed(2)}%)`

// Conditional logic
if(lowLatTot < midLatTot) {
    // Unexpected case, the low latency time on target was less than the mid latency time on target
    // Indicates possibility of either (1) too small a latency step or (2) not enough training
    setMidExpErr("You performed better at this latency than at the low latency, this is unexpected.\nTry re-running the experiment, possibly choosing a higher latency!");
}
if(lowLatTot < highLatTot) {
    // Unexpected case the high latency time on target was larger than the low latency time on target
    // Indicates possibility of either (1) too small a latency step or (2) not enough training
    setHighExpErr("You performed better at this latency than at the low latency, this is unexpected.\nTry re-running the experiment, possibly choosing a higher latency!");
}
if (midLatTot < highLatTot && lowLatTot > midLatTot){
    // Unexpected case, the mid-low relationship is as expected, but the high latency time on target is higher than the mid
    // Indicates possibility of too small of a latency step
    setHighExpErr("You performed better at this latency than the medium latency, this is unexpected.\nTry re-running the experiment, possibly choosing a lower latency!");
}

function setMidExpErr(string) {
    midExp.innerText = string;
    midExp.style.color = "#ff0000";
}

function setHighExpErr(string) {
    highExp.innerText = string;
    highExp.style.color = "#ff0000";
}

// Only display this text if fit information is reasonable
if(r2 > 0.8) {
    fitExp.innerText = `You gained ${(avgSlope*-1000).toFixed(0)} ms of time on target for every 1 ms of added latency!`;
}
else fitExp.innerText = '';
// else if(r2 > 0.5){
//     fitExp.innerText = '';
// }
// else {
//     fitExp.innerText = 'Fit quality is poor, consider re-running the experiment!';
//     fitExp.style.color = '#ff0000';
// }



