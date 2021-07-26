var express = require('express');
var router = express.Router();
var moment = require('moment');
const { ObjectId } = require('mongodb');

module.exports = function (use) {
  const dbName = 'dbBread';
  const db = use.db(dbName)


  router.get('/', function (req, res, next) {
    const url = req.url == "/" ? "/?page=1" : req.url;
    var page = parseInt(req.query.page) || 1;
    var size = 3;
    var skip = (page - 1) * size;
    let nama = req.query.nama;
    let umur = parseInt(req.query.umur);
    let tinggi = parseFloat(req.query.tinggi)
    let start = req.query.start;
    let end = req.query.end;
    let jomblo = req.query.jomblo;
    let params = []

    if (nama || umur || tinggi || start || end || jomblo) {
      params.push({ nama }, { umur }, { tinggi }, { start }, { end }, { jomblo })
    }

    if (params.length > 0) {
      if (nama) {
        var objectNama = { nama : `${nama}`};
      }
      if (umur) {
        var objectUmur = { umur: `${umur}` };
      }
      if (tinggi) {
        var objectTinggi = { tinggi: `${tinggi}` };
      }
      if (jomblo) {
        var objectJomblo = { jomblo };
      }
      let find = {
        ...objectNama,
        ...objectUmur,
        ...objectTinggi,
        ...objectJomblo,
      };
      if (start && end) {
        let gte = new Date(start);
        let lt = new Date(end);
        var date = { ttl: { $gte: gte, $lt: lt } };
        find = {
          ...objectNama,
          ...objectUmur,
          ...objectTinggi,
          ...objectJomblo,
          ...date,
        };
      }
      console.log(find)
      db.collection('siswa').find(find).toArray((err, result) => {
        let totalPage = result.length;
        let pages = Math.ceil(totalPage/3)
        db.collection('siswa').find(find).limit(size).skip(skip).toArray()
          .then(data => {
            console.log(data)
            res.render('../views/home/list.ejs', {
              data: data,
              moment: moment,
              url,
              page,
              pages,
              nama,
              umur,
              tinggi,
              start,
              end,
              jomblo,
            });
          })
          .catch(error => console.error(error))


      })


    }
    db.collection('siswa').find().toArray((err, result) => {
      let totalPage = result.length;
      let pages = Math.ceil(totalPage / 3)
      db.collection('siswa').find().limit(size).skip(skip).toArray()
        .then(data => {
          console.log(data)
          res.render('../views/home/list.ejs', {
            data: data,
            moment: moment,
            url,
            page,
            pages,
            nama,
            umur,
            tinggi,
            start,
            end,
            jomblo,
          });
        })
        .catch(error => console.error(error))


    })
  })




  router.get('/add', function (req, res, next) {
    res.render('../views/add.ejs')
  })
  router.post('/add', function (req, res, next) {
    db.collection('siswa').insertOne({ nama: req.body.nama, umur: req.body.umur, tinggi: req.body.tinggi, ttl: new Date(`'${req.body.ttl}'`), jomblo: req.body.jomblo })
      .then(result => {
        console.log(result, 'data telah ditambahkan')
        res.redirect('/')
      })
      .catch(error => console.error(error))
  })

  router.get('/delete/:id', function (req, res) {
    db.collection('siswa').deleteOne({ _id: ObjectId(`${req.params.id}`) })
      .then(res.redirect('/'))
  })

  router.get('/edit/:id', function (req, res) {
    db.collection('siswa').find({ _id: ObjectId(`${req.params.id}`) }).toArray()
      .then(result => {
        res.render('../views/edit.ejs', { data: result, moment: moment })
      })
  })
  router.post('/edit/:id', function (req, res) {
    db.collection('siswa').updateOne(
      {
        _id: ObjectId(`${req.params.id}`)
      }, { $set: { nama: req.body.nama, umur: req.body.umur, tinggi: req.body.tinggi, ttl: new Date(`'${req.body.ttl}'`), jomblo: req.body.jomblo } })
      .then(result => {
        console.log(result, 'data telah diubah')
        res.redirect('/')
      })
      .catch(error => console.error(error))
  })



  return router;
}