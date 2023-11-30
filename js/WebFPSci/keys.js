/*
The MIT License (MIT)

Copyright (c) 2021 NVIDIA CORPORATION & AFFILIATES

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

/**
 * Handle keypresses from the application
 * @param {Application level keypress} event 
 */
var keyDownHandler = function (event) {
  switch ( event.keyCode ) {
    case 38: // Up arrow press
      if(state == "sensitivity") {
        sensitivitySlider.stepUp(1);
        sensitivitySlider.oninput();
      }
      else if(state == "latency") {
        latencySlider.stepUp(1);
        latencySlider.oninput();
      }
      break;
    case 40: // Down arrow press
      if(state == "sensitivity"){
        sensitivitySlider.stepDown(1);
        sensitivitySlider.oninput();
      }
      else if(state == "latency") {
        latencySlider.stepDown(1);
        latencySlider.oninput();
      }
      break;
    case 73: // "I" key press (toggle mouse inversion)
      if(state == "sensitivity"){
        invertYCheckbox.checked = !invertYCheckbox.checked;
        invertYCheckbox.oninput();
      }
      break;
    case 13: // Enter key press
      if(state == "sensitivity" || state == "latency"){
        nextState();
      }
      break;
  }  
}
document.addEventListener( 'keydown', keyDownHandler, false);