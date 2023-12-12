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

const r = document.querySelector(':root');
function getCSSVar(name){
    if(!name.startsWith("--")){
        name = "--" + name;
    }
    var rs = getComputedStyle(r);
    return rs.getPropertyValue(name);
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
var midDiffTot = lowLatTot - midLatTot;
var midDiffAcc = lowLatAcc - midLatAcc;
var highDiffTot = lowLatTot - highLatTot;
var highDiffAcc = lowLatAcc - highLatAcc;
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
const midChange = document.getElementById("midchange");
const highLatResult = document.getElementById("highresult");
const highDiffResult = document.getElementById("highdiff");
const highChange = document.getElementById("highchange");
const midlat = document.getElementById("midlat");
const highlat = document.getElementById("highlat");
const midComment = document.getElementById("midComment");
const highComment = document.getElementById("highComment");
const genComment = document.getElementById("genComment");

// Color constant
const ERROR_RED = getCSSVar('error_red');

// Update results fields
midlat.innerText = `${midLatMs.toFixed(0)} ms or ${midLatFrames} frames`;
highlat.innerText = `${highLatMs.toFixed(0)} ms or ${highLatFrames} frames`;
lowLatResult.innerHTML = `<h1>${lowLatTot.toFixed(3)}s (${lowLatAcc.toFixed(2)}%)</h1>`;
midLatResult.innerHTML = `<h1>${midLatTot.toFixed(3)}s (${midLatAcc.toFixed(2)}%)</h1>`;
if (midDiffTot < 0) {
    midDiffTot = -midDiffTot;
    midDiffAcc = -midDiffAcc;
    midChange.innerText = 'unexpected increase';
}
midDiffResult.innerHTML = `${midDiffTot.toFixed(3)}s (${midDiffAcc.toFixed(2)}%)`

highLatResult.innerHTML = `<h1>${highLatTot.toFixed(3)}s (${highLatAcc.toFixed(2)}%)</h1>`;
if (highDiffTot < 0) {
    highDiffTot = -highDiffTot;
    highDiffAcc = -highDiffAcc;
    highChange.innerText = 'unexpected increase';
}
highDiffResult.innerHTML = `${highDiffTot.toFixed(3)}s (${highDiffAcc.toFixed(2)}%)`

// Conditional logic

// Unexpected case, the low latency time on target was less than the mid latency time on target (better mid latency performance)
if(lowLatTot < midLatTot) {
    // Indicates possibility of either (1) too small a latency step or (2) not enough training
    setMidError("You performed better at medium latency than with no added latency, this is unexpected!\nTry re-running the experiment, possibly choosing a higher latency.");
}
else {  // Expected case, we see degredation of the mid latency condition compared to the low latency one
    midComment.innerText = `You improved your performance even at ~½ the latency you said was just noticeable!`;
}

midHighDiffStr = `${(1e3*(midLatTot-highLatTot)).toFixed(0)} ms (${((midLatAcc-highLatAcc).toFixed(0))}%)`;
// Unexpected case the high latency time on target was larger than the low latency time on target
if(lowLatTot < highLatTot) {
    // Indicates possibility of either (1) too small a latency step or (2) not enough training
    setHighError("You performed better at high latency than with no added latency, this is unexpected!\nTry re-running the experiment, possibly choosing a higher latency.");
}
// Unexpected case, the high latency time on target was larger than the mid latency time on target
else if (midLatTot < highLatTot){
    // Indicates possibility of too small of a latency step (performance didn't degrade)
    setHighError("You performed better at high latency than at medium latency, this is unexpected!\nTry re-running the experiment, possibly choosing a lower latency.");
}
// Unexpected case the high-mid relationship is as expected, but the mid latency is invalid
else if(highLatTot < midLatTot && midLatTot > lowLatTot){
    highComment.innerText = `You outperformed the medium latency by ${midHighDiffStr} at high latency, but the medium latency time on target was high.\nConsider re-running the experiment.`
}
// Expected case, high latency total is lower than both mid and low latency
else if(highLatTot < midLatTot && highLatTot < lowLatTot) {
    // Case where the high latency total is > both others
    highComment.innerText = `You spent ${midHighDiffStr} more time on target in the medium latency condition! `
}

function setMidError(errorString) {
    midComment.innerText = errorString;
    midComment.style.color = ERROR_RED;
}

function setHighError(errorString) {
    highComment.innerText = errorString;
    highComment.style.color = ERROR_RED;
}

// Only display this text if fit information is reasonable
if(r2 > 0.8) {
    genComment.innerText = `You added ${(avgSlope*-1000).toFixed(0)} ms of time on target for every 1 ms of lower latency!`;
}
else genComment.innerText = '';
// else if(r2 > 0.5){
//     fitExp.innerText = '';
// }
// else {
//     fitExp.innerText = 'Fit quality is poor, consider re-running the experiment!';
//     fitExp.style.color = '#ff0000';
// }



