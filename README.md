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

//do stripey things

```

## Sample Usage
```
const FBSignals = require('stripe-fb-node')

const fb = new FBSignals('FB_ACCESS_TOKEN', 'PIXEL_ID');
(async function () {
    const stripe = fb.loadStripe(STRIPE_ACCESS_TOKEN);
    
   
    const [charge_response, pixel_response] = await stripe.charges.create({
        amount: 2000,
        currency: 'usd',
        source: 'tok_mastercard',
        receipt_email: 'kaiser.soze@gmail.com',
        description: 'My First Test Charge (created for API docs)',
    });

    console.log(charge_response);
    console.log(pixel_response);
})();
```

## Sending additional data from the front end
Whether you are using stripe elements or your own implementation of Stripe's checkout, you need to send data to your backend to collect payment using stripe. When sending data to your backend, utilize the `metadata` field on charges to collect additional data fields such as `fbc`,`fbp`,`content_type`, `content_ids`, `contents`. This will ensure all of this information is sent in with the server-side event to facebook. 
