'use strict'

var exports = module.exports = {};

var request = require('request');


function CleanURL(strUrl) {
    var ref = strUrl.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return ref;
}


exports.checkBonneAffaire = function (json) {
    return new Promise(function (resolve, reject) {
        console.log("checkBonneAffaire, json="+JSON.stringify(json));
        if (json != null && json.town != null) {
            var newURL = CleanURL(json.town) + '-' + json.cp;
            var urlAgent = 'http://www.meilleursagents.com/prix-immobilier/' + newURL + '/';

            request(urlAgent, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var expr = "<meta .*Prix m2 "+json.type+" : ([0-9]+) .*\/>";
                    var re = new RegExp(expr, 'gm');
                    var result = re.exec(body);
                    if (result != null) {
                        json.prix_ok = result[1];
                        resolve(json);
                    }
                    else {
                        //remonter erreur : prix non trouvé
                        reject('erreur : prix non trouve');
                    }
                }
                else {
                    //remonter erreur : pas de requête/requête en erreur
                    reject('erreur : requete');
                }
            });
        }
        else {
            reject('json ou ville null');
        }
    });

}

