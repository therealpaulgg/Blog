# Blog

This is a blog project I initially started on because I wanted to make a blog that I could easily and enjoyably write markdown content in. It uses this markdown editor which I have turned into a separate application here: [https://notepad.paulgellai.dev](https://notepad.paulgellai.dev/). I found a lot of nice front end blogs, but the problem with all of them is that they were statically generated, which I definitely did not want. I also wanted to learn a full JavaScript/TypeScript development stack as I have mostly done Python templated backend stacks in the past. 

It quickly turned into a pretty huge project in which I keep adding new interesting features trying to make this a fully fledged blogging app that pretty much anyone who knows Markdown would be able to use. 

Built with the Node.JS Express framework and Vue.JS.

## Features

- All content is dynamic. It uses a Node.JS backend and a Vue.JS SPA frontend, so every user, post, comment, etc that is created can be changed easily through the interface. This is a key advantage to me over something like Gridsome. It is loaded asynchronously through a single page app so while reading posts there will not be much need to reload (unless the admin changes certain blog settings).
- Posts display basic content such as title, user, date created, date updated, etc. They can be deleted/edited by authors, moderators, or admins.
- Registered users can comment on a blog post.
- Posts are  created with Markdown and have support for rendering tables, KaTeX math syntax, and code syntax highlighting with PrismJS.
- Light/dark mode (a must have nowadays)
- Posts can be tagged with hashtags to put them in certain categories, and users can click these tags to see more posts in this category
- User profiles display basic info about the user, the Gravatar corresponding to the user's email, a bio, posts (if any), and comments (if any).
- There is an administration panel for superadmin users which tweaks certain settings about the blog, and provides a convenient view to see all registered users. This is useful for moderation or promoting/demoting users. You can also delete users.
- Good looking user interface (By my standards anyways. I'm terrible at design.).
- Everything is paginated insofar as that you can press a button to load more posts and comments.

## Screenshots

#### Home Screen Showing Posts

![home screen](https://imgur.com/aZivvCE.png)

#### View after clicking on a tag

![](https://imgur.com/bQtTgHC.png)

#### Viewing a post with a comment

![](https://imgur.com/0ifvOri.png)

#### Editing a blog post

![](https://imgur.com/Pp4ahRS.png)

#### User Profile

![](https://imgur.com/ONpJcEk.png)

#### Admin Panel

![](https://imgur.com/PzqqKqW.png)

#### Adding a comment

![](https://imgur.com/BCk80vz.png)

## Future Plans

- Code refactor to have more reusable code
- Accessibility changes (currently can't click posts without using the mouse, let users use tab)

- Notifications system (for Admins and users)
- Sanitize markdown to allow HTML in posts
  - Markdown is rendered only on the client side currently, so this will need to be looked into.
- Retire Monaco editor with an alternative
  - The Monaco editor, although the excellent code editor that Visual Studio Code is based off of, has given me a lot of problems in this project. I would like to replace it with a different editor or my own solution before. I do not want something like Toast's solution which updates the markdown only when the user stops typing - I want it to render instantly with v-model.
- Enhance editor toolbar (better bold/italic functions)
- Add replies to comments
  - May or may not include an upvote system
- Let authors of posts disable commenting
- UI enhancements (loading animations, easy error messages)
- More blog settings in admin panel (changing the title for example)
- Granular permissions system

## Feedback

If you can, leave some feedback in the issues section as it will help me find issues with the app and fix them quickly. 

## Running the App

There are a few things I have done to attempt to ease the pain of doing things on dev/production. While I don't yet have a foolproof install script for everyone, I have one that can generally be followed along.

### Preface

This guide assumes you have yarn installed as that is the package manager I use. NPM should work fine.

If you're on Windows, make sure you have windows-build-tools and that node-gyp is up to date (especially if using Visual Studio 2019). There's some useful feedback here. [https://github.com/nodejs/node-gyp/issues/1663](https://github.com/)nodejs/node-gyp/issues/1663

### Development

To run in development mode, you must open two terminals, in one `cd ./frontend`, and the other `cd ./backend`. In both terminals, type `yarn` to install dependencies.

To run the frontend development server, type `yarn serve`. To run the backend development server, type `yarn dev`.

### Deploying to a Server

There are many ways you can end up configuring a server to run this application. I will first go over the required steps and then explain how I set up my server.

You will need to create a file named `.env` in the root directory of `backend`. These are variables used by the server. Below is an example file of the variables needed:

(environment is 'staging' in case of staging)

```
RESET_PASSWORD_EMAIL="email@example.com"
RESET_PASSWORD_PASSWORD="supersecurepassword"
ENVIRONMENT="prod"
SECRET_KEY="supersecretkey"
PORT=3000
```

For my server setup, I personally use nginx as a reverse proxy for my backend service, and host the frontend files as static files. 

There are linux shell and powershell scripts I have created so you might be able to get a better idea of how to set things up.