document.getElementById("play1").addEventListener("click", playVid);
document.getElementById("pause1").addEventListener("click", pauseVid); 

var vid = document.getElementById("video1");


function playVid() { 
    vid.play(); 
} 

function pauseVid() { 
    vid.pause(); 
}