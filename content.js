var recognition = false;
// const script = document.createElement("script");

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
  if(request.data === "start"){
    init()
    recognition.start()
    console.log('recognition started')
  } else if(request.data === "stop") {
    recognition.stop()
    console.log('recognition stopped')
  }
});


const init = () => {

  /* listen for speech continuously */
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";
  recognition.onspeechstart = event => console.log("speech started");

  /* for websites other than netflix, try getting the HTMLVideoElement */
  if (location.origin !== "https://www.netflix.com"){
    var video = document.getElementsByTagName("video")[0];
  }

  /* respond to "play/pause/skip/rewind video" */
  recognition.onresult = event => {
   let last = event.results.length - 1;
   let interim_transcript = '';
   let final_transcript = '';

   for (var i = event.resultIndex; i < event.results.length; ++i) {
     if (event.results[i].isFinal) {
       final_transcript += event.results[i][0].transcript;
     } else {
       interim_transcript += event.results[i][0].transcript;
     }
   }
   // console.log(interim_transcript)

   if (interim_transcript.search("play video") != -1){
     // console.log('play video was said');
     (location.origin === "https://www.netflix.com") ? inject('player.play()') : video.play()
   }
   if (interim_transcript.search("pause video") != -1){
     // console.log('pause video was said');
     (location.origin === "https://www.netflix.com") ? inject('player.pause()') : video.play()
   }
   if (final_transcript.search("skip video") != -1){
     // console.log('skip video was said');
     (location.origin === "https://www.netflix.com") ? inject('player.seek(player.getCurrentTime() + 10000)') : video.currentTime += 10
   }
   if (final_transcript.search("rewind video") != -1){
     // console.log('rewind video was said');
     (location.origin === "https://www.netflix.com") ? inject('player.seek(player.getCurrentTime() - 10000)') : video.currentTime -= 10
  }
 }
}


/* if it's a netflix video, the following code must be injected to get videoplayer */
function initVideo() {
    var video = netflix.appContext.state.playerApp.getAPI().videoPlayer

    const playerSessionId = video.getAllPlayerSessionIds()[0]

    window.player = video.getVideoPlayerBySessionId(playerSessionId)

}

function inject(code) {
    const script = document.createElement("script");
    script.text = '(' + initVideo.toString() + ')();\n' + code
    document.documentElement.appendChild(script);
}
