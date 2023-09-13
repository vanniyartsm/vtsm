
var express = require('express')
    , app = express()
    , home = require('./home/home')
    , quberos = require('./register/register')
    , auth = require('./auth/auth')
    , points = require('./units/index')
    , wallet = require('./wallet/index')
    , profile = require('./profile/index')
    , admin = require('./admin/admin')
    , downline = require('./downline/downline')
    , support = require('./support/index')
    , redirect = require('./common/index')
    , renderConstants = require('../commons/render.constants')
    , initFilter = require('../commons/filter')
    , site = require('./pages/site');

var web = '/web';

app.all(web + '/auth/index');
app.use('/', home);
//app.use('/quberos', quberos);
app.use(web + '/auth', auth);
app.use(web + '/points', initFilter.webValidation, points);
app.use(web + '/profile', initFilter.webValidation, profile);
app.use(web + '/admin', initFilter.webValidation, admin);
app.use(web + '/downline', initFilter.webValidation, downline);
app.use(web + '/wallet', initFilter.webValidation, wallet);

app.use(web + '/support', initFilter.webValidation, support);

app.use(web + '/site', initFilter.webValidation, site);

/*app.use(function(req, res, next) {
    res.status(404).render(renderConstants.FRONT_PAGE, { layout: 'layout', req: req });
});*/
  
module.exports = app;
