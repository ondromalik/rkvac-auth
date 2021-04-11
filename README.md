# Verifier`s App
This app provides access to online database of classes, teachers and departments created as an example web service. The app is protected by authentication with RKVAC attributes.

## Access permissions:
Access permission are divided into 3 levels, based on attributes that user holds.
- admin - administrator access (setting up RKVAC, access logs, creating/deleting departments)
- teacher - teacher access (creating/editing/deleting classes, teachers) 
- student - student access (read-only)

## Dependencies:
- nodeJS, npm
- WebCard: https://github.com/cardid/webcard

## Installation:
- build RKVAC C app directly in project folder
- run (for installing node_modules):
  
  `npm install`
- for starting the server run command:
  
  `npm run serverstart`
- server runs on https://localhost:8443

## User manual:
- in progress

## Contact:
xmalik19@stud.feec.vutbr.cz