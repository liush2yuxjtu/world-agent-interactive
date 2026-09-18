/**
 * Lightest PostHog Error Tracking bootstrap for this static/demo site.
 * No npm runtime dependency — loads official array.js once per page.
 * Exception autocapture is controlled in PostHog project settings;
 * captureException is available on window.posthog after init.
 */
const POSTHOG_TOKEN = 'phc_kheWg6X33fvfDfoaJs97icPPJJSD2trvvHuiGVAu6y3B';
const POSTHOG_HOST = 'https://us.i.posthog.com';

export function initPostHog() {
  if (typeof window === 'undefined') return null;
  if (window.__waPosthogReady && window.posthog) return window.posthog;

  !(function (t, e) {
    var o, n, p, r;
    if (e.__SV || (window.posthog && window.posthog.__loaded)) return;
    window.posthog = e;
    e._i = [];
    e.init = function (i, s, a) {
      function g(t, e) {
        var o = e.split('.');
        2 == o.length && ((t = t[o[0]]), (e = o[1]));
        t[e] = function () {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      }
      (p = t.createElement('script')).type = 'text/javascript';
      p.crossOrigin = 'anonymous';
      p.async = !0;
      p.src = s.api_host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js';
      (r = t.getElementsByTagName('script')[0]).parentNode.insertBefore(p, r);
      var u = e;
      void 0 !== a ? (u = e[a] = []) : (a = 'posthog');
      u.people = u.people || [];
      u.toString = function (t) {
        var e = 'posthog';
        return 'posthog' !== a && (e += '.' + a), t || (e += ' (stub)'), e;
      };
      u.people.toString = function () {
        return u.toString(1) + '.people (stub)';
      };
      o =
        'init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug'.split(
          ' ',
        );
      for (n = 0; n < o.length; n++) g(u, o[n]);
      e._i.push([i, s, a]);
    };
    e.__SV = 1;
  })(document, window.posthog || []);

  window.posthog.init(POSTHOG_TOKEN, {
    api_host: POSTHOG_HOST,
    defaults: '2026-05-30',
  });
  window.__waPosthogReady = true;
  return window.posthog;
}

initPostHog();
