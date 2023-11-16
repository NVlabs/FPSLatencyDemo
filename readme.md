# Web-based FPSci Latency Demo
This is a simple interactive experience intended to demonstrate the effects of added latency on first-person aiming/tracking tasks.

## Experience
The user begins by opening/reloading the page which resets the experiment state. The experiment consists of 3 states: sensitivity adjustment, latency selection, then measurement and display of results. Note that the user cannot move or jump in this experiment, just aim at/track the target.

The **sensitivity adjustment** phase allows the user to set a mouse sensitivity (and inversion if desired), using either the up/down arrow keys or a slider (press I for inversion), they prefer while familiarizing themselves with the target task (destroying a static reference target then tracking a strafing/jumping task target). 

Following this state the user enters **latency selection**, wherein they should select the *minimum* amount of latency they can detect while aiming. This can also be done using either the up/down arrow keys or a slider at the top of the window. Note that latency is added by *frame* delay so the frame rate the experiment can run at on your system will set the minimum step achievable in latency. We recommend systems that can hit at least 100 fps to run this experiment.

Finally the user enters the **measurement** state, which consists of 3 phases. In the first phase the user plays at the full latency they selected in the previous state, unless they selected a 0 or 1 frame of latency, in which case they will play at 2 frames of latency. In the next phase they play at half the latency of their first phase, an amount that should feel less/non-percetible to them. In the 3rd and final phase the user plays at the minimum system latency, which should correspond to the best perception/highest performance. Once complete a simple graphic appears showing the user the total/percentage of time they spent on target in each condition and the difference between the baseline (0 added latency) and each of the added latency conditions.

After completing the experiment the code falls back into "sandbox" mode wherein the user can modify parameters freely while adjusting system latency.

## Running the Application
The application works in a browser run from one of two modes:

* File hosted mode: Works when not using assets with the application (i.e. no local files/images requires)
* Hosted from `localhost` 

### File Hosted
To open the application in file hosted mode simply open the `index.html` page in a browser of your choice. Here all features will work *except* those that require local file contents.

### Running with Local Host
To run with local host the top-level directory for this project needs to be hosted through `localhost`. This can be done with Python using the `python -m http.server` command and a script ([`open_localhost.bat`](open_localhost.bat)) is provided to do exactly this (plus open the correct URL).

After hosting the directory through `localhost` the application can be accessed by visiting `http://localhost:8000/index.html`.

## Supported Configuration
A variety of configuration from the (Windows) FPSci application is supported in this application. The application can be configured either through loading a JSON file from disk, or by using URL parameters.

Currently supported configuration is provided as a nested list below. The format is: [Parameter Name]: [`URL Parameter Name`] (`type`) = [Default Value].

Typically JSON parameter names are _very_ similar to URL parameter names, but often with less verbosity as they are inherently nested in the configuration dictionary.

* Experiment
    * Randomize latency condition order? : `randomizeOrder` (`Boolean`) = `False`
    * The time (in seconds) to measure for each experiment: `measurementDuration` (`Number`) = `60`
    * The frame rate at which to warn user for perf: `warnFrameRate` (`Number`) = `30`
    * The initial JND latency target in milliseconds (may not be accurate!): `defaultLatencyMs` (`Number`) = `66`

* Rendering
    * Set frame rate?: `setFPS` (`Boolean`) = `False`
    * Frame rate: `frameRate` (`Number`) = `60`
    * Frame delay: `frameDelay` (`Integer`) = `0`
    * Late warp correction?: `latewarp` (`Boolean`) = `False`
    * Field of View (horizontal): `hFoV` (`Number`) = `103`
    * Show rendering statistics?: `showStats` (`Boolean`) = `False`
    * Show score banner?: `showBanner` (`Boolean`) = `True`
    * Fullscreen mode?: `fullscreen` (`Boolean`) = `True`
    * Click-to-photon monitoring
        * Show click to photon-monitor?: `showC2P` (`Boolean`) = `False`
        * Certical position: `c2pVertPos` (`Boolean`) = `0.5`
        * Output mode: `c2pMode` (`"immediate"` or `"delayed"`) = `"immediate"`
        * Width of area: `c2pWidth` (`Number` 0-1) = `0.2`
        * Height of area: `c2pHeight` (`Number` 0-1) = `0.2`
        * Mouse up color: `c2pUpColor` (`Color`) = `#222222`
        * Mouse down color: `c2pDownColor` (`Color`) = `#AAAAAA`
* Audio
    * Play fire audio?: `playFireSound` (`Boolean`) = `True`
    * Play target explision audio?: `playExplodeSound` (`Boolean`) = `True`
    * Added audio latency: `AudioDelayMs` (`Number`) = `0`
* Scene - Generated, so different from FPSci
    * Sky color (no cubemap): `skyColor` (`Color`) = `#c6defa`
    * Use a cubemap-based skybox?: `cubemapSky` (`Boolean`) = `False`
    * Scene width: `sceneWidth` (`Number`) = `1000`
    * Scene depth: `sceneDepth` (`Number`) = `1000`
    * Floor color: `floorColor` (`Color`) = `#756b5a`
    * Fog 
        * Color: `fogColor` (`Color`) = `#ffffff`
        * Near distance: `fogNear` (`Number`) = `0`
        * Far distance: `fogFar` = `1000`
    * Walls (scene bounds)
        * Color: `wallColor` (`Color`) = `#2a2713`
        * Height: `wallHeight` (`Number`) = `80`
    * Boxes (geometry within the scene)
        * Count of boxes: `boxCount` (`Integer`) = `200`
        * Min height (uniform random in range): `boxMinHeight` (`Number`) = `20`
        * Max height (uniform random in range): `boxMaxHeight` (`Number`) = `100`
        * Width (same for all): `boxWidth` (`Number`) = `20`
        * Depth (same for all): `boxDepth` (`Number`) = `20`
        * Distance from boxes to player spawn postion: `boxRange` (`Number`) = `500`
        * Minimum distance from box to player (clearing size): `boxMinDistance` (`Number`) = `80`
        * Base color (scaled): `boxColor` (`Color`) = `#ffffff`
        * Color scale range (randomized range): `boxColorScale` (`Number` 0-1) = `0.5`
    * _Regenerate a new (random) scene based on parameters above using a button or by reloading_
