// Point every store and support link at the values in config.js.
(function () {
  var c = window.LC_CONFIG || {};
  document.querySelectorAll('[data-store-link]').forEach(function (a) {
    if (c.storeUrl) a.href = c.storeUrl;
  });
  document.querySelectorAll('[data-support-link]').forEach(function (a) {
    if (c.supportEmail) a.href = 'mailto:' + c.supportEmail;
  });
})();
