
var express = require('express');
var ejs = require('ejs');
var parser = require('body-parser');

var leboncoin = require('./leboncoin');
var meilleursagents = require('./meilleursagents');

var app = express();

app.set('view engine', 'ejs');
app.engine('.html', ejs.renderFile);
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());
app.use(express.static(__dirname + '/'));


app.test = function () {
    var url = $('#url_lbc').val();
    alert('url=' + url);
};


app.get('/', function (req, res) {
    // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
    res.render('index.html', { url: "http://www.leboncoin.fr/" });
});


app.post('/', function (req, res) {

    //url = 'https://www.leboncoin.fr/ventes_immobilieres/1081088383.htm?ca=22_s';
    var url = req.body.url_lbc;

    console.log("<p>Debut programme LBC</p>");

    leboncoin.getInfosAnnonce(url)
      .then(meilleursagents.checkBonneAffaire)
      .then(function (json) {
          var bonneAffaire = (json.prix_m2 < json.prix_ok);
          var sBonne = (bonneAffaire ? "bonne" : "mauvaise");
          var sClass = "affaire-" + sBonne;
          var resultat = "<p class='"+sClass+"'>L'annonce <a target='_blank' href='" + url + "'>" + url + "</a> est une " + sBonne + " affaire</p>";
          resultat += "<p>Prix annonce : " + json.prix_m2 + " €/m²</p>"
          resultat += "<p>Prix marché : " + json.prix_ok + " €/m²</p>"
          res.render('index.html', { msg: resultat, url: url });
      })
      .catch(function (err) {
          res.render('index.html', { msg: err });
      });

});

app.listen('3000')

console.log('Aller sur http://localhost:3000/ pour tester');

exports = module.exports = app;
