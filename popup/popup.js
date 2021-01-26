const record = document.getElementById("record");
const milliseconds = document.getElementById("milliseconds");
const options = {      
    videoBitsPerSecond : 2500000,
    mimeType : 'video/webm'
};
// time = milliseconds.value
if (record){
    record.onclick = function() {
        chrome.tabs.executeScript({
            code: `(${ getstream })(${ JSON.stringify({ time: milliseconds.value }) })`
        });    
        function getstream(time) {
            var canvas = document.querySelector("canvas");
            // Optional frames per second argument.
            var stream = canvas.captureStream(30);
            var recordedChunks = [];

            console.log(stream);
            var chromiumoptions = { mimeType: "video/webm; codecs=vp9" };
            var firefoxoptions = {mimeType: "video/webm;codecs=vp7"};
            var is_chrome = /chrome/i.test( navigator.userAgent );
            var isFirefox = typeof InstallTrigger !== 'undefined';
            if (is_chrome){
                mediaRecorder = new MediaRecorder(stream, chromiumoptions);
            } else if (isFirefox){
                mediaRecorder = new MediaRecorder(stream, firefoxoptions);
            }

            mediaRecorder.ondataavailable = handleDataAvailable;
            mediaRecorder.start();

            function handleDataAvailable(event) {
                console.log("data-available");
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                    console.log(recordedChunks);
                    download();
                 }
            }   
            function download() {
                var blob = new Blob(recordedChunks, {
                    type: "video/webm"
                });
                var url = URL.createObjectURL(blob);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = url;
                a.download = "scratch.webm";
                a.click();
                window.URL.revokeObjectURL(url);
            }
            setTimeout(event => {
                console.log("stopping");
                mediaRecorder.stop();
            }, time.time);
        }
    }
}

