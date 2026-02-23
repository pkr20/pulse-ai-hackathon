# MindGrove 

## Inspiration 

Walking into the hackathon, we were struck by a statistic from the opening presentation: individuals with intellectual disabilities experience depression and anxiety at 3-5 times the rate of the general population, yet roughly 40% receive no treatment at all. Even those who do receive adapted CBT face a critical "between-session gap.” Skills learned in the therapy room rarely make it into everyday life, because working memory limitations make independent recall and practice genuinely hard. That gap, however, felt solvable. Not by replacing therapists, but by giving them a bridge. We wanted to build something that a client could open on a Tuesday afternoon, far from their therapist's office, and feel like their session from Monday was still with them. The idea of a growing garden came naturally: progress that is visible, tangible, and joyful, rather than abstract numbers on a chart. A forest you grew yourself is worth coming back to.

## What it does

	This app provides an engaging interface tailored towards individuals with ID to help them practice CBT exercises learned in therapy throughout the week. The purpose is to ensure that these individuals are reminded of what they learned throughout the week, and are given a fun outlet to practice these exercises. The app is kept engaging through a game aspect which is a forest full of various trees that the user is trying to grow, and to grow them they must complete the modules that contain exercises learned in therapy. 

This app is composed of 6 distinct modules that the user is able to complete, and upon completion of each module they are able to plant a specific type of tree. When the user clicks “Begin Practice”, they are met with a few examples of when to use the exercise in their daily life. The purpose of these examples are to help the user with generalization, which is something they might struggle with. These examples remind the user of how to apply the exercise in their daily life. Next, the application will ask the user various questions and have them rate how they are feeling 1-10, or have them select from a list of answers. The purpose of this feature is to keep it very simple for the user, all they have to do is read the question and click an answer that describes how they’re feeling. Finally, they are asked to select from a list when they might use this exercise in their own life, allowing them to connect what they just did with a real world example.

They are able to see a 2D screen of their forest, as well as enter a 3D mode, where they can actually walk around the forest that they have planted. Inside this 3D mode, they are able to collect fertilizer, which when they walk into it will ask them one of the practice questions, and upon completion they will be rewarded and able to grow a tree of their choosing. This aspect keeps the application fun for the user, and gives them something to work towards, while keeping them engaged with their therapy. They are also able to see some basic stats, such as how many trees they’ve grown, their daily streak, and what level they are on. 


## How we built it

This app was built as a combined effort between the four team members. To begin, we had a 30 minute planning session where we brainstormed all of the potential ideas and began picking out the very best ones. We developed plans for what the main idea of the app was going to be, how we were going to include a game aspect of it to keep it engaging, and what parts of the requirements we really wanted to focus on. 

Then, we moved into the development phase. We each began developing our own apps with our own ideas. The purpose behind this approach was to have a variety of prototypes that we could pull the best ideas from and combine them all into one final project. We spent about an hour developing our own ideas, sharing with each other what we got, pulling from others, and building out different aspects. After this, we agreed on the best prototype that we wanted to be the base for our app. 

Once we had the base prototype that we all would start to build from, we pushed it to the github and downloaded it onto our local devices. From there, we could see the app, and began to build out our own features. Two members experimented with a speech-to-text feature that would allow for live recordings of the meeting that would then be converted into a PDF and fed into the app to provide suggestions. Another member worked on the modules, making them user friendly and ensuring that they encouraged repetition and allowed the user to learn to generalize the concepts to real life. One member developed the dashboard that showed the client how often they had used the application in the past months. These and many more features were developed based on that first prototype, and each change was pushed to the github and merged until eventually we had our final application. 

Throughout this process, there was constant communication between the team. We continually showed each other what we were working on, took feedback back, and went back to improve the feature we were developing. 


## Challenges we ran into 
Our first challenge was figuring out how we would merge the ideas from all four of our individual drafts of the application into an optimized product. Two of our team members had difficulty installing npm onto their devices, which was crucial to collaborating on the final draft we decided to work on. Eventually we got Gemini to fix our errors and managed to launch the local host on our devices, but our ideas went all over the place since we couldn’t pull origin from the GitHub Desktop app, so there really wasn’t a uniform structure for our project. 

