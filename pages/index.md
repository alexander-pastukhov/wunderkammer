---
title:
layout: page
---

## Something to see

{% assign sorted_entries =  site.data.stimuli | sort: 'title' | where: 'type', 'stimulus'  %}
{% include catalog.html %}

## Something to do

{% assign sorted_entries =  site.data.stimuli | sort: 'title' | where: 'type', 'experiment'  %}
{% include catalog.html %}
