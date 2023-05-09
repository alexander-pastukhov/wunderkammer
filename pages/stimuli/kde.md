---
title: Kinetic depth effect, a. k. a. Structure from Motion
---

Do you see a rotating object? Which way does it rotate? 
Keep looking at it and you will eventually notice that is started to rotate in the opposite direction.
And, no, we did not change anything, your brain did! (If you cannot see the drum switch, try a sphere!)

{% include stimuli/kde.html %}

#### Why do I see a 3D rotating object, if my screen is 2D?
Because the dots on your very 2D screen move in a complex way, gradualy speeding up or slowing down (and, sometimes changing their direction of motion). 
Their trajectories are identical to those of dots that are located on a surface of a single 3D object, which rotates at a **constant** speed.
Accordingly, they can be either dots on a surface of a steadily rotating object or many independent dots that move along different complex trajectories and **accidentaly** match a rotating object. 
Your visiual system is very sceptical about such coincedences. Imagine you see 200 people marching through the town all together. 
Would you think that they all walked together by indicent or that they belong to a group and their marching is coordinated?
You will probably think this was no accident and so does you visual system, by picking a rotating object explanation as a more probable one.</p>

#### Why does rotation suddenly change its direction?
This is because although dots' motion tells you that object is rotating, it does not tell you which dots are at the back and which are in front.
Representations of two alternative rotations compete in your visual system, but because they are well-matched, neither of them can keep dominating for a long time. 
When the one you saw finally loses, you "switch" to a different direction of rotation.
You can help one of them by either concentrating on it (helps a little bit) or by changing the relative size of dots (helps a lot by making some dots look "closer" to you than the others).

The switching phenomenon you experience is called **multi-stable perception**. For more example like this, take a look [Necker cube](nc) and [Shape-from-shading](SFS) displays.

<!-- References -->
{% assign entry = site.data.stimuli | where: 'page', 'kde' %}
{% include_relative references.md %}
