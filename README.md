# Momentum Dashboard

Dashboard project for cafe momentum.

## Data Processing

The data for this project lives in `/data`. To process the source files for the application, run

`cd data; npm install; npm run process-data`

## Development

The application is a super simple project written in vanilla es6 with no external dependencies, currently designed for flexible embedding.

If you are using VSCode, to run this code locally, use extension `Live Server`, navigate to `dist/index.html` and click `go live` on the bottom right of your VSCode window. A simple server will open at `<port>/dist/index.html` where live frontend changes can be viewed. 

## Deployment

This application is hosted on Siteground as part of the January Advisors website. To deploy this application:

- Connect to the januaryadvisors.com ftp server using the credentials on 1pw under "JA Logic Models FTP"
- In the cafe-momentum directory, replace the assets, fonts, and/or index.html as needed

## Maintenance and Operations

### Updating data

The data in `/data` comes from https://docs.google.com/spreadsheets/d/1OxWUeeWrLmXPf9dQKg9YiAl5Gmi50s0Dl4OR3tVwzS8/edit?gid=1482534373#gid=1482534373
If updates to the data are made to the spreadsheet, download the sheet(s) where changes were made and replace the respective CSVs in the data directory. (Note: if there are multiple sheets with the same name, the sheet with no date in the name is the current sheet; the dates on some sheet names represent the date we switched to a newer sheet)

### Web Locations

Note: if you have visited a website where the logic model is used in an iframe, you may need to clear your cache to see updates after deployments.

- https://www.januaryadvisors.com/logic-models/cafe-momentum
- https://www.momentumadvisory.co/logic-model
- https://cafemomentum.org/cafe-momentum-logic-model
