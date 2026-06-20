(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        document.querySelectorAll('.stream-player').forEach(function (player) {
            var video = player.querySelector('video');
            var overlay = player.querySelector('.stream-overlay');
            var message = player.querySelector('.stream-message');
            var source = video ? video.getAttribute('data-stream') : '';
            var attached = false;
            var hls = null;

            function showMessage(text) {
                if (message) {
                    message.textContent = text;
                    message.classList.add('show');
                }
            }

            function attachSource() {
                if (!video || !source || attached) {
                    return;
                }
                attached = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
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
                        } else {
                            showMessage('播放暂不可用，请稍后重试');
                        }
                    });
                    return;
                }

                video.src = source;
            }

            function play() {
                if (!video) {
                    return;
                }
                attachSource();
                video.controls = true;
                if (overlay) {
                    overlay.classList.add('hidden');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove('hidden');
                        }
                        showMessage('点击播放按钮开始观看');
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener('click', play);
            }

            if (video) {
                video.addEventListener('click', function () {
                    if (!attached || video.paused) {
                        play();
                    }
                });
                video.addEventListener('play', function () {
                    if (overlay) {
                        overlay.classList.add('hidden');
                    }
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    });
})();
