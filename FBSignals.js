const bizSdk = require('facebook-nodejs-business-sdk');
const ServerEvent = bizSdk.ServerEvent;
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const CustomData = bizSdk.CustomData;
const Content = bizSdk.Content;
const currency_decimals = require('./currency.json');

class FBSignals {
    constructor(fb_access_token, pixel_id) {
        this.access_token = fb_access_token;
        this.pixel_id =  pixel_id;
        this.api = bizSdk.FacebookAdsApi.init(access_token);
    }

    loadStripe(token) {
        this.stripe = require('stripe')(token);

        //payment intents override
        const intent = this.stripe.paymentIntents.create;
        const previous_intent = intent;
        this.stripe.paymentIntents.create = async function () {
            const intent_response = previous_intent.apply(this, arguments);
            await this.sendEvent(intent_response);
            return intent_response;
        };

        //charges override

        const charge = this.stripe.charges.create;
        const previous_charge = charge;
        this.stripe.charges.create = async function () {
            const charge_response = await previous_charge.apply(this, arguments);
            await this.sendEvent(charge_response);
            return charge_response;
        }
        return this.stripe;

    }
    async sendEvent(stripe_event) {
        let {
            amount,
            currency,
            customer,
            created,
            metadata
        } = stripe_event;
        currency = currency.toUpperCase();
        if (currency_decimals[currency]) {
            amount = amount / (Math.pow(10, currency_decimals[currency]));
        }
        const userData = new UserData();
        let customer_object;
        if (customer) {
            customer_object = await this.stripe.customers.retrieve(customer);
        }
        const email = this._getEmail(customer_object, stripe_event);
        const phone = this._getPropertyFromCustomerOrBilling(customer_object, stripe_event, 'phone');
        const {
            city,
            state,
            country,
            postal_code
        } = this._getPropertyFromCustomerOrBilling(customer_object, stripe_event, 'address');
        if (email) {
            userData.setEmail(email);
        }
        if (phone) {
            userData.setPhone(phone);
        }
        if (city) {
            userData.setCity(city);
        }
        if (state) {
            userData.setState(phone);
        }
        if (country) {
            userData.setCountry(phone);
        }
        if (postal_code) {
            userData.setZip(postal_code);
        }
        if (metadata['fbp']) {
            userData.setFbp(metadata['fbp'])
        }
        if (metadata['fbc']) {
            userData.setFbc(metadata['fbc'])
        }

        const customData = (new CustomData())
            .setCurrency(currency)
            .setValue(amount / 100);
        if (metadata['content_type'] && (metadata['content_ids'] || metadata['contents'])) {
            customData.setContentType(metadata['content_type']);
            customData.setContentIDs(metadata['content_ids']);
            customData.setContents(metadata['contents'] || [].map(c=> new Content(c.id, c.quantity, c.item_price)));
        }
        const serverEvent = (new ServerEvent())
            .setEventName('Purchase')
            .setEventTime(created)
            .setUserData(userData)
            .setCustomData(customData);
        const eventsData = [serverEvent];
        const eventRequest = (new EventRequest(this.access_token, this.pixel_id))
            .setEvents(eventsData);

        return await eventRequest.execute();

    }
    _getPropertyFromCustomerOrBilling(customer_object, stripe_event, property_name) {
        return customer_object && customer_object[property_name] ? customer_object[property_name] : "" ||
            stripe_event.billing_details && stripe_event.billing_details[property_name] ? stripe_event.billing_details[property_name] : "";

    }
    _getEmail(customer_object, stripe_event) {
        return this.getPropertyFromCustomerOrBilling(customer_object, stripe_event, 'email') ||
            stripe_event.receipt_email

    }

}

module.exports = {FBSignals}

