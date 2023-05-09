{% if entry[0].references.size > 0 %}
---
#### References
{% for reference in entry[0].references %}
* {{reference.title}} doi: [{{reference.doi}}](https://doi.org/{{reference.doi}})
{% endfor %}
{% endif %}