function captureUserMedia(mediaConstraints, successCallback, errorCallback)
{
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
}
// commonly allowed resolutions:
// ['1920:1080',
// '1280:720',
// '960:720',
// '640:360',
// '640:480',
// '320:240',
// '320:180']
var resolution_x = 1280;
var resolution_y = 720;
var mediaConstraints = {
    audio: true,
    video: IsEdge ? true : {
        mandatory: {
            maxWidth: resolution_x,
            maxHeight: resolution_y,
            //minFrameRate: 3,
            //maxFrameRate: 64,
            //minAspectRatio: 1.77
        }
    }
};
document.querySelector('#start-recording').onclick = function ()
{
    this.disabled = true;
    captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
};
document.querySelector('#stop-recording').onclick = function ()
{
    this.disabled = true;
    multiStreamRecorder.stop();
    multiStreamRecorder.stream.stop();
    document.querySelector('#pause-recording').disabled = true;
    document.querySelector('#start-recording').disabled = false;
};
document.querySelector('#pause-recording').onclick = function ()
{
    this.disabled = true;
    multiStreamRecorder.pause();
    document.querySelector('#resume-recording').disabled = false;
};
document.querySelector('#resume-recording').onclick = function ()
{
    this.disabled = true;
    multiStreamRecorder.resume();
    document.querySelector('#pause-recording').disabled = false;
};

var multiStreamRecorder;
var audioVideoBlobs = {};
var recordingInterval = 0;

function onMediaSuccess(stream)
{
    var video = document.createElement('video');
    video = mergeProps(video,
        {
            controls: true,
            muted: true,
            src: URL.createObjectURL(stream)
        });
    //video.width = resolution_x;
    //video.height = resolution_y;
    video.addEventListener('loadedmetadata', function ()
    {
        multiStreamRecorder = new MultiStreamRecorder(stream);
        multiStreamRecorder.stream = stream;
        // below line is optional
        // because we already set "video.width"
        // and "video.height"....5 lines above
        multiStreamRecorder.canvas = {
            width: video.width,
            height: video.height
        };
        multiStreamRecorder.video = video;
        multiStreamRecorder.ondataavailable = function (blobs)
        {
            appendLink(blobs.audio);
            appendLink(blobs.video);
        };
        function appendLink(blob)
        {
            var a = document.createElement('a');
            a.target = '_blank';
            a.innerHTML = 'Open ' + (blob.type == 'audio/ogg' ? 'Audio' : 'Video') + ' No. ' + (index++) + ' (Size: ' + bytesToSize(blob.size) + ') Time Length: ' + getTimeLength(timeInterval);
            a.href = URL.createObjectURL(blob);
            records.appendChild(a);
            records.appendChild(document.createElement('hr'));
        }
        var timeInterval = document.querySelector('#time-interval').value;
        if (timeInterval) timeInterval = parseInt(timeInterval);
        else timeInterval = 5 * 1000;
        // get blob after specific time interval
        multiStreamRecorder.start(timeInterval);
        document.querySelector('#stop-recording').disabled = false;
        document.querySelector('#pause-recording').disabled = false;
    }, false);
    video.play();
    container.appendChild(video);
    container.appendChild(document.createElement('hr'));
}
function onMediaError(e)
{
    console.error('media error', e);
}
var container = document.getElementById('container');
var index = 1;
function bytesToSize(bytes)
{
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}
function getTimeLength(milliseconds)
{
    var data = new Date(milliseconds);
    return data.getUTCHours() + " hours, " + data.getUTCMinutes() + " minutes and " + data.getUTCSeconds() + " second(s)";
}
window.onbeforeunload = function ()
{
    document.querySelector('#start-recording').disabled = false;
};