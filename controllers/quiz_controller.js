var models=require('../models/models.js');
var Promise=require('promise');

exports.load=function(req,res,next,quizId){
   models.Quiz.find({
                     where:{id:Number(quizId)},
                     include:[{model:models.Comment}]
                 }).then(
       function(quiz){
             if(quiz){ req.quiz=quiz;
                       next();
                     }
             else{ next(new Error('No existe quizId='+quizId));}
          }
        ).catch(function(error){next(error);});
  };

exports.index=function(req,res){
 if(req.query.search)
 {
  var cadena=req.query.search;
  cadena=cadena.replace(/\s/g,"%");
  cadena="%"+cadena+"%";
  models.Quiz.findAll({
               where:["pregunta like ?",cadena],
               order:[['pregunta','ASC']]
              }).then(function(quizes){
                                        res.render('quizes/buscador.ejs',{quizes:quizes,errors:[]});
                                      }
                     ).catch(function(error){next(error);})

 }
 else
 {

  models.Quiz.findAll().then(function(quizes){
     res.render('quizes/index.ejs',{quizes:quizes,errors:[]});
    }).catch(function(error){next(error);})
 }

};

exports.show=function(req,res){
  models.Quiz.find(req.params.quizId).then(
     function(quiz){res.render('quizes/show',{quiz:req.quiz,errors:[]});
     })
    };

exports.answer=function(req,res){
  var resultado='Incorrecto';
  if(req.query.respuesta===req.quiz.respuesta){
     resultado='Correcto';
   }
    res.render('quizes/answer',{quiz:req.quiz,respuesta:resultado,errors:[]});
};


exports.new=function(req,res){
   var quiz=models.Quiz.build(
      {pregunta:"Pregunta",respuesta:"Respuesta",tematica:"otro"}
     );
res.render('quizes/new',{quiz:quiz,errors:[]});
 };


exports.create=function(req,res){
 var quiz=models.Quiz.build(req.body.quiz);

 quiz
 .validate()
 .then(
  function(err){
                 if(err){
                         res.render('quizes/new',{quiz:quiz,errors:err.errors});
                        }
                 else{
                       quiz.save({fields:["pregunta","respuesta","tematica"]}).then(
                                           function(){res.redirect('/quizes')})
                     }
              }
            );

 };

exports.edit=function(req,res){
  var quiz=req.quiz;
  res.render('quizes/edit',{quiz:quiz,errors:[]});
};

exports.update=function(req,res){
 req.quiz.pregunta=req.body.quiz.pregunta;
 req.quiz.respuesta=req.body.quiz.respuesta;
 req.quiz.tematica=req.body.quiz.tematica;

 req.quiz
 .validate()
 .then(
       function(err){
         if(err){
                  res.render('quizes/edit',{quiz:req.quiz,errors:err.errors});
                }
         else{
              req.quiz
              .save({fields:["pregunta","respuesta","tematica"]})
              .then(function(){res.redirect('/quizes');});
             }
       }
   );
 };

exports.destroy=function(req,res){
  req.quiz.destroy().then(function(){
   res.redirect('/quizes');
  }).catch(function(error){next(error)});
};

exports.stadistics=function(req,res){
 var resultado={};

  var p=models.Quiz.count();
  var c=models.Comment.count();
  var psin=models.Quiz.count({where:['"id" NOT IN(SELECT "QuizId" FROM "Comments")']});
  var pcon=models.Quiz.count({where:['"id" IN(SELECT "QuizId" FROM "Comments")']});

  Promise.all([p,c,psin,pcon])
  .then(function(result){
        resultado.preguntas=result[0];
        resultado.comentarios=result[1];
        resultado.preguntassin=result[2];
        resultado.preguntascon=result[3];
        if(resultado.preguntas>0){resultado.media=resultado.comentarios/resultado.preguntas;}
        res.render('estadisticas',{resultado:resultado,errors:[]});
      },function(error){next(error);}
    ).catch(function(error){next(error);});

};

exports.author=function(req,res){
  res.render('author',{autor:'Rosa Figal',errors:[]});
};

