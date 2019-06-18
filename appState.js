var app_state = {};

var registerAppState = module.exports.registerAppState = function (key, obj) {
    if (!['number', 'string'].includes(typeof key)) {
        return;
    }
    app_state[key] = obj;
}

var getAppState = module.exports.getAppState = function (key) {
    if (!['number', 'string'].includes(typeof key)) {
        return null;
    }
    return app_state[key];
}