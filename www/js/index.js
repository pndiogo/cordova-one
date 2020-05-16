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
    initialize: function () {
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
    onDeviceReady: function () {
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

        // camera plugin
        const cameraButton = document.querySelector('#cameraTakePicture');
        cameraButton.addEventListener("click", app.cameraTakePicture);

        // media plugin
        app.addMediaListeners();
        let src = app.track.src;
        app.media = new Media(src, app.ftw, app.wtf, app.statusChange);

        // local notifications plugin
        app.addNotificationsListeners();
    },
    cameraTakePicture() {
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 80,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            mediaType: Camera.MediaType.PICTURE,
            encodingType: Camera.EncodingType.JPEG,
            cameraDirection: Camera.Direction.BACK,
            allowEdit: true,
            targetWidth: 225,
            targetHeight: 225,
            correctOrientation: true
        });

        function onSuccess(imageData) {
            const cameraImage = document.getElementById('camera-image');
            cameraImage.src = imageData;

            const cameraParagraph = document.querySelector('#cameraTakePicture p');
            cameraParagraph.textContent = imageData;
        }

        function onFail(message) {
            const cameraParagraph = document.querySelector('#cameraTakePicture p');
            cameraParagraph.textContent = message;
        }
    },
    showAlert: function (ev) {
        console.log('showAlert event', ev);
        const p = ev.currentTarget;
        navigator.notification.alert('Thanks for clicking', () => {
            p.style.backgroundColor = 'gold';
        }, 'Custom Title', 'Dismiss')
    },
    showConfirm: function (ev) {
        console.log('showConfirm event', ev);
        const buttons = ['You Betcha', 'Not Yet'];
        const p = ev.currentTarget;
        navigator.notification.confirm('Have you ever been to Istanbul?',
            /*   The callback takes the argument buttonIndex(Number), which is the index of the pressed button.Note that the index uses one - based indexing, so the value is 1, 2 etc. 0 means they closed the dialog without clicking a button */
            (buttonIndex) => {
                p.style.backgroundColor = 'pink';
                p.innerHTML = '<br />You clicked ' + buttons[buttonIndex - 1]
            }, 'Turkish Tourism', buttons)
    },
    showPrompt: function (ev) {
        console.log('showPrompt event', ev);
        const buttons = ['Confirm', 'Cancel'];
        const p = ev.currentTarget;
        navigator.notification.prompt('Name a country that neighbouts Turkey',
            (response) => {
                // response.input1 = what they wrote
                // response.buttonIndex = the index number of the button they clicked (0 is the X cancel)
                p.style.backgroundColor = 'purple';
                p.innerHTML = '<br />You said ' + response.input1;
            }, 'Geography', buttons, 'Not Poland')
    },
    vibrate: function () {
        navigator.vibrate(3000)
    },
    onBatteryStatus: function (status) {
        const b = document.querySelector('#battery-status p');
        b.innerHTML = `Battery Level: ${status.level}, isPlugged: ${status.isPlugged}`;
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
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
    },
    track: {
        src: 'file:///android_asset/www/media/hellena.mp3',
        title: 'Fight Club Rules',
        volume: 0.5
    },
    media: null,
    status: {
        '0': 'MEDIA_NONE',
        '1': 'MEDIA_STARTING',
        '2': 'MEDIA_RUNNING',
        '3': 'MEDIA_PAUSED',
        '4': 'MEDIA_STOPPED'
    },
    err: {
        '1': 'MEDIA_ERR_ABORTED',
        '2': 'MEDIA_ERR_NETWORK',
        '3': 'MEDIA_ERR_DECODE',
        '4': 'MEDIA_ERR_NONE_SUPPORTED'
    },
    ftw: function () {
        //success creating the media object and playing, stopping, or recording
        console.log('success doing something');
    },
    wtf: function (err) {
        //failure of playback of media object
        console.warn('failure');
        console.error(err);
    },
    statusChange: function (status) {
        console.log('media status is now ' + app.status[status]);
    },
    addMediaListeners: function () {
        document.querySelector('#play-btn').addEventListener('click', app.play);
        document.querySelector('#pause-btn').addEventListener('click', app.pause);
        document.querySelector('#up-btn').addEventListener('click', app.volumeUp);
        document.querySelector('#down-btn').addEventListener('click', app.volumeDown);
        document.querySelector('#ff-btn').addEventListener('click', app.ff);
        document.querySelector('#rew-btn').addEventListener('click', app.rew);
        document.addEventListener('pause', () => {
            app.media.release();
        });
        document.addEventListener('menubutton', () => {
            console.log('clicked the menu button');
        });
        document.addEventListener('resume', () => {
            app.media = new Media(src, app.ftw, app.wtf, app.statusChange);
        })
    },
    play: function () {
        app.media.play();
    },
    pause: function () {
        app.media.pause();
    },
    volumeUp: function () {
        vol = parseFloat(app.track.volume);
        console.log('current volume', vol);
        vol += 0.1;
        if (vol > 1) {
            vol = 1.0;
        }
        console.log(vol);
        app.media.setVolume(vol);
        app.track.volume = vol;
    },
    volumeDown: function () {
        vol = app.track.volume;
        console.log('current volume', vol);
        vol -= 0.1;
        if (vol < 0) {
            vol = 0;
        }
        console.log(vol);
        app.media.setVolume(vol);
        app.track.volume = vol;
    },
    ff: function () {
        app.media.getCurrentPosition((pos) => {
            let dur = app.media.getDuration();
            console.log('current position', pos);
            console.log('duration', dur);
            pos += 10;
            if (pos < dur) {
                app.media.seekTo(pos * 1000);
            }
        });
    },
    rew: function () {
        app.media.getCurrentPosition((pos) => {
            pos -= 10;
            if (pos > 0) {
                app.media.seekTo(pos * 1000);
            } else {
                app.media.seekTo(0);
            }
        });
    },
    addNotificationsListeners: function () {
        // https://www.youtube.com/watch?v=pSjbcsDT2PM&list=PLyuRouwmQCjkLnfGRHMosenaxPq9PqH0n&index=20
        // https://gist.github.com/prof3ssorSt3v3/fe22e9cc031f53213900fcb8d010958f
        //Build (XCode 10 causes build issues for iOS so it needs the --buildFlag)
        // cordova emulate ios --target="iPhone-8, 12.0" --buildFlag="-UseModernBuildSystem=0"
        document.querySelector("#add-btn").addEventListener("click", app.addNote);
        cordova.plugins.notification.local.on("click", function (notification) {
            navigator.notification.alert("clicked: " + notification.id);
            //user has clicked on the popped up notification
            console.log(notification.data);
        });
        cordova.plugins.notification.local.on("trigger", function (notification) {
            //added to the notification center on the date to trigger it.
            navigator.notification.alert("triggered: " + notification.id);
        });
    },
    addNote: function (ev) {
        let props = cordova.plugins.notification.local.getDefaults();
        console.log(props);
        /**
         * Notification Object Properties - use it as a reference later on
         * id
         * text
         * title
         * every
         * at
         * data
         * sound
         * badge
         */
        let inOneMin = new Date();
        inOneMin.setMinutes(inOneMin.getMinutes() + 1);
        let id = new Date().getMilliseconds();

        let noteOptions = {
            id: id,
            title: "This is the Title",
            text: "Don't forget to do that thing.",
            at: inOneMin,
            badge: 1,
            data: {
                prop: "prop value",
                num: 42
            }
        };

        /**
         * if(props.icon){
          noteOptions.icon = './img/calendar-md-@2x.png'
        }
        if(props.led){
          noteOptions.led = '#33CC00'
        }
        if(props.actions){
          noteOptions.actions = [{ id: "yes", title: "Do it" }, { id: "no", title: "Nah" }]
        }
        **/
        cordova.plugins.notification.local.schedule(noteOptions, function (note) {
            //this is the callback function for the schedule method
            //this runs AFTER the notification has been scheduled.
        });

        navigator.notification.alert("Added notification id " + id);

        cordova.plugins.notification.local.cancel(id, function () {
            // will get rid of notification id 1 if it has NOT been triggered or added to the notification center
            // cancelAll() will get rid of all of them
        });
        cordova.plugins.notification.local.clear(id, function () {
            // will dismiss a notification that has been triggered or added to notification center
        });
        cordova.plugins.notification.local.isPresent(id, function (present) {
            // navigator.notification.alert(present ? "present" : "not found");
            // can also call isTriggered() or isScheduled()
            // getAllIds(), getScheduledIds() and getTriggeredIds() will give you an array of ids
            // get(), getAll(), getScheduled() and getTriggered() will get the notification based on an id
        });

    }
};

app.initialize();