---
title: Parallel versus serial visual search
---

Can you spot an odd item?
Is it the only <span style="color:red">red</span> one amoung <span style="color:green">green</span>?
Or is it the only <strong>2</strong> amoung many <strong>5s</strong>?
Click <button class="btn btn-secondary">Start</button> to begin the experiment and click on an odd item as fast as you can!
Check out your stats, once the experiment is over.

{% include stimuli/visual_search.html %}

####  Why is spotting an odd color so much easier than locating an odd number?
The key difference is whether the object you are searching for is distinguished by a basic feature or their combination.
Basic features (such as color, orientation, linear motion, etc.) are split into different groups automatically.
When item is defined by color, it means that you only need to look at _two_ groups (<span style="color:red">reds </span> vs. <span style="color:green">greens</span>) and decide which group has only one item in it.
Because of that, odd color search is very fast and is called "parallel": It does not matter how many items there are on the screen, you always need to examine just _two groups_.
However, _combinations_ of features (relative position of lines within the letters) require attention to be computed, meaning that you need to attend to each letter to see what it is.
Which is why search for a letter is slow and is called a "serial" search.
