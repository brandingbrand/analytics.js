// BB Tracker
// -----------

analytics.addProvider('BBTracker', {

    // Initialize
    // ----------

    initialize : function (settings) {
        var bbTracker = window.bbTracker = window.bbTracker || [];

        (function() {
            var t   = document.createElement('script');
            t.type  = 'text/javascript';
            t.async = true;
            var protocol = ('https:' == document.location.protocol) ? 'https:' : 'http:';
            t.src = protocol + '//tracking.bbinf.net/bbTracker.js';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(t, s);
        })();
    },

    // Track Event
    // -----------

    track : function (event, properties) {
        properties || (properties = {});

        var value, name, category;

        // Since value is a common property name, ensure it is a number
        if (analytics.utils.isNumber(properties.value)) value = properties.value;

        bbTracker.trackEvent(event, properties.category || 'All');
    }

});


