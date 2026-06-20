var MoviePlayer = (function () {
    function init(config) {
        var video = document.querySelector(config.selector);
        var overlay = document.querySelector(config.overlay);
        var source = config.source;
        var hls = null;
        var attached = false;

        if (!video || !source) {
            return;
        }

        if (config.poster) {
            video.setAttribute('poster', config.poster);
        }

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            }
        }

        function start() {
            attachSource();
            video.controls = true;
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (!attached || video.paused) {
                start();
            } else {
                video.pause();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    return {
        init: init
    };
})();
