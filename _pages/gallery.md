---
title: "Khwarizmi Lab - Gallery"
layout: piclay
excerpt: "Khwarizmi Lab -- Gallery"
seo_description: "Browse photos from Khwarizmi Lab research, events, and group activities at UMass Amherst."
sitemap: true
permalink: /gallery/
---

# Gallery


#### Group Activities
(Right-click *'view image'* to see a larger image.)

<div class="gallery-columns">
{% for column in (0..2) %}
<div class="gallery-column">
{% for pic in site.data.gallery %}
{% assign item_column = forloop.index0 | modulo: 3 %}
{% if item_column == column %}
<div class="gallery-item">
<p style="margin-left:10px !important;">
<strong>{{ pic.title }}</strong><br/>
<em>{{ pic.date }}</em><br/>
📍 {{ pic.loc }}<br/>
{{ pic.alt }}
</p>
<img src="{{ site.url }}{{ site.baseurl }}/images/gallery/{{ pic.image }}" alt="{{ pic.alt }}" class="img-responsive gallery-image" width="100%" style="float: left" />
</div>
{% endif %}
{% endfor %}
</div>
{% endfor %}
</div>

<div class="gallery-list-mobile">
{% for pic in site.data.gallery %}
<div class="gallery-item">
<p style="margin-left:10px !important;">
<strong>{{ pic.title }}</strong><br/>
<em>{{ pic.date }}</em><br/>
📍 {{ pic.loc }}<br/>
{{ pic.alt }}
</p>
<img src="{{ site.url }}{{ site.baseurl }}/images/gallery/{{ pic.image }}" alt="{{ pic.alt }}" class="img-responsive gallery-image" width="100%" style="float: left" />
</div>
{% endfor %}
</div>

<p> &nbsp; </p>
