exports.init = function(app) {
  
  app.get('/', function(req, res){

	res.render('index', { games: global.games });
  });
}
