// ============================================

const uploadBox = document.querySelector('.upload-box'),
    previewImage = uploadBox.querySelector('img'),
    fileInput = uploadBox.querySelector('input'),
    widthInput = document.querySelector('.width input'),
    heightInput = document.querySelector('.height input'),
    ratioInput = document.querySelector('.ratio input'),
    qualityInput = document.querySelector('.quality input'),
    downloadBtn = document.querySelector('.download-btn')

let ogImageRatio;

const loadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return
    previewImage.src = URL.createObjectURL(file)
    previewImage.addEventListener('load', () => {
        widthInput.value = previewImage.naturalWidth;
        heightInput.value = previewImage.naturalHeight;
        ogImageRatio = previewImage.naturalWidth / previewImage.naturalHeight;
        document.querySelector('.container').classList.add('active')
    })
}

widthInput.addEventListener('keyup', () => {
    const height = ratioInput.checked ? widthInput.value / ogImageRatio : heightInput.value;
    heightInput.value = Math.floor(height);
})

heightInput.addEventListener('keyup', () => {
    const width = ratioInput.checked ? heightInput.value * ogImageRatio : widthInput.value;
    widthInput.value = Math.floor(width);
})

const resizeDownload = () => {
    const canvas = document.createElement('canvas')
    const a = document.createElement('a')
    const ctx = canvas.getContext('2d')
    const imgQuality = qualityInput.checked ? 0.7 : 1.0;

    canvas.width = widthInput.value;
    canvas.height = heightInput.value;
    ctx.drawImage(previewImage, 0, 0, canvas.width, canvas.height)

    a.href = canvas.toDataURL("image/", imgQuality)
    a.download = new Date().getTime()
    a.click()
}

downloadBtn.addEventListener('click', resizeDownload)
fileInput.addEventListener('change', loadFile)
uploadBox.addEventListener('click', () => fileInput.click())

// ==========================================================

function compressAudio() {
    var fileInput = document.getElementById('input-file');
    var file = fileInput.files[0];

    if (!file) {
        alert("Please select an audio file.");
        return;
    }

    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var reader = new FileReader();

    reader.onload = function (e) {
        audioContext.decodeAudioData(e.target.result, function (buffer) {
            var compressor = audioContext.createDynamicsCompressor();
            compressor.threshold.value = -30;
            compressor.knee.value = 10;
            compressor.ratio.value = 12;
            compressor.attack.value = 0;
            compressor.release.value = 0.25;

            var source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(compressor);
            compressor.connect(audioContext.destination);

            source.start();

            setTimeout(function () {
                var offlineContext = new OfflineAudioContext(1, buffer.length, audioContext.sampleRate);
                var offlineSource = offlineContext.createBufferSource();
                offlineSource.buffer = buffer;

                offlineSource.connect(offlineContext.destination);
                offlineSource.start(0);
                offlineContext.startRendering().then(function (renderedBuffer) {
                    var compressedAudio = new Blob([renderedBuffer], { type: 'audio/mp3' });

                    var downloadLink = document.getElementById('downloadLink');
                    downloadLink.href = URL.createObjectURL(compressedAudio);
                    downloadLink.style.display = 'block';
                });
            }, buffer.duration * 1000);
        });
    };

    reader.readAsArrayBuffer(file);
}

document.getElementById('input-file').addEventListener('change', function (event) {
    var audioElement = document.getElementById('previewAudio');
    audioElement.src = URL.createObjectURL(event.target.files[0]);
});

document.getElementById('downloadLink').addEventListener('click', function () {
    var fileInput = document.getElementById('input-file');
    var file = fileInput.files[0];

    if (file) {
        this.download = 'compressed_' + file.name;
    }
});
