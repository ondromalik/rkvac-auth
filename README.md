# Verifier`s App
This app provides access to online database of classes, teachers and departments created as an example web service. The app is protected by authentication with RKVAC attributes.

## Access permission:
Access permission are divided into 3 levels, based on attributes that user holds.
- db-admin - administrator access
- db-user - user access
- db-guest - guest access
- Revoking user
- Logging

## To do:

## Usage:
- build RKVAC C app directly in project folder
- initialize RKVAC app
- upload ie_sk.dat, ra_pk.dat and ra_parameters.dat into data/Verifier/
- create new epoch (optional activate the epoch with RA)
- for starting server run command:
  `npm run serverstart`
- server runs on http://localhost:8443

## Dependencies:
- nodeJS, npm
- npm -i
- WebCard: https://github.com/cardid/webcard

## Contact:
xmalik19@stud.feec.vutbr.cz