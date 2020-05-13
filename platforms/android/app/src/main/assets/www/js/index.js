/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
const app = {
    // Application Constructor
    initialize: function() {
        if (window.hasOwnProperty('cordova')) {
            document.addEventListener('deviceready', app.onDeviceReady.bind(this));
            console.log('addEventListener deviceready');
        } else {
            document.addEventListener('DOMContentLoaded', app.onDeviceReady.bind(this));
            console.log('addEventListener DOMContentLoaded');
        }
        
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        console.log('deviceready');
        this.receivedEvent('deviceready');

        // listen for pause and resume events
        document.addEventListener('pause', app.paused);
        document.addEventListener('resume', app.resumed);

        const pauseResumeParagraph = document.querySelector('#pause-resume p');
        const data = localStorage.getItem('PauseApp');
        if (data) {
            let time = new Date(JSON.parse(data).timestamp);
            pauseResumeParagraph.textContent = `App was last paused at ${time.toLocaleString()}`;
        } else {
            pauseResumeParagraph.textContent = 'App has never been paused';
        }
        
        // device plugin
        const deviceParagraph = document.querySelector('#device p');
        deviceParagraph.innerHTML = `
            Cordova version: ${device.cordova}<br>
            Device platform: ${device.platform}<br>
            Device model: ${device.model}<br>
            Device uuid: ${device.uuid}<br>
            Device version: ${device.version}<br>
            Device manufacturer: ${device.manufacturer}<br>
            Device is virtual: ${device.isVirtual}<br>
            Device serial: ${device.serial}<br>
        `;

        // vibration plugin
        const vibrateButton = document.querySelector('#vibrate button');
        vibrateButton.addEventListener('click', this.vibrate);

        // dialog plugin
        document.querySelector('#dialog-alert').addEventListener('click', app.showAlert);
        document.querySelector('#dialog-confirm').addEventListener('click', app.showConfirm);
        document.querySelector('#dialog-prompt').addEventListener('click', app.showPrompt);

        // battery-status plugin
        window.addEventListener("batterystatus", this.onBatteryStatus, false);

        // cameara plugin
        const cameraButton = document.getElementById("cameraTakePicture");
        cameraButton.addEventListener("click", cameraTakePicture);

        function cameraTakePicture() {
            navigator.camera.getPicture(onSuccess, onFail, {
                quality: 80,
                destinationType: Camera.DestinationType.DATA_URL,
                targetWidth: 200,
                correctOrientation: true
            });

            function onSuccess(imageData) {
                var image = document.getElementById('camera-image');
                image.src = "data:image/jpeg;base64," + imageData;
            }

            function onFail(message) {
                alert('Failed because: ' + message);
            }
        }

    },
    showAlert: function(ev) {
        console.log('showAlert event', ev);
        const p = ev.currentTarget;
        navigator.notification.alert('Thanks for clicking', () => {
            p.style.backgroundColor = 'gold';
        }, 'Custom Title', 'Dismiss')
    },

    vibrate: function() {
        navigator.vibrate(3000)
    },
    onBatteryStatus: function (status) {
        const b = document.querySelector('#battery-status p');
        b.innerHTML = `Battery Level: ${status.level}, isPlugged: ${status.isPlugged}`;
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        const parentElement = document.getElementById(id);
        const listeningElement = parentElement.querySelector('.listening');
        const receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    paused: function (ev) {
        console.dir(ev);
        //save the  current timeStamp in localstorage
        const obj = { 'timestamp': Date.now() };
        localStorage.setItem('PauseApp', JSON.stringify(obj));
    },
    resumed: function (ev) {
        console.dir(ev);
        const data = localStorage.getItem('PauseApp');
        if (data) {
            const pauseResumeParagraph = document.querySelector('#pause-resume p');
            const time = new Date(JSON.parse(data).timestamp);
            pauseResumeParagraph.textContent = `App was last paused at ${time.toLocaleString()}`;
        } else {
            pauseResumeParagraph.textContent = 'App has never been paused';
        }
    }
};

app.initialize();