(function () {
    function showMessage(node, text) {
        if (!node) {
            return;
        }

        node.textContent = text;
        node.classList.add('is-visible');
    }

    function attachStream(video, url, messageNode) {
        if (video.dataset.streamReady === '1') {
            return;
        }

        video.dataset.streamReady = '1';

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    showMessage(messageNode, '视频加载失败，请稍后重试');
                }
            });
            video._hlsInstance = hls;
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            return;
        }

        video.src = url;
    }

    function startPlayer(player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var messageNode = player.querySelector('[data-player-message]');
        var url = player.getAttribute('data-stream-url');

        if (!video || !url) {
            return;
        }

        attachStream(video, url, messageNode);
        video.setAttribute('controls', 'controls');

        if (button) {
            button.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }

                showMessage(messageNode, '点击播放器后即可开始播放');
            });
        }
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        var button = player.querySelector('[data-play-button]');
        var video = player.querySelector('video');

        if (button) {
            button.addEventListener('click', function () {
                startPlayer(player);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!video.dataset.streamReady) {
                    startPlayer(player);
                }
            });
        }
    });
}());
