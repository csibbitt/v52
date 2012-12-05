var INITIAL_PING_TIMEOUT, KEEPALIVE_PING_TIMEOUT, isPong, sendPing,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (!window.WEB_SOCKET_SWF_LOCATION) {
  window.WEB_SOCKET_SWF_LOCATION = '/assets/firehose/WebSocketMain.swf';
}

INITIAL_PING_TIMEOUT = 2000;

KEEPALIVE_PING_TIMEOUT = 20000;

Firehose.WebSocket = (function(_super) {

  __extends(WebSocket, _super);

  WebSocket.prototype.name = function() {
    return 'WebSocket';
  };

  WebSocket.supported = function() {
    return window.WebSocket != null;
  };

  function WebSocket(args) {
    this._clearKeepalive = __bind(this._clearKeepalive, this);

    this._restartKeepAlive = __bind(this._restartKeepAlive, this);

    this._cleanUp = __bind(this._cleanUp, this);

    this._error = __bind(this._error, this);

    this._close = __bind(this._close, this);

    this._message = __bind(this._message, this);

    this.stop = __bind(this.stop, this);

    this.sendStartingMessageSequence = __bind(this.sendStartingMessageSequence, this);

    this._lookForInitialPong = __bind(this._lookForInitialPong, this);

    this._open = __bind(this._open, this);

    this._request = __bind(this._request, this);

    var _base;
    WebSocket.__super__.constructor.call(this, args);
    (_base = this.config).webSocket || (_base.webSocket = {});
    this.config.webSocket.connectionVerified = this.config.connectionVerified;
  }

  WebSocket.prototype._request = function() {
    this.socket = new window.WebSocket("ws:" + this.config.uri + "?" + ($.param(this.config.params)));
    this.socket.onopen = this._open;
    this.socket.onclose = this._close;
    this.socket.onerror = this._error;
    return this.socket.onmessage = this._lookForInitialPong;
  };

  WebSocket.prototype._open = function() {
    return sendPing(this.socket);
  };

  WebSocket.prototype._lookForInitialPong = function(event) {
    this._restartKeepAlive();
    if (isPong((function() {
      try {
        return JSON.parse(event.data);
      } catch (e) {
        return {};
      }
    })())) {
      if (this._lastMessageSequence != null) {
        return this.sendStartingMessageSequence(this._lastMessageSequence);
      } else {
        return this.config.webSocket.connectionVerified(this);
      }
    }
  };

  WebSocket.prototype.sendStartingMessageSequence = function(message_sequence) {
    this._lastMessageSequence = message_sequence;
    this.socket.onmessage = this._message;
    this.socket.send(JSON.stringify({
      message_sequence: message_sequence
    }));
    this._needToNotifyOfDisconnect = true;
    return Firehose.Transport.prototype._open.call(this);
  };

  WebSocket.prototype.stop = function() {
    return this._cleanUp();
  };

  WebSocket.prototype._message = function(event) {
    var frame;
    frame = this.config.parse(event.data);
    this._restartKeepAlive();
    if (!isPong(frame)) {
      try {
        this._lastMessageSequence = frame.last_sequence;
        return this.config.message(this.config.parse(frame.message));
      } catch (e) {

      }
    }
  };

  WebSocket.prototype._close = function(event) {
    if (event != null ? event.wasClean : void 0) {
      return this._cleanUp();
    } else {
      return this._error(event);
    }
  };

  WebSocket.prototype._error = function(event) {
    this._cleanUp();
    if (this._needToNotifyOfDisconnect) {
      this._needToNotifyOfDisconnect = false;
      this.config.disconnected();
    }
    if (this._succeeded) {
      return this.connect(this._retryDelay);
    } else {
      return this.config.failed(this);
    }
  };

  WebSocket.prototype._cleanUp = function() {
    this._clearKeepalive();
    if (this.socket != null) {
      this.socket.onopen = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.onmessage = null;
      this.socket.close();
      return delete this.socket;
    }
  };

  WebSocket.prototype._restartKeepAlive = function() {
    var doPing, setNextKeepAlive,
      _this = this;
    doPing = function() {
      sendPing(_this.socket);
      return setNextKeepAlive();
    };
    setNextKeepAlive = function() {
      return _this.keepaliveTimeout = setTimeout(doPing, KEEPALIVE_PING_TIMEOUT);
    };
    this._clearKeepalive();
    return setNextKeepAlive();
  };

  WebSocket.prototype._clearKeepalive = function() {
    if (this.keepaliveTimeout != null) {
      clearTimeout(this.keepaliveTimeout);
      return this.keepaliveTimeout = null;
    }
  };

  return WebSocket;

})(Firehose.Transport);

sendPing = function(socket) {
  return socket.send(JSON.stringify({
    ping: 'PING'
  }));
};

isPong = function(o) {
  return o.pong === 'PONG';
};

