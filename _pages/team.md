---
title: "Khwarizmi Lab - Team"
layout: gridlay
excerpt: "Khwarizmi Lab: Team members"
seo_description: "Meet the faculty, students, and researchers of the Khwarizmi Lab at UMass Amherst and learn about their research interests."
sitemap: true
permalink: /team/
---

# Group Members

 **We are  looking for new PhD students, Postdocs, and Master students to join the team** [(see openings)]({{ site.url }}{{ site.baseurl }}/vacancies) **!**


See team in action: [Lab Pictures]({{ site.url }}{{ site.baseurl }}/pictures)!

<!-- ## Staff -->
{% assign number_printed = 0 %}
{% for member in site.data.team_members %}

{% assign even_odd = number_printed | modulo: 2 %}

{% if even_odd == 0 %}
<div class="row">
{% endif %}

<div class="col-sm-6 clearfix">
  <img src="{{ site.url }}{{ site.baseurl }}/images/teampic/{{ member.photo }}" class="img-responsive" width="140px" style="float: left" />
  <h4>{{ member.name }}</h4>
  <i>{{ member.info }} {% if member.link %}<b>[<a href="{{member.link}}" target="_blank">Homepage</a>]</b>{% endif %}
  <br>email: {{ member.email }}</i>

  {% if member.number_rec > 0 %}
  <b>Research Areas:</b>
  {% endif %}

  <ul style="overflow: hidden">

  {% if member.number_rec == 1 %}
  <li> {{ member.interest1 }} </li>
  {% endif %}

  {% if member.number_rec == 2 %}
  <li> {{ member.interest1 }} </li>
  <li> {{ member.interest2 }} </li>
  {% endif %}

  {% if member.number_rec == 3 %}
  <li> {{ member.interest1 }} </li>
  <li> {{ member.interest2 }} </li>
  <li> {{ member.interest3 }} </li>
  {% endif %}

  {% if member.number_rec == 4 %}
  <li> {{ member.interest1 }} </li>
  <li> {{ member.interest2 }} </li>
  <li> {{ member.interest3 }} </li>
  <li> {{ member.interest4 }} </li>
  {% endif %}

  {% if member.number_rec == 5 %}
  <li> {{ member.interest1 }} </li>
  <li> {{ member.interest2 }} </li>
  <li> {{ member.interest3 }} </li>
  <li> {{ member.interest4 }} </li>
  <li> {{ member.interest5 }} </li>
  {% endif %}
  </ul>

  <ul style="overflow: hidden">
  {% if member.number_educ > 0 %}
  <b>Education</b>
  {% endif %}

  {% if member.number_educ == 1 %}
  <li> {{ member.education1 }} </li>
  {% endif %}

  {% if member.number_educ == 2 %}
  <li> {{ member.education1 }} </li>
  <li> {{ member.education2 }} </li>
  {% endif %}

  {% if member.number_educ == 3 %}
  <li> {{ member.education1 }} </li>
  <li> {{ member.education2 }} </li>
  <li> {{ member.education3 }} </li>
  {% endif %}

  {% if member.number_educ == 4 %}
  <li> {{ member.education1 }} </li>
  <li> {{ member.education2 }} </li>
  <li> {{ member.education3 }} </li>
  <li> {{ member.education4 }} </li>
  {% endif %}

  {% if member.number_educ == 5 %}
  <li> {{ member.education1 }} </li>
  <li> {{ member.education2 }} </li>
  <li> {{ member.education3 }} </li>
  <li> {{ member.education4 }} </li>
  <li> {{ member.education5 }} </li>
  {% endif %}

  </ul>
</div>

{% assign number_printed = number_printed | plus: 1 %}

{% if even_odd == 1 %}
</div>
{% endif %}

{% endfor %}

{% assign even_odd = number_printed | modulo: 2 %}
{% if even_odd == 1 %}
</div>
{% endif %}


## Other Student Members
<div class="row">

<div class="col-sm-4 clearfix">
<h4>Master's Students</h4>
{% for member in site.data.msc %}
{{ member.name }}
{% endfor %}
</div>

<div class="col-sm-4 clearfix">
<h4>Bachelor's Students</h4>
{% for member in site.data.bsc %}
{{ member.name }}
{% endfor %}
</div>

</div>

## Former BSc/ MSc students
<div class="row">

<div class="col-sm-4 clearfix">
<h4>Master students</h4>
{% for member in site.data.alumni_msc %}
{{ member.name }}
{% endfor %}
</div>

<!-- <div class="col-sm-4 clearfix">
<h4>Bachelor Students</h4>
{% for member in site.data.alumni_bsc %}
{{ member.name }}
{% endfor %}
</div> -->

</div>

<!-- ## Administrative Support
<a href="mailto:rajahasnainanwar@arizona.edu">Raja Hasnain Anwar</a> is helping us (and other groups) with administration. -->
