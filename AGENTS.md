# Media coverage

When adding an outlet article to `_data/media_coverage.yml`, check
`_data/media_logos.yml` and `images/media-logos/` first and reuse the existing
logo for that publisher, including publisher-name variants.

If no suitable logo exists, obtain an official PNG from the publisher's website
or brand assets, add it to `images/media-logos/`, and register it in
`_data/media_logos.yml`. Report an unavailable official logo rather than
inventing one. The media list and curated homepage wall share this lookup;
do not duplicate logos per article or hotlink them.

`_data/featured_media.yml` is the single curated wall list shared by the home
and media pages; adding an article does not automatically add it to the wall.
On the media page only, `js/featured-media-wall.js` sizes wall logos
automatically from their aspect ratios. An item's optional `logo_scale`
defaults to 1; adjust it only when needed to balance perceived size or
whitespace, while preserving the logo's aspect ratio. Check the wall on phone
and desktop and ensure the home layout remains unchanged.
