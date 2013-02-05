// Google Analytics
// ----------------
// [Documentation](https://developers.google.com/analytics/devguides/collection/gajs/).

analytics.addProvider('Google Analytics', {

    settings : {
        anonymizeIp             : false,
        enhancedLinkAttribution : false,
        siteSpeedSampleRate     : null,
        domain                  : null,
        trackingId              : null
    },


    // Initialize
    // ----------

    // Changes to the Google Analytics snippet:
    //
    // * Added `trackingId`.
    // * Added optional support for `enhancedLinkAttribution`
    // * Added optional support for `siteSpeedSampleRate`
    // * Added optional support for `anonymizeIp`
    initialize : function (settings) {
        settings = analytics.utils.resolveSettings(settings, 'trackingId');
        analytics.utils.extend(this.settings, settings);

        var _gaq = window._gaq = window._gaq || [];

        this.setAccounts();

        if(this.settings.domain) {
            this.push(['_setDomainName', this.settings.domain]);
        }
        if (this.settings.enhancedLinkAttribution) {
            var pluginUrl = (('https:' === document.location.protocol) ? 'https://www.' : 'http://www.') + 'google-analytics.com/plugins/ga/inpage_linkid.js';
            this.push(['_require', 'inpage_linkid', pluginUrl]);
        }
        if (analytics.utils.isNumber(this.settings.siteSpeedSampleRate)) {
            this.push(['_setSiteSpeedSampleRate', this.settings.siteSpeedSampleRate]);
        }
        if(this.settings.anonymizeIp) {
            this.push(['_gat._anonymizeIp']);
        }

        // Check to see if there is a canonical meta tag to use as the URL.
        var canonicalUrl, metaTags = document.getElementsByTagName('meta');
        for (var i = 0, tag; tag = metaTags[i]; i++) {
            if (tag.getAttribute('rel') === 'canonical') {
                canonicalUrl = analytics.utils.parseUrl(tag.getAttribute('href')).pathname;
            }
        }
        this.push(['_trackPageview', canonicalUrl]);

        (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        })();
    },

    // Set Account IDs
    // ---------------

    setAccounts: function () {
        var trackingIds = this.settings.trackingId;
        if (typeof trackingIds === 'object') {
            Object.keys(trackingIds).forEach(function (id) {
                _gaq.push([id + '._setAccount', trackingIds[id]]);
            });
        } else {
            _gaq.push(['_setAccount', trackingIds]);
        }
    },

    // Push to all trackers
    // --------------------

    push: function (method, trackingId) {
        if (typeof this.settings.trackingId === 'object') {
            if (trackingId) {
                method[0] = trackingId + '.' + method[0];
                window._gaq.push(method);
            } else {
                Object.keys(this.settings.trackingId).forEach(function (id) {
                    var clonedMethod = analytics.utils.clone(method);
                    clonedMethod[0] = id + '.' + clonedMethod[0]
                    window._gaq.push(clonedMethod);
                });
            }
        } else {
            window._gaq.push(method);
        }
    },

    // Track
    // -----

    track : function (event, properties) {
        properties || (properties = {});

        var value,
            transaction = analytics.transaction;

        // Since value is a common property name, ensure it is a number
        if (analytics.utils.isNumber(properties.value)) value = properties.value;

        if (event === 'Transaction') {
            this.push(['_addTrans',
                transaction.id,
                transaction.store,
                transaction.summary.total,
                transaction.summary.tax,
                transaction.summary.shipping,
                transaction.location.city,
                transaction.location.state,
                transaction.location.country
            ], properties.trackingId);

            for (var i = 0; i < transaction.products.length; i++) {
                var product = transaction.products[i];
                this.push(['_addItem',
                    transaction.id,
                    product.sku,
                    product.name,
                    product.category,
                    product.price,
                    product.quantity
                ], properties.trackingId);
            }

            this.push(['_trackTrans'], properties.trackingId);
            delete sessionStorage.transaction;
        }

        // Try to check for a `category` and `label`. A `category` is required,
        // so if it's not there we use `'All'` as a default. We can safely push
        // undefined if the special properties don't exist. Try using revenue
        // first, but fall back to a generic `value` as well.
        this.push([
            '_trackEvent',
            properties.category || 'All',
            event,
            properties.label,
            Math.round(properties.revenue) || value,
            properties.noninteraction
        ], properties.trackingId);
    },


    // Pageview
    // --------

    pageview : function (url) {
        // If there isn't a url, that's fine.
        this.push(['_trackPageview', url]);
    }

});


