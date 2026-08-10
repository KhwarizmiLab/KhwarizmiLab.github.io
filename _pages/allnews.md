---
title: "Khwarizmi Lab - News"
layout: textlay
excerpt: "News @ Khwarizmi Lab"
seo_description: "Read the latest Khwarizmi Lab news, including research publications, awards, talks, media coverage, and new team members."
sitemap: true
permalink: /allnews.html
---

# News

{% for article in site.data.news %}
<p><b>{{ article.date }}</b> <br>
<em>{{ article.headline }}</em></p>
{% endfor %}
