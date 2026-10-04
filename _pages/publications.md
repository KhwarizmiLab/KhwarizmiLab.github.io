---
title: "Khwarizmi Lab - Publications"
layout: gridlay
excerpt: "Khwarizmi Lab -- Publications."
seo_description: "Browse research publications and patents from the Khwarizmi Lab at UMass Amherst, spanning systems security, payments, quantum networks, and mobile systems."
sitemap: true
permalink: /publications/
---


# Publications

## Highlights

**At the end of this page, you can find the [full list of publications and patents](#full-list-of-publications).**

{% assign highlighted_publications = site.data.publist | where: "highlight", 1 %}
<div class="publication-columns">
{% for column in (0..1) %}
<div class="publication-column">
{% for publi in highlighted_publications %}
{% assign item_column = forloop.index0 | modulo: 2 %}
{% if item_column == column %}
{% include publication_highlight.html publi=publi %}
{% endif %}
{% endfor %}
</div>
{% endfor %}
</div>

<div class="publication-list-mobile">
{% for publi in highlighted_publications %}
{% include publication_highlight.html publi=publi %}
{% endfor %}
</div>

<p> &nbsp; </p>


<!-- ## Patents  -->

## Full List of publications

{% for publi in site.data.publist %}

  <b>{{ publi.year }}:</b> {{ publi.title }}
  <!-- Check if file links exist -->
  {% if publi.link.pdf %}<b>[<a href="{{ site.url }}{{ site.baseurl }}/docs/{{ publi.link.pdf }}" target="_blank">PDF</a>]</b>{% endif %}
  {% if publi.link.slides %}<b>[<a href="{{ site.url }}{{ site.baseurl }}/docs/{{ publi.link.slides }}" target="_blank">Slides</a>]</b>{% endif %}
  {% if publi.award %}<span class="text-success">{{ publi.award }}</span>{% endif %}

  <em>{{ publi.authors }} </em><br /><a href="{{ publi.link.url }}">{{ publi.link.display }}</a>

{% endfor %}
