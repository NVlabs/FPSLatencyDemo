function addUser() {
    var userSettingsDiv = document.getElementById('userSettings');
    var newUserDiv = document.createElement('div');
    newUserDiv.setAttribute('class', 'userSetting');

    var userNameLabel = document.createElement('label');
    userNameLabel.textContent = "User Name:";
    var userNameInput = document.createElement('input');
    userNameInput.setAttribute('type', 'text');
    userNameInput.setAttribute('class', 'userName');

    var sensitivityLabel = document.createElement('label');
    sensitivityLabel.textContent = "Sensitivity:";
    var sensitivityInput = document.createElement('input');
    sensitivityInput.setAttribute('type', 'number');
    sensitivityInput.setAttribute('class', 'userSensitivity');

    newUserDiv.appendChild(userNameLabel);
    newUserDiv.appendChild(userNameInput);
    newUserDiv.appendChild(sensitivityLabel);
    newUserDiv.appendChild(sensitivityInput);

    userSettingsDiv.appendChild(newUserDiv);
}

function generateLinks() {
    var frameRate = parseInt(document.getElementById('frameRate').value);
    var maxLatency = parseInt(document.getElementById('maxLatency').value);
    var numExperiences = parseInt(document.getElementById('numExperiences').value);
    var duration = document.getElementById('duration').value;
    var userSettings = document.getElementsByClassName('userSetting');

    var linksDiv = document.getElementById('links');
    linksDiv.innerHTML = '';

    for (var i = 0; i < userSettings.length; i++) {
        var userName = userSettings[i].getElementsByClassName('userName')[0].value;
        var userSensitivity = userSettings[i].getElementsByClassName('userSensitivity')[0].value;

        if (userName) {
            var userHeader = document.createElement('h3');
            userHeader.textContent = userName;
            linksDiv.appendChild(userHeader);

            // This creates a list of frame delays to evenly divide from 0 to the max latency rounded up to the nearest
            var frameDelays = [];
            var latencyIncrement = maxLatency / (numExperiences - 1);
            var frameDelayIncrement = (1000.0/frameRate);
            for (var j = 0; j < numExperiences; j++) {
                var numFrames = Math.ceil(j * latencyIncrement / frameDelayIncrement);
                frameDelays.push(numFrames);
            }

            var link = document.createElement('a');
            var url = `index.html?username=${encodeURIComponent(userName)}&mouseSensitivity=${userSensitivity}&frameDelays=${frameDelays.join(',')}&measurementDuration=${duration}`;
            link.setAttribute('href', url);
            link.setAttribute('target', "_blank");
            link.textContent = `Link for ${userName}`;
            linksDiv.appendChild(link);
            linksDiv.appendChild(document.createElement('br'));
        }
    }
}
