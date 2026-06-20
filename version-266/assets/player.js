import { H as Hls } from './video-vendor-dru42stk.js';

function setMessage(frame, text) {
  var message = frame.querySelector('.player-message');
  if (message) {
    message.textContent = text || '';
  }
}

function attachHls(video, source, frame) {
  return new Promise(function (resolve, reject) {
    if (!source) {
      reject(new Error('没有可用播放源'));
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', resolve, { once: true });
      video.addEventListener('error', function () {
        reject(new Error('浏览器无法加载播放源'));
      }, { once: true });
      return;
    }

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        resolve();
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            setMessage(frame, '网络波动，正在重新连接播放源。');
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            setMessage(frame, '播放器正在自动恢复。');
          } else {
            hls.destroy();
            reject(new Error('播放源加载失败'));
          }
        }
      });
      return;
    }

    reject(new Error('当前浏览器不支持 HLS 播放'));
  });
}

function initPlayers() {
  var frames = Array.prototype.slice.call(document.querySelectorAll('.player-frame'));

  frames.forEach(function (frame) {
    var video = frame.querySelector('.js-hls-video');
    var button = frame.querySelector('.js-play-button');

    if (!video || !button) {
      return;
    }

    button.addEventListener('click', function () {
      var source = video.getAttribute('data-hls-src');

      button.disabled = true;
      setMessage(frame, '正在加载高清播放源...');

      var readyPromise = video.dataset.ready === 'true'
        ? Promise.resolve()
        : attachHls(video, source, frame).then(function () {
            video.dataset.ready = 'true';
          });

      readyPromise
        .then(function () {
          button.classList.add('is-hidden');
          setMessage(frame, '');
          return video.play();
        })
        .catch(function (error) {
          button.disabled = false;
          button.classList.remove('is-hidden');
          setMessage(frame, error.message || '播放失败，请稍后重试。');
        });
    });

    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlayers);
} else {
  initPlayers();
}
