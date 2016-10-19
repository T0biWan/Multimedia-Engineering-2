/**
* @author: Leon Rösler
* @author: Marlon Mattern
* @author: Tobias Klatt
* Datei: app.js
* Datum: 16.10.2016
* 
* This JavaScript-Programm initialises the functionality of our website.
* There is a button for every video.
* Within the following code buttons and videos get connected,
* so a user can start or pause a video by clicking the right button.
*/

(function () {
    window.addEventListener("load", connectButtonsWithVideos, false);

    function connectButtonsWithVideos() {
        var buttonArray = document.getElementsByTagName("button");
        var videoArray = document.getElementsByTagName("video");

        for (i = 0; i < buttonArray.length; i++) {
            (function () {
                var button = buttonArray[i];
                var video = videoArray[i];
                button.addEventListener("click", function() {
                    playOrPauseVideoDependingOnStatus(video, button);
                    switchButton();
                   });
            })();
        }
    }

    function playOrPauseVideoDependingOnStatus(video, button) {
        var videoIsPaused = video.paused;
        if (videoIsPaused) {
            video.play();
            button.classList.add("btnPause");
            button.innerHTML = "PAUSE";
            button.classList.remove("btnPlay");
        } else {
            video.pause();
            button.classList.add("btnPlay");
            button.innerHTML = "PLAY";
            button.classList.remove("btnPause");
        }
    }
    
    function switchButton(){
        console.log("Test");
    }
})();