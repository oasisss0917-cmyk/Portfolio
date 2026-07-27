/* 封面图点击播放/暂停音频，原生 <audio>（不带 controls）+ 播放/暂停图标切换，
   对应需求里 React useState/useRef 的逻辑：isPlaying 状态就是"图标当前显示哪个
   svg"，用 audio.paused 直接判断，不用额外变量维护 */
document.addEventListener("DOMContentLoaded", function () {
  var wrap = document.getElementById("podcastCoverWrap");
  var audio = document.getElementById("podcastAudio");
  if (!wrap || !audio) return;

  var iconPlay = wrap.querySelector(".icon-play");
  var iconPause = wrap.querySelector(".icon-pause");
  var progress = document.getElementById("podcastProgress");
  var progressFill = document.getElementById("podcastProgressFill");

  function setPlaying(isPlaying) {
    iconPlay.style.display = isPlaying ? "none" : "block";
    iconPause.style.display = isPlaying ? "block" : "none";
  }

  function toggle() {
    if (audio.paused) {
      audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  wrap.addEventListener("click", toggle);
  wrap.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  });

  audio.addEventListener("ended", function () {
    setPlaying(false);
    progressFill.style.width = "0%";
  });

  // 播放进度：随 timeupdate 更新进度条填充宽度
  audio.addEventListener("timeupdate", function () {
    if (!audio.duration) return;
    progressFill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
  });

  // 点击进度条跳转到对应位置，阻止冒泡避免同时触发封面的播放/暂停切换
  if (progress) {
    progress.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!audio.duration) return;
      var rect = progress.getBoundingClientRect();
      var ratio = (e.clientX - rect.left) / rect.width;
      audio.currentTime = ratio * audio.duration;
    });
  }
});