Building the 3D garden was extremely difficult and took the most time to program out of all the application’s features. We couldn’t figure out exactly what the user’s incentive would be to build a virtual garden until we integrated the gameplay with the modules themselves, meaning that a user would first have to successfully complete a module in order to plant a tree.

	The user interface of our app was constantly changing. We first started with a vertical mobile game design, but branched out to a desktop interface to make room for more features on the dashboard, including the 3D garden and directory of modules. We had to remove excessive amounts of text and designs that we felt would be overbearing for the user. 

Another challenge we faced was deploying our application to the internet because we did not have enough time to find our own domain that could integrate with the APIs that were used in our local host server.

## Accomplishments that we're proud of 
We built a working, deployable prototype in a single hackathon session despite significant early setbacks. The transcript analyzer produces genuinely useful clinical output. Ranked modules with plain-language rationale and therapist-facing insights, all formatted at a 6th-grade reading level. We achieved real accessibility: the interface uses large touch targets, avoids jargon, and was designed with the heterogeneity of the ID population in mind (varying communication styles, varying support needs). The garden metaphor landed as we hoped and makes progress feel alive and worth protecting, which is exactly the kind of intrinsic motivation this population benefits from. Perhaps most personally, we are proud that a team with mixed technical experience shipped something we genuinely believe could help real people, rather than retreating into a demo that looked good but did nothing.


## What we learned 

One of the biggest takeaways from this project was that constraints can push the work in
the right direction. Every time we ran into a limitation, such as the technologies we chose, the
time we had, the requirement to keep things cognitively accessible, we were forced to strip
the app down to what truly mattered. The product is cleaner and more approachable precisely
because we didn't have the luxury of overcomplicating it. 

We also dove deep into how CBT is adapted for people with intellectual disabilities. We
learned why concrete examples land better than abstract ones, why repetition isn't optional,
and how the encoding-abstraction-retrieval-transfer cycle shapes what people can actually
carry from one session to the next. Understanding this framework made our AI prompts sharper
and our UX decisions more intentional, giving us clinical grounding for choices that might
otherwise have just been aesthetic preferences. 

Furthermore, we learned what it means to design for dignity. Accessibility is not just font sizes and color contrast. It is about respecting your user's autonomy, giving them real choices, and building something that does not assume the worst about what they can understand or do. From a technical standpoint, we all picked up new skills. Some of us encountered npm, GitHub
Desktop, and collaborative version control for the first time. Others learned how to structure
AI prompts for consistent structured output, how to build and render a 3D scene in a browser,
and how to design a speech-to-text pipeline that feeds into a downstream AI system. The learning curve was steep in places, but the team covered it together.


## What's next for Mind Grove 

	The next stage for our application is to expand its scope. First, we want to be able to connect the application to Apple Watches so that it is able to send daily notifications to the client to remind them to check in and practice their exercises, as well as track the client’s heart rate and provide suggested exercises if it is determined that they are stressed out. A mockup of what these Apple Watch notifications would look like is shown on the current prototype. 

Another feature we want to build out is the therapist dashboard. This would allow the therapist to have an overview of their clients, and be able to suggest modules for them to complete based on what they discussed in therapy. We already have a prototype for this dashboard, however we wish to build it out more extensively.

We also want to add a section to help them with daily tasks throughout the day, not necessarily CBT related, such as adding something to their calendar, checking their email, or making a healthy snack.

Finally, we want to add more practice modules for the patient. As of now, we have seven: Thought Record, Spot the Distortion, Activity Planning, 5-4-3-2-1 Grounding, Gratitude Journal, Mindful Breathing, and Kind Thoughts. However, there are many more that can be added that target different ways of thinking. We especially want to add more that will target anxiety and depression especially, as individuals with ID are more likely to suffer from these disorders.