* Player
    * Movement Speed: `playerSpeed` (`Number`) = `0`
    * Mouse sensitivity (arbitrary units): `mouseSensitivity` (`Number`) = `0.2`
    * Y inversion: `invertY` (`Boolean`) = `False`
    * Height: `playerHeight` (`Number`) = `5`
    * Jump Height: `playerJumpHeight` (`Number`) = `250`
    * Collision detection (within the scene): `playerCollision` (`Boolean`) = `True`
    * Collision distance: `playerCollisionDistance` (`Number`) = `3`
    * Reticle (aim direction indicator)
        * Color: `reticleColor` (`Color`) = `#000000`
        * Base size (extents): `reticleSize` (`Number`) = `0.03`
        * Gap size: `reticleGap` (`Number`) = `0.01`
        * Expanded scale (after a shot): `reticleExpandScale` (`Number` ratio) = `2`
        * Shrink time (after a shot): `reticleShrinkTime` (`Number` seconds) = `0.3`
* Target
    * Count (simultaneous targets): `targetCount` (`Integer`) = `1`
    * Min size (uniform random in range): `targetMinSize` (`Number`) = `0.6`
    * Max size (uniform random in range): `targetMaxSize` (`Number`) = `0.6`
    * Movement parameters (uniformly randomized in range)
        * Min speed (along a line): `targetMinSpeed` (`Number`) = `5`
        * Max speed (along a line): `targetMaxSpeed` (`Number`) = `15`
        * Min motion change time (new direction selection interval): `targetMinChangeTime` (`Number`) = `1`
        * Max motion change time (new direction selection interval): `targetMaxChangeTime` (`Number`) = `3`
    * Color (full/min health are interpolated between)
        * Full/max health color: `targetMaxHealthColor` (`Color`) = `#00ff00`
        * Min/no health color: `targetMinHealthColor` (`Color`) = `#ff0000`
    * Spawn position (uniformly randomized in range)
        * Min spawn distance: `targetMinSpawnDistance` (`Number`) = `30`
        * Max spawn distance: `targetMaxSpawnDistance` (`Number`) = `30`
        * Spawn angle control  (± relative to most recent player view)
            * Max azimuth spawn angle: `targetSpawnMaxAzim` (`Number` degrees) = `35`
            * Min azimuth spawn angle: `targetSpawnMinAzim` (`Number` degrees) = `20`
            <!-- * Max elevation spawn angle: `targetSpawnMaxElev` (`Number` degrees) = `10`
            * Min elevation spawn angle: `targetSpawnMinElev` (`Number` degrees) = `3` -->
    * Target height above ground: `targetHeight` (`Number`) = 6
    * Target jumps
        * Can target jump?: `targetJump` (`Boolean`) = `True`
        * Can target crouch?: `targetCrouch` (`Boolean`) = `True`
        * Crouch height: `targetCrouchHeight` (`Number`) = `4`
        * Jump speed: `targetJumpSpeed` (`Number`) = `20`
        * Jump gravity: `targetJumpGravity` (`Number`) = `65`
        * Min time between jumps/crouches: `targetMinJumpCrouchTime` (`Number`) = `1`
        * Max time between jumps/crouches: `targetMaxJumpCrouchTime` (`Number`) = `2`
    * Reference target (red target used to reset aim direction on reload/start of trial)
        * Size: `refTargetSize` (`Number`) = `1`
        * Distance: `refTargetDistance` (`Number`) = `30`
    * Particles (drawn on hit/destory events)
        * Size: `particleSize` (`Number`): `0.4`
        * Count to spawn on hit: `hitParticleCount` (`Integer`) = `25`
        * Count to spawn on destroy: `destroyParticleCount` (`Integer`) = `1000`
* Weapon
    * Automatic fire (hold left mouse to fire): `weaponAuto` (`Boolean`) = `False`
    * Fire period (rate of fire): `weaponFirePeriod` (`Number`) = `0.1` (10 shots per s ==> 600 rounds per minute)
    * Damage/s (multiply by fire period to get damage/shot): `weaponDPS` (`Number`) = `10` (1-hit destroy as all targets have 1 life)
    * Fire spread angle (symmetric): `weaponFireSpread` (`Number` degrees) = `0.5`
    * Scope controls
        * Has scope?: `weaponScope` (`Boolean`) = `False`
        * Toggle vs hold for scope: `weaponScopeToggle` (`Boolean`) = `True` (toggled scope by default)
        * Field of view when scoped: `weaponScopeFoV` (`Number`) = `50`
    * Miss Particles
        * Draws miss particles?: `weaponMissParticles` (`Boolean`) = `False`
        * Miss particle size: `weaponMissParticleSize` (`Number`) = 0.2
        * Miss particle count: `weaponMissParticleCount` (`Integer`) = 50