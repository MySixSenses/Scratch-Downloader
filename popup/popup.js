const record = document.getElementById("record");
const milliseconds = document.getElementById("milliseconds");
const options = {
    videoBitsPerSecond: 2500000,
    mimeType: 'video/webm'
};

async function getTabId() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.id;
}

if (record) {
    record.onclick = async function () {
        chrome.scripting.executeScript({
            func: getstream,
            args: [{ time: milliseconds.value }],
            target: { tabId: await getTabId() },
        });
        function getstream(time) {
            var canvas = document.querySelector("canvas");
            if (canvas === undefined) {
                alert("Scratch Downloader couldn't find a canvas on this webpage");
                return;
            }
            // Optional frames per second argument.
            var stream = canvas.captureStream(30);
            var recordedChunks = [];

            console.log(stream);
            var vp9codec = { mimeType: "video/webm; codecs=vp9" };
            var vp8codec = { mimeType: "video/webm;codecs=vp8" };
            let mediaRecorder;
            try {
                mediaRecorder = new MediaRecorder(stream, vp9codec);
            } catch (e) {
                try {
                    mediaRecorder = new MediaRecorder(stream, vp8codec);
                } catch (e) {
                    alert("It appears your browser doesn't support either video source.")
                    return;
                }
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
                a.download = "video.webm";
                a.click();
                window.URL.revokeObjectURL(url);
            }
            setTimeout(() => {
                console.log("stopping");
                mediaRecorder.stop();
            }, time.time);
        }
    }
}

