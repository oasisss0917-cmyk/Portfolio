/* 复古电视堆叠：整张合成图 + 3 个透明热区（data-video / data-link），
   悬停时先短暂"调台"闪烁（.is-tuning），再淡入视频预览（.is-active）；
   移出立刻切回雪花噪点。点击对应打开视频弹窗或新标签页外部链接 */
document.addEventListener("DOMContentLoaded", function () {
  var TUNING_MS = 350;

  document.querySelectorAll(".tv-hotspot").forEach(function (tv) {
    var video = tv.querySelector(".tv-preview");
    var tuningTimer = null;

    function startPreview() {
      tv.classList.add("is-tuning");
      // Commercial 那台预览用的是静态封面图（<img>），不是 <video>，
      // 没有 play/currentTime 这些方法，这里做个鸭子类型判断避免报错
      if (video && typeof video.play === "function") {
        video.currentTime = 0;
        video.play();
      }
      tuningTimer = window.setTimeout(function () {
        tv.classList.remove("is-tuning");
        tv.classList.add("is-active");
      }, TUNING_MS);
    }

    function stopPreview() {
      window.clearTimeout(tuningTimer);
      tv.classList.remove("is-tuning", "is-active");
      if (video && typeof video.pause === "function") video.pause();
    }

    tv.addEventListener("mouseenter", startPreview);
    tv.addEventListener("mouseleave", stopPreview);
    tv.addEventListener("focus", startPreview);
    tv.addEventListener("blur", stopPreview);

    tv.addEventListener("click", function () {
      if (tv.dataset.video) {
        openVideoModal(tv.dataset.video);
      } else if (tv.dataset.link) {
        window.open(tv.dataset.link, "_blank");
      }
    });

    tv.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        tv.click();
      }
    });
  });

  // ---------- 视频弹窗：和 Podcast 页 CardSwap 版本一样的实现 ----------
  var videoModalOverlay = document.getElementById("videoModalOverlay");
  var videoModalPlayer = document.getElementById("videoModalPlayer");
  var videoModalClose = document.getElementById("videoModalClose");

  function openVideoModal(src) {
    if (!videoModalOverlay || !videoModalPlayer) return;
    videoModalPlayer.src = src;
    videoModalOverlay.classList.add("is-open");
    videoModalPlayer.play();
  }

  function closeVideoModal() {
    if (!videoModalOverlay || !videoModalPlayer) return;
    videoModalPlayer.pause();
    videoModalPlayer.removeAttribute("src");
    videoModalPlayer.load();
    videoModalOverlay.classList.remove("is-open");
  }

  if (videoModalOverlay) {
    videoModalClose.addEventListener("click", closeVideoModal);
    videoModalOverlay.addEventListener("click", function (e) {
      if (e.target === videoModalOverlay) closeVideoModal();
    });
  }
});
