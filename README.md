#Build and deploy a backend

**Author**: Grace Provost & Jack Lomax
**Version**: 1.0.0

## Overview
<!-- Provide a high level overview of what this application is and why you are building it, beyond the fact that it's an assignment for a Code Fellows 301 class. (i.e. What's your problem domain?) 


Include a link to your live site if it's deployed. -->

CREATE UNIQUE INDEX CONCURRENTLY unique_isbn ON books (isbn);
CREATE INDEX
ALTER TABLE books ADD CONSTRAINT unique_isbn_index UNIQUE USING INDEX unique_isbn;

## Getting Started
<!-- What are the steps that a developer must take in order to build this app on their own machine and get it running? -->

## Architecture
<!-- Provide a detailed description of the application design. What technologies (languages, libraries, etc) you're using, and any other relevant design information. -->

## Credits and Collaborations
<!-- Give credit (and a link) to other people or resources that helped you build this application. -->

1. As a developer, I want to seed my local development database with books so I have data to test my development application with.
Your books table should include a book_id as the primary key plus the following properties: author, title, isbn, image_url, and description
Using the provided JSON data, manually enter each record into your PostgreSQL books table from the PostgreSQL Shell on your machine.
STRETCH GOAL: instead of manually entering in the data, use the npm module fs in your server to load your database. Make sure you move the data file into your server directory so it will be available when you deploy to Heroku.

2. As a developer, I want the client to have the ability to request all resources from the database through a RESTful endpoint.
Create a new endpoint at GET /api/v1/books which will retrieve an array of book objects from the database, limited to only the book_id, title, author, and image_url.
STRETCH GOAL: Create a new endpoint that will retrieve a single book based on its id.

3.As a developer, I want to deploy the backend API to a hosting service (like heroku) so that other developers may build their own frontend interfaces for this application.