var httpSignature = require('http-signature');
var request = require('request');
var errors = require('./errors');

module.exports = {
  addToMany: function(activity, feeds, callback) {
    /**
     * Add one activity to many feeds
     * @method addToMany
     * @memberof StreamClient.prototype
     * @since 2.3.0
     * @param  {object}   activity The activity to add
     * @param  {Array}   feeds    Array of objects describing the feeds to add to
     * @param  {requestCallback} callback Callback called on completion
     * @return {object}            XHR request object
     */
    var req = this.makeSignedRequest({
      url: 'feed/add_to_many/',
      body: {
        activity: activity,
        feeds: feeds,
      },
    }, callback);

    return req;
  },

  followMany: function(follows, callback)  {
    /**
     * Follow multiple feeds with one API call
     * @method followMany
     * @memberof StreamClient.prototype
     * @since 2.3.0
     * @param  {Array}   follows  The follow relations to create
     * @param  {requestCallback} callback Callback called on completion
     * @return {object}            XHR request object
     */
    var req = this.makeSignedRequest({
      url: 'follow_many/',
      body: follows,
    }, callback);

    return req;
  },

  makeSignedRequest: function(kwargs, cb) {
    /**
     * Method to create request to api with application level authentication
     * @method makeSignedRequest
     * @memberof StreamClient.prototype
     * @since 2.3.0
     * @access private
     * @param  {object}   kwargs Arguments for the request
     * @param  {requestCallback} cb     Callback to call on completion
     * @return {object}          XHR request object
     */
    if (!this.apiSecret) {
      throw new errors.SiteError('Missing secret, which is needed to perform signed requests, use var client = stream.connect(key, secret);');
    }

    this.send('request', 'post', kwargs, cb);

    kwargs.url = this.enrichUrl(kwargs.url);
    kwargs.json = true;
    kwargs.method = 'POST';
    kwargs.headers = { 'X-Api-Key': this.apiKey };

    var callback = this.wrapCallback(cb);
    var req = request(kwargs, callback);

    httpSignature.sign(req, {
      algorithm: 'hmac-sha256',
      key: this.apiSecret,
      keyId: this.apiKey,
    });

    return request;
  },
};