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

"use strict"                      // Execute this code in "strict mode"

// Compute the average over an array
Array.prototype.avg = function() {
    return this.reduce((sum,el) => sum + el, 0) / this.length;
}
  
  // Linearly interpolate between two values
var lerp = function(v1, v2, a) {
    a = Math.min(a, 1); a = Math.max(0, a);   // Make sure 0 < a < 1
    return v1 + (v2-v1) * a;                  // Return interpolation result
}

/**
 * Draw a random number from a range
 * @param {Lower bound} min 
 * @param {Upper bound} max 
 */
function randInRange(min, max) { return (max - min) * Math.random() + min; }

/** Random sign (±1) */
function randSign() { return Math.random() < 0.5 ? -1 : 1; }

/**
 * Generate a random position at a given radius (from the origin)
 * @param {Radial distance} radius 
 * @returns Random position at distance
 */
function randomPosition(radius) {
  radius = radius * Math.random();
  const theta = Math.random() * 2.0*Math.PI;
  const phi = Math.random() * Math.PI;
  return [radius * Math.sin(phi) * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi)];
}