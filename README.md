# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Website Features

- Users have to get registered and signed-in before using the app.
- Users can only view & edit & delete their own url database (safe ya).
- Users would get redirected into login page if they try to use the app before signing in.
- This tiny app would create a cookie for each user.
- All cookies are encrypted. All passwords are hashed (yes we care).

## Easter Eggs

-   secret word for cookie-session is 'alohomora', the Unlocking Charm in Harry Potter (wizards welcome, muggles tolerated). 
- Users will get redirected to the login page after registering (sweet ya).