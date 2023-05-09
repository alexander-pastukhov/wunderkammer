---
title: Biological motion
---

{{title}}


{{title}}
Can you tell what this person is doing? Easy, right? But do you realize that you can do this by watching only <strong>thirteen</strong> dots?


{% include stimuli/biomotion.html %}

#### What is going on?
What you see on the screen are recordings from a real person with special trackers located at the joints. 
When your visual system detects clues that a human is present in the picture, it uses a stored "moving human" gestalt to make sense of complex motion trajectories.
However, if presense of a human is not obvious and there is no other gestalt to apply, all you see are oddly moving dots. 
Too see this, click on "vertical orientation" toggle to flip motion upside-down.


Biological motion is an example of [structure-from-motion](KDE).

<!-- References -->
{% assign entry = site.data.stimuli | where: 'title', "Biological motion" %}
{% include_relative references.md %}
