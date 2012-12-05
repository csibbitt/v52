var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Firehose.Transport = (function() {

  Transport.supported = function() {
    return false;
  };

  function Transport(config) {
    if (config == null) {
      config = {};
    }
    this.getLastMessageSequence = __bind(this.getLastMessageSequence, this);

    this._close = __bind(this._close, this);

    this._open = __bind(this._open, this);

    this._error = __bind(this._error, this);

    this.connect = __bind(this.connect, this);

    this.config = config;
    this._retryDelay = 3000;
  }

  Transport.prototype.connect = function(delay) {
    if (delay == null) {
      delay = 0;
    }
    setTimeout(this._request, delay);
    return this;
  };

  Transport.prototype.name = function() {
    throw 'not implemented in base Transport';
  };

  Transport.prototype.stop = function() {
    throw 'not implemented in base Transport';
  };

  Transport.prototype._request = function() {
    throw 'not implemented in base Transport';
  };

  Transport.prototype._error = function(event) {
    if (this._succeeded) {
      this.config.disconnected();
      return this.connect(this._retryDelay);
    } else {
      return this.config.failed(this);
    }
  };

  Transport.prototype._open = function(event) {
    this._succeeded = true;
    return this.config.connected(this);
  };

  Transport.prototype._close = function(event) {
    return this.config.disconnected();
  };

  Transport.prototype.getLastMessageSequence = function() {
    return this._lastMessageSequence || 0;
  };

  return Transport;

}).call(this);
