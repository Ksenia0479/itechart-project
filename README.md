# Brief

Recreate the map at this endpoint https://constructgt.com/mapping on this endpoint https://constructgt.com/maps
First priority is the get the map itself working. The info tabs are less important for now. We may actually end up splitting them into a separate app for the sake of loading speed on mobile.

## Google Maps

We need to choose a GMaps wrapper from the many that are available. We want something that has a fair amount of use, and is still maintained. Ideally it should be hooks-based. We're currently only using GMaps in one other place, so consider this early enough to move to a different wrapper if you find a better option.
We're currently using https://www.npmjs.com/package/google-map-react and I'm particularly interested in seeing whether we can move to https://www.npmjs.com/package/@react-google-maps/api (a rewrite of this which is now unmaintained https://www.npmjs.com/package/react-google-maps) to get more functionality, but also other options you think are worth checking out.

## Running the site

I'll write a set of instructions to get the website up and running on your local machine. It's a monorepo, so you don't need to worry about most of the code - for now at least.

Note: This guide requires Windows 10 OS to be installed

- Download and install `GIT` from https://git-scm.com/download/win
- Clone the synergt repo and change into the root directory
- Install packet manager `Miniconda` - it can be installed from
     a. The official website: https://docs.conda.io/en/latest/miniconda.html
     b. Old version which can help to avoid the issues with VS C Runtime availability ("Failed to create menus" during installation) https://repo.continuum.io/miniconda/Miniconda3-4.5.12-Windows-x86_64.exe 
- Run the following command line from `Anaconda prompt` which is available in the start menu
- Then run and wait for all packages to download
>conda-env update -f frontend/setup/env-frontend-new.yaml 
- Run the following command after which the prefix the command prompt should change to "synergt"
>activate synergt
- Install Postgres 11 for Windows from https://www.enterprisedb.com/downloads/postgres-postgresql-downloads 
     a. User "postgres" should have password "postgres"
     b. `pgAdmin` tool may not work well, so please consider the alternatives like `DBeaver`
- Please make sure you have git bin folder and Postgres bin folder in your PATH variable
   SET PATH=C:\Program Files\PostgreSQL\11\bin;C:\Program Files\Git\bin;%PATH%
- Then run from the root synergt directory the following command in order to restore the database
>python -m tools.db_scripts.restore_backup
- Install node, change into "synergt/react" directory
>npm run watch
- Start the webserver from the root directory
>python -m frontend.synergt

The site will now be running on http://localhost:5000

## Code
- For now, please just familiarise yourself with the data used in the existing mapping page
- Javascript code for the /mapping url is at frontend/mapping/static/js/mapping.js
- Please develop your react code will in react/src/components/maps/maps-app.js. This way it is set up to be served up by flask on the /maps endpoint
- API routes you need are GET requests from /api/<model> for the full set of a type and /api/<model>/<id> for single instances. If you want to create a react service to wrap the rest API, feel free to do so building on the code in react/src/components/api

## Key requirements
Important features are:
- jobsites layer
    - GET /api/job_site
	- icon changes depending on job phase
	- popup showing job phase
	- we'd like to add more functions to these popups in future
	- site plans (these apply to neighborhoods, and we could probably work on the backend API to provide a more useable way of delivering them)
        - these are a bottleneck in page loading
		- any options to improve performance here would be big help, especially on mobile
		- perhaps only load at a certain zoom level
		- perhaps load only if in the viewport
		- optimise image resolution for zoom level
		- preprocess the rotation rather than rotating on the fly
	- unscheduled, cities, neighborhoods, and pits layers
        - GET /api/unscheduled_job_site
		- GET /api/city
		- GET /api/neighborhood
		- GET /api/pit
		- All the above should have popups on the markers giving info, and also potentially performing actions like updating their database record
		- These layers should be toggleable

## Future development
	- Implement GraphQL to reduce the amount of data, particularly for big models like JobSite
	- Better continuous integration/continuous deployment process
	- Staging server
	- Jest testing for existing code
