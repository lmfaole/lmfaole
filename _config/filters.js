import { DateTime } from "luxon";

export default function (eleventyConfig) {
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, {
			zone: zone || "utc",
		}).toFormat(format || "dd. MMMM yyyy");
	});

	eleventyConfig.addFilter("readableDateHour", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, {
			zone: zone || "utc",
		}).toFormat(format || "dd. MMMM yyyy HH:MM");
	});

	eleventyConfig.addFilter("htmlDateString", (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
	});

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if (!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if (n < 0) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	// Return the keys used in an object
	eleventyConfig.addFilter("getKeys", (target) => {
		return Object.keys(target);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter((tag) => ["all", "posts"].indexOf(tag) === -1);
	});

	eleventyConfig.addFilter("sortAlphabetically", (strings) =>
		(strings || []).sort((b, a) => b.localeCompare(a)),
	);

    // WEBMENTIONS FILTER
    eleventyConfig.addFilter('webmentionsForUrl', (webmentions, url) => {
        // define which types of webmentions should be included per URL.
        // possible values listed here:
        // https://github.com/aaronpk/webmention.io#find-links-of-a-specific-type-to-a-specific-page
        const allowedTypes = ['mention-of', 'in-reply-to']

        // define which HTML tags you want to allow in the webmention body content
        // https://github.com/apostrophecms/sanitize-html#what-are-the-default-options
        const allowedHTML = {
            allowedTags: ['b', 'i', 'em', 'strong', 'a'],
            allowedAttributes: {
                a: ['href']
            }
        }

        // clean webmention content for output
        const clean = (entry) => {
            const { html, text } = entry.content

            if (html) {
                // really long html mentions, usually newsletters or compilations
                entry.content.value =
                    html.length > 2000
                        ? `mentioned this in <a href="${entry['wm-source']}">${entry['wm-source']}</a>`
                        : sanitizeHTML(html, allowedHTML)
            } else {
                entry.content.value = sanitizeHTML(text, allowedHTML)
            }

            return entry
        }

        // sort webmentions by published timestamp chronologically.
        // swap a.published and b.published to reverse order.
        const orderByDate = (a, b) => new Date(b.published) - new Date(a.published)

        // only allow webmentions that have an author name and a timestamp
        const checkRequiredFields = (entry) => {
            const { author, published } = entry
            return !!author && !!author.name && !!published
        }

        // run all of the above for each webmention that targets the current URL
        return webmentions
            .filter((entry) => entry['wm-target'] === url)
            .filter((entry) => allowedTypes.includes(entry['wm-property']))
            .filter(checkRequiredFields)
            .sort(orderByDate)
            .map(clean)
    })
}
