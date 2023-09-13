/**
 * Created by senthil on 02/27/19.
 */

import express from 'express';
const app = express();
const _ = require('lodash')
//const axios = require('axios');
const FormData = require('form-data');

// const instance = axios.create({
//     baseURL: 'https://api.statuspage.io/v1/pages/bxnmslqtfrb7/components.json',
//     timeout: 1000,
//     headers: {'Authorization': 'db0374ec-99f9-4a88-b0fc-8e2ab28034ba'}
//     });
      
/* GET ping. */
app.get('/', function(req, res, next) {
   
    /*axios.get('https://api.statuspage.io/v1/pages/bxnmslqtfrb7/components.json', {
    timeout: 10000,
    headers: {'Authorization': 'db0374ec-99f9-4a88-b0fc-8e2ab28034ba'}
    })   .then(function (response) {
       console.info('response = ', response);
        res.send(response);
   });*/
   /*var bodyFormData = new FormData();
   bodyFormData.append('email', 'pganeshraja@yapstone.com');
   bodyFormData.append('password', 'P8754102636p$');
   
   axios({
    method: 'post',
    url: 'https://manage.statuspage.io/login',
    data: bodyFormData,
    config: { headers: {'Content-Type': 'text/html' }}
    })
    .then(function (response) {
        //handle success
        //console.log(response);
        axios.get('https://manage.statuspage.io/pages/bxnmslqtfrb7/component_uptime_editor/5jsd8g1k8tsv?page_count=3&page_start=1', {
        timeout: 10000
    })   .then(function (response) {
       //console.info('response = ', response);
        res.send(response.data);
   });
    })*/
    
});

module.exports = app;