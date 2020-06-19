# stripe-fb-node
## What it is
`stripe-fb-node` is a module that simplifies sending Facebook server-side events while collecting payments from Stripe. It will work with whatever version of Stripe's nodejs module you are currently using and does **not** change any of the behavior of Stripe's payment api. 

## Installation and Requirements
### Prereqs:
- You have a Facebook pixel
- You have a Facebook access token capable of sending server-side events
- You are either already using Stripe, or have an access token to start using Stripe.
### Installation:
```
//Skip this step if you are already integrated with stripe
npm install stripe

//Do this step either way
npm install stripe-fb-node

```


## How to use it
### Existing stripe integrations
**From** :
```
const stripe = require('stripe')('<stripe_access_token>');
```

**To**: 
```
const FbSignals = require('fb-stripe-node');
const stripe = (new FbSignals('<fb_access_token>', '<fb_pixel_id>')).loadStripe('<stripe_access_token>');
```

### New Stripe Integrations
```
const fb = new FbSignals('<fb_access_token>', '<fb_pixel_id>');

const stripe = fb.loadStripe('<stripe_access_token>');

```
