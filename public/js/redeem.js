// Redeem page: one state at a time, driven by POST /api/check.
//
// States (same as the design and the app's RedeemOutcome):
//   input · checking · applied · notfound · used · expired · error
//
// The page only CHECKS a code — it can't see the user's account, so it never
// uses one up. "Open in Last Call" hands the code to the app, which redeems it.
(function () {
  var MIN = 6;
  var c = window.LC_CONFIG || {};
  var root = document.getElementById('redeem');
  var form = document.getElementById('form');
  var input = document.getElementById('lc-code');
  var field = document.getElementById('field');
  var submit = document.getElementById('submit');
  var state = 'input';

  function clean(v) {
    return v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24);
  }

  function formatDate(ms, withYear) {
    var opts = withYear
      ? { day: 'numeric', month: 'short', year: 'numeric' }
      : { day: 'numeric', month: 'short' };
    return new Date(ms).toLocaleDateString('en-GB', opts);
  }

  function fill(sel, text) {
    root.querySelectorAll(sel).forEach(function (el) { el.textContent = text; });
  }

  function render() {
    root.querySelectorAll('[data-when]').forEach(function (el) {
      el.hidden = el.getAttribute('data-when').split(' ').indexOf(state) === -1;
    });
    var code = input.value;
    field.style.borderColor = state === 'notfound' ? '#E8705A' : '#2B2545';
    submit.disabled = state === 'checking' || code.length < MIN;
    submit.textContent =
      state === 'checking' ? 'Checking…' :
      state === 'notfound' || state === 'error' ? 'Try again' : 'Redeem';
    input.readOnly = state === 'checking';
    fill('[data-code]', code);
    var link = (c.appScheme || 'lastcall://redeem') + '?code=' + encodeURIComponent(code);
    root.querySelectorAll('[data-app-link]').forEach(function (a) { a.href = link; });
  }

  function show(next, detail) {
    state = next;
    detail = detail || {};
    if (detail.days) fill('[data-days]', String(detail.days));
    if (detail.usedAt) fill('[data-used-at]', formatDate(detail.usedAt, true));
    if (detail.closedAt) fill('[data-closed-at]', formatDate(detail.closedAt, false));
    render();
  }

  // The server's answer → a page state. Anything unexpected is `error`, never
  // a claim that the code is bad.
  var BY_STATUS = { valid: 'applied', notFound: 'notfound', alreadyUsed: 'used', expired: 'expired' };

  function check() {
    var code = input.value;
    if (code.length < MIN || state === 'checking') return;
    show('checking');
    fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) { show(BY_STATUS[data.status] || 'error', data); })
      .catch(function () { show('error'); });
  }

  input.addEventListener('input', function () {
    var v = clean(input.value);
    if (v !== input.value) input.value = v;
    // Editing after a failed check returns to plain input.
    if (state === 'notfound' || state === 'error') state = 'input';
    render();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    check();
  });

  root.querySelectorAll('[data-reset]').forEach(function (b) {
    b.addEventListener('click', function () {
      input.value = '';
      show('input');
      input.focus();
    });
  });

  // A shared link like /redeem?code=SLEEP90 pre-fills the field.
  var pre = new URLSearchParams(location.search).get('code');
  if (pre) input.value = clean(pre);
  render();
})();
