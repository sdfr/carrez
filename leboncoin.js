'use strict'

var exports = module.exports = {};

var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

var termine = 0;

function PrixAuMCarre(prix, surface) {
    return Math.round((surface == 0 ? -1 : prix / surface), 0);
}

exports.getInfosAnnonce = function (url) {

    return new Promise(function (resolve, reject) {
        var json = { town: null };
        var errmsg = "";

        request(url, function (error, response, body) {

            if (!error && response.statusCode === 200) {
                // Next, we'll utilize the cheerio library on the returned body which will essentially give us jQuery functionality

                // load page source
                var $ = cheerio.load(body);

                var datas = null;

                // search script containing utag_data infos
                var ts = $('script').each(function (idx, elem) {
                    // control contents
                    if (elem.children != null && elem.children[0] != null && elem.children[0].data != null) {
                        if (elem.children[0].data.includes('utag_data')) {
                            datas = elem.children[0].data;
                            //console.log('utag found at pos '+idx);
                        }
                    }
                });

                // script found ?
                if (datas != null) {
                    // create function to find an element in datas
                    var myFind = function (fieldName) {
                        var re = new RegExp(' ' + fieldName + ' : "(.*)"', 'ig');
                        var result = re.exec(datas);
                        return (result != null ? result[1] : null);
                    };

                    var prix = myFind('prix');
                    var surface = myFind('surface');
                    var pm2 = PrixAuMCarre(prix, surface);

                    // TODO : rajouter tests si on a bien tous les éléments attendus

                    json = {
                        town: myFind('city'),
                        cp: myFind('cp'),
                        type: myFind('type'),
                        prix_m2: pm2
                    };

                    console.log('<p>Infos annonce: </p>');
                    console.log('<p>' + JSON.stringify(json) + '</p>');

                    resolve(json);
                }
                else {
                    reject('Erreur, datas non trouvees');
                }
            }
            else {
                reject('Erreur request');
            }
        });
    });

}
